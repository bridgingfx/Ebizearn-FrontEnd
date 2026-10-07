import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';

const SESSION_KEY = 'ebizearn_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Logs every client-side navigation to POST /v1/track/page-view.
 * Fire-and-forget: tracking must never break the app.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();
    const path = location.pathname + location.search;
    api
      .post('/v1/track/page-view', {
        path,
        referrer: document.referrer || null,
        session_id: sessionId,
      })
      .then((r) => {
        const sid = (r.data as { session_id?: string })?.session_id;
        if (sid && sid !== sessionId) sessionStorage.setItem(SESSION_KEY, sid);
      })
      .catch(() => {
        /* tracking is best-effort */
      });
  }, [location.pathname, location.search]);
}
