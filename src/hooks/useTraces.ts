"use client";

import { useState, useEffect } from 'react';
import type { Trace } from '@/lib/langfuse';

interface UseTracesResult {
  data: Trace[] | null;
  loading: boolean;
  error: string | null;
}

export function useTraces(): UseTracesResult {
  const [data, setData] = useState<Trace[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTraces() {
      try {
        const res = await fetch('/api/traces');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          const traces = json.data ?? [];
          console.log('[useTraces] raw traces:', JSON.stringify(traces.slice(0, 2), null, 2));
          setData(traces);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load traces');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTraces();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
