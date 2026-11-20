"use client";
// Hook mic pentru funcțiile async din lib/data: { data, error, loading, reload }.
import { useCallback, useEffect, useState } from "react";

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fn()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((e: unknown) => alive && setState({ error: e instanceof Error ? e.message : String(e), loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
