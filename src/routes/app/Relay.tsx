import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, Coffee, DoorOpen } from 'lucide-react'
import { useT } from '../../i18n'
import { coverageAt, isOpen, openCount, staggerWindows } from '../../engine/relay'
import CountUp from '../../components/CountUp'
import AppShell from './AppShell'

const FROM = 9 * 60 + 50
const TO = 10 * 60 + 35
const WINDOWS = 3

export default function Relay() {
  const { t, n, clock, lang } = useT()
  const ws = useMemo(() => staggerWindows({ windows: WINDOWS, firstBreak: 10 * 60 + 5 }), [])
  const [now, setNow] = useState(10 * 60)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setNow((m) => (m >= TO ? FROM : m + 1)), 450)
    return () => window.clearInterval(id)
  }, [playing])

  const open = openCount(ws, now)
  const cov = coverageAt(ws, now)

  // coverage line: computed minute by minute across the scrub range
  const W = 400, H = 64
  const x = (m: number) => ((m - FROM) / (TO - FROM)) * W
  const y = (c: number) => H - 8 - (c / 100) * (H - 16)
  const pts = Array.from({ length: TO - FROM + 1 }, (_, i) => `${x(FROM + i).toFixed(1)},${y(coverageAt(ws, FROM + i)).toFixed(1)}`).join(' ')

  return (
    <AppShell>
      <h1 className="kufi text-[28px] text-ink">{t.relay.title}</h1>
      <p className="mt-2 text-[15px] text-warm leading-relaxed max-w-[36ch]">{t.relay.sub}</p>

      <ul className="mt-6 flex flex-col gap-2">
        {ws.map((w) => {
          const o = isOpen(w, now)
          return (
            <li key={w.id} className="rounded-lg bg-surface px-4 py-3 flex items-center gap-4">
              <span className="w-8 h-8 flex-none rounded-full flex items-center justify-center bg-sand text-ink" aria-hidden="true">
                {o ? <DoorOpen size={18} strokeWidth={1.5} /> : <Coffee size={18} strokeWidth={1.5} className="text-maroon" />}
              </span>
              <div className="flex-1">
                <p className="text-[17px] font-medium text-ink">{t.relay.window} <span className="num">{n(w.id)}</span></p>
                <p className="text-xs text-warm num">{clock(w.breakStart)}–{clock(w.breakEnd)}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${o ? 'bg-sand text-ink' : 'bg-maroon text-white'}`}>
                {o ? t.relay.open : t.relay.onBreak}
              </span>
            </li>
          )
        })}
      </ul>

      <section className="mt-8" aria-live="polite" aria-label={t.relay.coverage}>
        <p className="text-sm text-warm">{t.relay.coverage}</p>
        <p className="kufi text-[56px] leading-none text-maroon mt-1 flex items-baseline gap-3">
          <span><CountUp value={cov} duration={0.3} />{lang === 'ar' ? '٪' : '%'}</span>
          <span className="text-[17px] font-medium text-ink num">{n(open)} {t.relay.openOf} {n(WINDOWS)}</span>
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" style={{ height: H }} preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" x2={W} y1={y(100)} y2={y(100)} stroke="var(--line)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <polyline points={pts} fill="none" stroke="var(--maroon)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1={x(now)} x2={x(now)} y1="0" y2={H} stroke="var(--ink)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="clock" className="text-sm text-warm">{t.relay.clock}</label>
          <output htmlFor="clock" className="kufi text-[28px] text-ink num" dir="ltr">{clock(now)}</output>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t.guided.pause : t.guided.resume}
            className="target w-14 flex-none rounded-lg bg-maroon text-white flex items-center justify-center">
            {playing ? <Pause size={20} strokeWidth={1.5} aria-hidden="true" /> : <Play size={20} strokeWidth={1.5} aria-hidden="true" className="rtl-flip" />}
          </button>
          <input id="clock" type="range" min={FROM} max={TO} step={1} value={now} onChange={(e) => setNow(+e.target.value)}
            aria-label={t.relay.scrub} aria-valuetext={clock(now)} className="flex-1 h-8 accent-[#8A1538]" />
        </div>
        <p className="mt-2 text-xs text-warm">{t.relay.scrub}</p>
      </section>
    </AppShell>
  )
}
