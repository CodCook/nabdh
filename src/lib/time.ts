import { useEffect, useState } from 'react'

/** Re-renders every `ms` and returns Date.now(). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(i)
  }, [ms])
  return now
}

/** "2 h 14 m" past an hour, otherwise "14 m 05 s". Returns numeric parts; caller localizes. */
export function sinceParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? { big: h, bigUnit: 'hr' as const, small: m, smallUnit: 'min' as const } : { big: m, bigUnit: 'min' as const, small: s, smallUnit: 'sec' as const }
}
