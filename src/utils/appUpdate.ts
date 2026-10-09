/**
 * Picks up new deploys without a manual cache clear.
 *
 * Every build writes /version.json with its build id (vite.config.ts). An
 * open tab checks it on focus and every few minutes; once a newer build is
 * live, the next in-app navigation does a full page load (so the user lands
 * on fresh code without losing what they are typing) and listeners can show
 * a "Refresh" prompt. A lazy chunk that vanished in the deploy reloads once.
 */
const CURRENT = import.meta.env.VITE_BUILD_ID as string | undefined;
const CHECK_EVERY_MS = 5 * 60 * 1000;
const RELOAD_GUARD = 'ebz-chunk-reload';

let updateReady = false;
const listeners = new Set<() => void>();

export const isUpdateReady = () => updateReady;

export const onUpdateReady = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const markReady = () => {
  if (updateReady) return;
  updateReady = true;
  listeners.forEach((fn) => fn());
};

const check = async () => {
  if (updateReady || !CURRENT) return;
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { build } = (await res.json()) as { build?: string };
    if (build && build !== CURRENT) markReady();
  } catch {
    // Offline or blocked — try again later.
  }
};

export const startAppUpdateWatcher = () => {
  if (import.meta.env.DEV) return;

  // A chunk from the previous deploy is gone: load the new build once.
  window.addEventListener('vite:preloadError', (event) => {
    try {
      if (sessionStorage.getItem(RELOAD_GUARD)) return;
      sessionStorage.setItem(RELOAD_GUARD, '1');
    } catch {
      // Storage blocked — still reload; the guard is only a loop breaker.
    }
    event.preventDefault();
    window.location.reload();
  });
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RELOAD_GUARD);
    } catch {
      /* ignore */
    }
  }, 10_000);

  // New build live → the next route change becomes a full load of that URL.
  const push = history.pushState.bind(history);
  history.pushState = (data, unused, url) => {
    if (updateReady && url != null) {
      window.location.assign(String(url));
      return;
    }
    push(data, unused, url);
  };

  window.setInterval(() => void check(), CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });
  window.addEventListener('focus', () => void check());
};
