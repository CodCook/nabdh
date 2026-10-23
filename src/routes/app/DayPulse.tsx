import { motion, useReducedMotion } from 'framer-motion'
import type { Block } from '../../engine/cadence'
import { TIMELINE_END, TIMELINE_START } from '../../data/sampleDay'

/** Today as a pulse line: flat while you sit, a spike at every planned movement break. */
export default function DayPulse({ breaks }: { breaks: Block[] }) {
  const reduce = useReducedMotion()
  const W = 400, H = 48, mid = 28, amp = 22
  const x = (m: number) => ((m - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * W
  let d = `M0 ${mid}`
  for (const b of breaks) {
    const c = x(b.start)
    d += ` L${c - 7} ${mid} L${c - 4} ${mid - 4} L${c - 2} ${mid} L${c} ${mid - amp} L${c + 3} ${mid + 8} L${c + 5} ${mid} L${c + 9} ${mid - 3} L${c + 12} ${mid}`
  }
  d += ` L${W} ${mid}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H }} aria-hidden="true">
      <path d={`M0 ${mid} L${W} ${mid}`} stroke="var(--line)" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
      {breaks.length > 0 && (
        <motion.path
          key={breaks.length}
          d={d}
          fill="none"
          stroke="var(--coral)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0.01 : 1.8, ease: 'easeInOut', delay: 0.2 }}
        />
      )}
    </svg>
  )
}
