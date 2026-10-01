import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — observes a ref and toggles .is-visible once it enters the viewport.
 * Used by .reveal (defined in src/index.css) for fade-up animations on scroll.
 * Pauses when prefers-reduced-motion is set (CSS will already show elements).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (opts?.once !== false) io.unobserve(el);
          } else if (opts?.once === false) {
            setVisible(false);
          }
        }
      },
      { rootMargin: opts?.rootMargin ?? '0px 0px -10% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible };
}