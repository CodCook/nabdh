import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

/** Counts from its previous value to `value`; renders with localized digits. */
export default function CountUp({ value, duration = 0.9, className, prefix = '', decimals = 0 }:
  { value: number; duration?: number; className?: string; prefix?: string; decimals?: number }) {
  const { n } = useT()
  const reduce = useReducedMotion()
  const from = useRef(0)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (reduce || document.hidden) { setV(value); from.current = value; return }
    const c = animate(from.current, value, { duration, ease: 'easeOut', onUpdate: (x) => setV(x) })
    from.current = value
    return () => c.stop()
  }, [value, duration, reduce])
  const shown = decimals ? v.toFixed(decimals) : Math.round(v)
  return <span className={`num ${className ?? ''}`}>{prefix}{n(shown)}</span>
}
