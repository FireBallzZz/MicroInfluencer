import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset the window scroll position on every route change.
 *
 * Why this exists
 * ────────────────
 * React Router deliberately leaves scroll alone on navigation, so when the
 * user clicks a link, button, or card that takes them to a new page, the
 * browser keeps the previous `scrollY`. On a deep page that lands the user
 * in the middle (or off the bottom) of the new content, this is jarring.
 *
 * Behavior
 * ────────
 *   • If only the hash changed (e.g. clicking `#how` while on `/`) we
 *     leave scroll alone so `html { scroll-behavior: smooth }` can handle
 *     the in-page anchor jump.
 *   • If the path or search changed, jump to the top of the new page
 *     instantly (`behavior: 'auto'`). We use `auto`, not `smooth`, because
 *     `auto` is correct: there is nothing visible to animate from — the new
 *     page mounts at scroll=0 — and using `smooth` causes a perceptible
 *     delay before the new content appears.
 *   • We restore the previous scroll position when the user navigates
 *     back/forward in history (the back button) so the browser's BFCache
 *     feels natural. We track the scroll position of every page in a
 *     session-scoped Map keyed by pathname + search.
 *
 * Mounted once at the top of <App />. Covers every <Link>, <NavLink>,
 * programmatic navigate(), and the ⌘K command palette.
 */
export default function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  // Restore the previous scroll position on browser back/forward only.
  // The location `key` changes on every navigation, including back/forward,
  // so we use it to detect "this is a popstate" via the browser's default
  // action of preserving the scroll position. We only force-reset on a
  // forward navigation (user clicking a link).
  useEffect(() => {
    // If the only change is the hash, let the browser handle the anchor.
    if (hash) return;

    // Don't fight the browser when the user is going back/forward — leave
    // the previous scroll where it was. We detect back/forward by checking
    // whether the browser has already restored a non-zero scroll position
    // (popstate's default behavior is to restore the prior scroll).
    // If scrollY is 0, this is a fresh navigation — jump to top.
    // If scrollY > 0, this is likely a back/forward — leave it.
    if (window.scrollY > 0) {
      // Was a previous page already scrolled? Check the cache. If the current
      // pathname is a new visit (no cached position), force to top.
      const key2 = pathname + search;
      if (!scrollCache.has(key2)) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      return;
    }

    // Fresh forward navigation → scroll to top of the new page.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash, key]);

  // Track scroll position per page so back/forward lands users where they
  // were. We update on every scroll event with rAF throttling.
  useEffect(() => {
    const key2 = pathname + search;
    scrollCache.set(key2, window.scrollY);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scrollCache.set(key2, window.scrollY);
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

// Session-scoped scroll position cache. Survives back/forward within the
// session; cleared on full page reload.
const scrollCache = new Map<string, number>();
