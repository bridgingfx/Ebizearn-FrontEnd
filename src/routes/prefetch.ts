/**
 * Portal chunk prefetch helpers.
 *
 * Most-likely-next navigation: once a login page has rendered, the user is
 * one submit away from their portal, so warm that portal's chunk in the
 * background (idle / delayed). These are plain dynamic imports — Vite maps
 * them to the same `manualChunks` output as the React.lazy() versions in
 * lazy.tsx, so no duplicate download occurs. Fire-and-forget: failures are
 * swallowed.
 */
export const preloadContributorApp = () => import('../layouts/ContributorLayout').catch(() => {});
export const preloadBusinessApp = () => import('../layouts/BusinessLayout').catch(() => {});
export const preloadAdminApp = () => import('../layouts/AdminLayout').catch(() => {});

/** Run `prefetch` once the browser is idle (or after 1.5s if idle callbacks are unavailable). */
export const prefetchWhenIdle = (prefetch: () => unknown): void => {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;
  if (ric) {
    ric(() => void prefetch(), { timeout: 2000 });
  } else {
    setTimeout(() => void prefetch(), 1500);
  }
};
