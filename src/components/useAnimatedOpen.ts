import { useEffect, useRef, useState } from 'react';

/**
 * Smooth open/close for popovers and dropdowns.
 * - Renders the panel immediately so the close animation can play
 * - Tracks open state internally for the duration of the exit
 */
export function useAnimatedOpen(initial = false, exitMs = 140) {
  const [open, setOpen] = useState(initial);
  const [mounted, setMounted] = useState(initial);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (timer.current) window.clearTimeout(timer.current);
    } else if (mounted) {
      timer.current = window.setTimeout(() => setMounted(false), exitMs);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [open, mounted, exitMs]);

  return { open, setOpen, mounted };
}
