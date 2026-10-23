import { motion, useReducedMotion } from 'framer-motion'
import { useId } from 'react'

/**
 * The product is a pulse line: sitting = flat, movement = a heartbeat spike.
 *  - loop: a heartbeat that scrolls forever (logo / loader). Speed follows --pulse-bpm.
 *  - flat: a flat line.
 *  - event: flat; draws one coral spike each time `beatKey` changes, then decays back to flat.
 */
interface Props {
  variant?: 'loop' | 'flat' | 'event'
  beatKey?: number
  color?: string
  eventColor?: string
  height?: number
  strokeWidth?: number
  className?: string
  label?: string
}

const W = 600
const complex = (x: number, mid: number, amp: number) =>
  `L${x - 28} ${mid} L${x - 20} ${mid - amp * 0.18} L${x - 12} ${mid} L${x - 6} ${mid + amp * 0.12} L${x} ${mid - amp} L${x + 8} ${mid + amp * 0.55} L${x + 14} ${mid} L${x + 26} ${mid - amp * 0.22} L${x + 38} ${mid}`

export default function PulseLine({
  variant = 'flat', beatKey = 0, color = 'currentColor', eventColor = 'var(--coral)',
  height = 48, strokeWidth = 2, className, label,
}: Props) {
  const reduce = useReducedMotion()
  const id = useId()
  const mid = height / 2
  const amp = height * 0.42
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }

  if (variant === 'loop') {
    // repeated complexes 120px apart; the group scrolls by exactly one period
    let d = `M0 ${mid}`
    for (let i = 0; i < 7; i++) d += complex(60 + i * 120, mid, amp)
    d += ` L${7 * 120} ${mid}`
    return (
      <svg {...a11y} className={className} viewBox={`0 0 480 ${height}`} preserveAspectRatio="none" style={{ overflow: 'hidden', width: '100%', height }}>
        <clipPath id={id}><rect width="480" height={height} /></clipPath>
        <g clipPath={`url(#${id})`}>
          <path d={d} className="pulse-scroll" fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    )
  }

  const flat = `M0 ${mid} L${W} ${mid}`
  const spike = `M0 ${mid} L${W / 2 - 28} ${mid} ${complex(W / 2, mid, amp)} L${W} ${mid}`
  return (
    <svg {...a11y} className={className} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <path d={flat} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      {variant === 'event' && beatKey > 0 && (
        <motion.path
          key={beatKey}
          d={spike}
          fill="none"
          stroke={eventColor}
          strokeWidth={strokeWidth + 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduce ? 1 : 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 0 }}
          transition={reduce ? { duration: 0.01 } : { pathLength: { duration: 0.7, ease: 'easeOut' }, opacity: { delay: 0.5, duration: 1.4, ease: 'easeIn' } }}
        />
      )}
    </svg>
  )
}
