import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Session-scoped scroll position cache. Survives back/forward within the session.
const scrollCache = new Map<string, number>();

/**
 * Ensures smooth, reliable scrolling on every page:
 * 1. Always clears any lingering body/html scroll locks (overflow: hidden) on navigation.
 * 2. On forward navigation (link clicks, redirects), scrolls the window cleanly to the top.
 * 3. On hash changes (e.g. #how, #marketplace), smoothly scrolls to the target anchor element.
 * 4. On browser back/forward (POP), restores the previous scroll position naturally.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType();

  // Handle scroll position and locks on route change
  useEffect(() => {
    // 1. Always clear any stuck overflow locks from previous modals or drawers
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // 2. If there's an anchor hash (e.g., #how, #creators), scroll smoothly to target
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    // 3. If going back/forward in browser history, restore cached scroll position
    const currentUrl = pathname + search;
    if (navType === 'POP') {
      const cached = scrollCache.get(currentUrl);
      if (typeof cached === 'number') {
        window.scrollTo({ top: cached, left: 0, behavior: 'auto' });
        return;
      }
      return;
    }

    // 4. Fresh navigation (user clicked a link, navigated to a new page) -> scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search, hash, navType]);

  // Track scroll position per page so back/forward lands users where they were
  useEffect(() => {
    const currentUrl = pathname + search;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scrollCache.set(currentUrl, window.scrollY);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname, search]);

  return null;
}
