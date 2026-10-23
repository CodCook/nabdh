import { useEffect, useRef } from 'react'

/**
 * The big line. Flat until a check-in lands; then a coral heartbeat spikes and decays back to flat.
 * Pure canvas so it stays smooth on a projector. Each beat is placed at a slightly different x
 * so rapid events never stack on top of each other.
 */
interface Spike { t0: number; cx: number; amp: number }

// ECG complex: [x offset px, height 0..1]
const SHAPE: [number, number][] = [
  [-90, 0], [-72, 0.1], [-54, 0], [-26, 0], [-14, -0.12], [0, 1], [14, -0.38], [26, 0], [60, 0], [82, 0.2], [104, 0],
]
function shape(u: number): number {
  if (u <= SHAPE[0][0] || u >= SHAPE[SHAPE.length - 1][0]) return 0
  for (let i = 1; i < SHAPE.length; i++) {
    const [x1, y1] = SHAPE[i]
    if (u <= x1) {
      const [x0, y0] = SHAPE[i - 1]
      return y0 + ((u - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return 0
}

export default function MainPulse({ beatKey, height = 240, color = '#FF4D4D' }: { beatKey: number; height?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const spikes = useRef<Spike[]>([])
  const last = useRef(beatKey)

  useEffect(() => {
    if (beatKey === last.current) return
    last.current = beatKey
    const w = ref.current?.clientWidth ?? 1200
    // spread beats across the middle band of the line
    const cx = w * (0.28 + Math.random() * 0.44)
    spikes.current.push({ t0: performance.now(), cx, amp: 0.78 + Math.random() * 0.22 })
  }, [beatKey])

  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let raf = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DECAY = reduce ? 0.9 : 2.2 // seconds

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = c.clientWidth, h = c.clientHeight
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const mid = h / 2, amp = h * 0.42
      const now = performance.now()
      spikes.current = spikes.current.filter((s) => (now - s.t0) / 1000 < DECAY * 2.2)

      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(245,240,232,0.28)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke()

      if (spikes.current.length) {
        const live = spikes.current.map((s) => {
          const dt = (now - s.t0) / 1000
          return { cx: s.cx, a: s.amp * Math.exp(-dt / DECAY) * Math.min(1, dt / 0.06 + 0.4) }
        })
        const peak = Math.max(...live.map((l) => l.a))
        ctx.globalAlpha = Math.min(1, peak * 2.5)
        ctx.strokeStyle = color; ctx.lineWidth = 4
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          let v = 0
          for (const l of live) v += shape(x - l.cx) * l.a
          const y = mid - v * amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [color])

  return <canvas ref={ref} role="img" aria-label="Live pulse of movement breaks in the building" style={{ width: '100%', height }} />
}
