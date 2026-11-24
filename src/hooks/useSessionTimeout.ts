import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
/** Warn this long before the inactivity logout. */
const WARN_BEFORE_MS = 5 * 60 * 1000;
/** Cross-tab channel: activity in one tab keeps every tab signed in. */
const CHANNEL_NAME = 'ebizearn-session';
/** Don't spam other tabs — at most one activity broadcast per 10s. */
const BROADCAST_THROTTLE_MS = 10_000;

export interface SessionWarning {
  secondsLeft: number;
  staying: boolean;
  error: string | null;
}

/**
 * Auto-logout after Super Admin-configured inactivity timeout.
 * Reads sessionTimeoutMinutes from GET /v1/config/brand (0 = disabled).
 * Warns 5 minutes before logout with a persistent in-app countdown banner
 * (returned as `warning` — the caller renders it, never a native confirm);
 * "Stay signed in" refreshes the token in place via POST /auth/refresh
 * (falling back to re-validating via /auth/me), so open forms keep their
 * state. Activity syncs across tabs via BroadcastChannel.
 */
export function useSessionTimeout() {
  const { user, logout, refreshSession } = useAuth();
  const [warning, setWarning] = useState<SessionWarning | null>(null);

  const timeoutMinutes = useRef(30);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastBroadcast = useRef(0);
  const stayingRef = useRef(false);
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  const refreshRef = useRef(refreshSession);
  refreshRef.current = refreshSession;

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    logoutTimer.current = null;
    warnTimer.current = null;
    countdownTimer.current = null;
  }, []);

  const doLogout = useCallback(() => {
    clearTimers();
    logoutRef.current();
    window.location.href = '/login?timeout=1';
  }, [clearTimers]);

  const showWarning = useCallback(
    (msLeft: number) => {
      let left = Math.max(1, Math.ceil(msLeft / 1000));
      setWarning({ secondsLeft: left, staying: false, error: null });
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      countdownTimer.current = setInterval(() => {
        left -= 1;
        if (left <= 0) {
          doLogout();
          return;
        }
        setWarning((w) => (w ? { ...w, secondsLeft: left } : w));
      }, 1000);
    },
    [doLogout],
  );

  const reset = useCallback(() => {
    clearTimers();
    setWarning(null);
    const mins = timeoutMinutes.current;
    if (!mins || mins <= 0) return; // disabled
    const ms = mins * 60 * 1000;
    logoutTimer.current = setTimeout(doLogout, ms);
    if (ms <= WARN_BEFORE_MS) {
      showWarning(ms);
    } else {
      warnTimer.current = setTimeout(() => showWarning(WARN_BEFORE_MS), ms - WARN_BEFORE_MS);
    }
  }, [clearTimers, doLogout, showWarning]);

  const broadcast = useCallback((type: 'activity' | 'stay') => {
    const ch = channelRef.current;
    if (!ch) return;
    if (type === 'activity') {
      const now = Date.now();
      if (now - lastBroadcast.current < BROADCAST_THROTTLE_MS) return;
      lastBroadcast.current = now;
    }
    try {
      ch.postMessage({ type });
    } catch {
      /* channel closed — ignore */
    }
  }, []);

  /** Extend the session in place; on success every tab's timer resets. */
  const stay = useCallback(() => {
    if (stayingRef.current) return;
    stayingRef.current = true;
    setWarning((w) => (w ? { ...w, staying: true, error: null } : w));
    const failed = () => {
      stayingRef.current = false;
      setWarning((w) =>
        w
          ? { ...w, staying: false, error: 'Could not extend your session. Please sign in again before the countdown ends.' }
          : w,
      );
    };
    refreshRef
      .current()
      .then((ok) => {
        if (ok) {
          stayingRef.current = false;
          broadcast('stay');
          reset();
        } else {
          failed();
        }
      })
      .catch(failed);
  }, [broadcast, reset]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      setWarning(null);
      return;
    }

    // Fetch the configured timeout once per session.
    api
      .get('/config/brand')
      .then((r) => {
        timeoutMinutes.current = Number(
          (r.data as { data?: { sessionTimeoutMinutes?: number } })?.data?.sessionTimeoutMinutes ?? 30,
        );
        reset();
      })
      .catch(() => {
        /* keep default */
      });

    // Cross-tab activity sync — activity in one tab keeps every tab alive.
    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        ch = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = ch;
        ch.onmessage = (e) => {
          if (e.data?.type === 'activity' || e.data?.type === 'stay') reset();
        };
      } catch {
        ch = null;
      }
    }

    const onActivity = () => {
      reset();
      broadcast('activity');
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    reset();

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimers();
      if (ch) {
        ch.close();
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { warning, stay, signOutNow: doLogout };
}
