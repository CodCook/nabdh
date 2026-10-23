import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import PulseLine from '../../components/PulseLine'
import CountUp from '../../components/CountUp'
import LangToggle from '../../components/LangToggle'
import { useT } from '../../i18n'
import { DEPTS, deptByCode } from '../../data/departments'
import { sync } from '../../sync'
import { sinceParts, useNow } from '../../lib/time'
import MainPulse from './MainPulse'
import StageFooter from './StageFooter'

const W = 1920, H = 1080

/** Fixed 16:9 canvas scaled to whatever the projector gives us. */
function Frame({ children }: { children: ReactNode }) {
  const [k, setK] = useState(1)
  useEffect(() => {
    const f = () => setK(Math.min(window.innerWidth / W, window.innerHeight / H))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return (
    <div className="fixed inset-0 bg-stage overflow-hidden flex items-center justify-center on-dark">
      <div style={{ width: W, height: H, transform: `scale(${k})`, flex: 'none' }}>{children}</div>
    </div>
  )
}

const seedCounts = () => Object.fromEntries(DEPTS.map((d) => [d.id, d.seed])) as Record<string, number>
const seedBeats = () => Object.fromEntries(DEPTS.map((d) => [d.id, 0])) as Record<string, number>

export default function Stage() {
  const { t, n, lang } = useT()
  const now = useNow(1000)
  const [counts, setCounts] = useState(seedCounts)
  const [beats, setBeats] = useState(seedBeats)
  const [mainBeat, setMainBeat] = useState(0)
  const [lastTs, setLastTs] = useState(() => Date.now() - 4 * 60_000)
  const countsRef = useRef(counts)
  countsRef.current = counts

  const checkIn = useCallback((id: string, ts = Date.now()) => {
    setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    setBeats((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }))
    setMainBeat((x) => x + 1)
    setLastTs(ts)
  }, [])

  const reset = useCallback(() => {
    setCounts(seedCounts()); setBeats(seedBeats()); setMainBeat(0); setLastTs(Date.now() - 4 * 60_000)
  }, [])

  // events from phones (BroadcastChannel and, if configured, Supabase)
  useEffect(() => sync().subscribe((e) => {
    const d = deptByCode(e.dept)
    if (d) checkIn(d.id, e.ts)
  }), [checkIn])

  // demo-safety shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 't') checkIn(DEPTS[Math.floor(Math.random() * DEPTS.length)].id)
      else if (k === 'h') checkIn('hr')
      else if (k === 'r') reset()
      else if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [checkIn, reset])

  const clock = new Date(now)
  const hh = String(clock.getHours()).padStart(2, '0')
  const mm = String(clock.getMinutes()).padStart(2, '0')
  const ss = String(clock.getSeconds()).padStart(2, '0')
  const sp = sinceParts(now - lastTs)
  const unit = { hr: t.hr, min: t.min, sec: lang === 'ar' ? 'ث' : 's' }

  return (
    <Frame>
      <div className="h-full p-12 flex flex-col gap-6 text-sand" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* top bar */}
        <header className="flex items-center justify-between h-[72px]">
          <h1 className="kufi text-[36px] leading-tight">{t.stage.title}</h1>
          <div className="flex items-center gap-10">
            <p className="text-[24px] text-sand/70">
              {t.stage.since}{' '}
              <span className="kufi text-sand text-[32px] num" aria-live="off">
                {n(sp.big)} {unit[sp.bigUnit]} {n(String(sp.small).padStart(2, '0'))} {unit[sp.smallUnit]}
              </span>
            </p>
            <time className="kufi text-[40px] num" dateTime={`${hh}:${mm}`} dir="ltr">{n(`${hh}:${mm}:${ss}`)}</time>
            <LangToggle dark />
          </div>
        </header>

        {/* main row */}
        <div className="flex gap-12 flex-1 min-h-0">
          <section className="flex-1 flex flex-col min-w-0">
            <div className="relative" style={{ height: 240 }}>
              <MainPulse beatKey={mainBeat} height={240} />
            </div>
            <ul className="mt-6 flex flex-col">
              {DEPTS.map((d) => (
                <li key={d.id} className="flex items-center gap-8 h-[64px] border-t border-sand/10">
                  <span className="w-[280px] text-[28px]">{t.stage.depts[d.id]}</span>
                  <div className="flex-1 text-sand/35"><PulseLine variant="event" beatKey={beats[d.id]} height={40} strokeWidth={2} /></div>
                  <span className="kufi text-[40px] w-[96px] text-end num" aria-label={`${t.stage.depts[d.id]}: ${counts[d.id]}`}>
                    <CountUp value={counts[d.id]} duration={0.5} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <aside id="stage-right" className="w-[560px] flex-none" />
        </div>

        <div id="stage-bottom" />
        <StageFooter />
        <p className="sr-only">{t.stage.hints}</p>
      </div>
    </Frame>
  )
}
