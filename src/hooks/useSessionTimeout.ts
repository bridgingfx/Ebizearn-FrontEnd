import { useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;

/**
 * Auto-logout after Super Admin-configured inactivity timeout.
 * Reads sessionTimeoutMinutes from GET /v1/config/brand (0 = disabled).
 * Shows a 60-second warning before logging out.
 */
export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const timeoutMinutes = useRef<number>(30);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch the configured timeout once per session.
    api.get('/v1/config/brand').then((r) => {
      const mins = Number((r.data as { data?: { sessionTimeoutMinutes?: number } })?.data?.sessionTimeoutMinutes ?? 30);
      timeoutMinutes.current = mins;
      reset();
    }).catch(() => { /* keep default */ });

    const doLogout = () => {
      logout();
      window.location.href = '/login?timeout=1';
    };

    const showWarning = () => {
      // 60s warning via a native confirm — simple and impossible to miss.
      const stay = window.confirm('You will be logged out in 60 seconds due to inactivity. Click OK to stay signed in.');
      if (stay) reset();
      else doLogout();
    };

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      const mins = timeoutMinutes.current;
      if (!mins || mins <= 0) return; // disabled
      const ms = mins * 60 * 1000;
      if (ms <= 60000) {
        timer.current = setTimeout(doLogout, ms);
      } else {
        warningTimer.current = setTimeout(showWarning, ms - 60000);
        timer.current = setTimeout(doLogout, ms);
      }
    };

    const onActivity = () => reset();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    reset();

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      if (timer.current) clearTimeout(timer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
}
