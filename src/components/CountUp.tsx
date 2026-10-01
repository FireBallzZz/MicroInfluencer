import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

/**
 * CountUp — animates a numeric value from 0 → `to` when scrolled into view.
 * Respects prefers-reduced-motion (snaps immediately).
 */
export default function CountUp({ to, duration = 1400, prefix = '', suffix = '', decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      if (started.current) return;
      started.current = true;
      if (reduced) { setVal(to); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutQuint
        const eased = 1 - Math.pow(1 - t, 5);
        setVal(to * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') { animate(); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) animate();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const formatted = decimals === 0
    ? Math.round(val).toLocaleString()
    : val.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}