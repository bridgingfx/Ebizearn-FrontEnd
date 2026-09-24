import { useEffect } from 'react';

let openCount = 0;

/**
 * Hide the floating live-chat launcher while `active` is true (e.g. a
 * ticket conversation or drawer is open) so it never covers a composer.
 * Ref-counted, so overlapping panels don't un-hide it early.
 */
export function useHideChatWidget(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    openCount += 1;
    document.body.classList.add('chat-widget-hidden');
    return () => {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.classList.remove('chat-widget-hidden');
    };
  }, [active]);
}
