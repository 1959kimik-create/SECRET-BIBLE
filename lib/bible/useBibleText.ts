"use client";

import { useEffect, useState } from "react";
import { ensureBookTextLoaded, isBookTextLoaded } from "@/lib/bible/bibleTextStore";

export function useBibleText(bookName: string): {
  loading: boolean;
  ready: boolean;
  loadTick: number;
} {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(() => isBookTextLoaded(bookName));
  const [loadTick, setLoadTick] = useState(0);

  useEffect(() => {
    if (!bookName.trim()) {
      setLoading(false);
      setReady(false);
      return;
    }
    if (isBookTextLoaded(bookName)) {
      setLoading(false);
      setReady(true);
      setLoadTick((t) => t + 1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setReady(false);
    void ensureBookTextLoaded(bookName).then((ok) => {
      if (cancelled) return;
      setLoading(false);
      setReady(ok);
      if (ok) setLoadTick((t) => t + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [bookName]);

  return { loading, ready, loadTick };
}
