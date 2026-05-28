import { useEffect, useState, useRef } from 'react'

export interface AsyncState<T> {
  data: T
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = [], initialValue: T | null = null): AsyncState<T | null> {
  const [data, setData] = useState<T | null>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  // Per-effect token: only the most recent effect's promise may write state.
  // A shared boolean ref is unsafe — the second effect can flip it back to
  // false BEFORE the first effect's promise resolves, leading to a stale write.
  const callIdRef = useRef(0)

  useEffect(() => {
    const myId = ++callIdRef.current
    setLoading(true)
    setError(null)
    fn()
      .then((res) => { if (callIdRef.current === myId) setData(res) })
      .catch((err) => { if (callIdRef.current === myId) setError(err instanceof Error ? err : new Error(String(err))) })
      .finally(() => { if (callIdRef.current === myId) setLoading(false) })
    return () => {
      // Bump the id on cleanup so any in-flight promise is ignored.
      callIdRef.current = myId + 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, refetch: () => setTick((t) => t + 1) }
}
