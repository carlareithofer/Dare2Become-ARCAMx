'use client';
import { useEffect, useRef, useState } from 'react';
import { onDbChange } from '@/lib/data/store';

/** Încarcă date printr-o funcție async și le reîncarcă automat când se schimbă datele (inclusiv din alt tab). */
export function useLive<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });
  const depKey = JSON.stringify(deps);

  useEffect(() => {
    let alive = true;
    const run = () =>
      loaderRef.current().then((d) => {
        if (alive) setData(d);
      });
    run();
    const off = onDbChange(run);
    return () => {
      alive = false;
      off();
    };
  }, [depKey]);

  return { data };
}
