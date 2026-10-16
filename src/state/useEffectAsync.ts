import { useEffect, useRef, useState } from 'react';

/**
 * Run an async loader on mount, with simple loading / error state.
 *
 *   const { data, loading, error, refresh } = useAsyncLoader(async () => …);
 */
export function useAsyncLoader<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err?.message ?? 'Request failed.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return {
    data,
    loading,
    error,
    refresh: () => setTick((n) => n + 1),
  };
}
