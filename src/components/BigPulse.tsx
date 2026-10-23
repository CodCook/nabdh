import { motion } from 'framer-motion'

/** A coral heart-beat dot. `bpm` sets the beat; paused freezes it. Falls back to an opacity pulse under reduced motion. */
export default function BigPulse({ bpm, paused = false, size = 200 }: { bpm: number; paused?: boolean; size?: number }) {
  const d = 60 / bpm
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      {!paused && [0, 1].map((i) => (
        <motion.span key={i} className="absolute rounded-full border-2 border-coral"
          style={{ width: size * 0.6, height: size * 0.6 }}
          animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
          transition={{ duration: d * 2, repeat: Infinity, ease: 'easeOut', delay: i * d }} />
      ))}
      <motion.span className="rounded-full bg-coral"
        style={{ width: size * 0.5, height: size * 0.5 }}
        animate={paused ? { scale: 1, opacity: 1 } : { scale: [1, 1.14, 0.97, 1], opacity: [1, 1, 0.85, 1] }}
        transition={{ duration: d, repeat: paused ? 0 : Infinity, ease: 'easeInOut', times: [0, 0.18, 0.5, 1] }} />
    </div>
  )
}
