import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BellRing, RotateCcw, Settings as Gear } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'
import { lastMovement, useProgress } from '../../state/progress'
import { useNow } from '../../lib/time'
import { notifyDemo } from '../../lib/demoBus'
import { planDay, type Block } from '../../engine/cadence'
import { SAMPLE_DAY } from '../../data/sampleDay'
import CountUp from '../../components/CountUp'
import AppShell from './AppShell'
import DayPulse from './DayPulse'
import Timeline from './Timeline'
import NudgeBanner from './NudgeBanner'

export default function Today() {
  const { t, n, lang } = useT()
  const { s } = useSettings()
  const nav = useNavigate()
  const progress = useProgress()
  const now = useNow(1000)
  const [organized, setOrganized] = useState(false)
  const [busy, setBusy] = useState(false)
  const [nudge, setNudge] = useState(false)

  const plan = useMemo(
    () => planDay(SAMPLE_DAY, { role: s.role, mode: s.mode, ramadan: s.ramadan, dhuhr: s.dhuhr, asr: s.asr }),
    [s.role, s.mode, s.ramadan, s.dhuhr, s.asr],
  )

  const mins = Math.floor((now - lastMovement(progress)) / 60_000)
  const adaptive = s.mode === 'adaptive'

  const organize = () => {
    notifyDemo('organize')
    setBusy(true)
    setOrganized(true)
    window.setTimeout(() => setBusy(false), 2600)
  }
  const reset = () => { setOrganized(false); setBusy(false) }
  const startBreak = (b?: Block) => {
    setNudge(false)
    nav('/app/break', { state: { minutes: b ? b.end - b.start : 3 } })
  }

  return (
    <AppShell>
      <NudgeBanner open={nudge} onStart={() => startBreak()} onLater={() => setNudge(false)} />

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-warm">{lang === 'ar' && s.role !== 'meetings' ? t.nav.today : t.today.greet}</p>
          <h1 className="kufi text-[28px] leading-tight text-ink mt-1">{t.nav.today}</h1>
        </div>
        <Link to="/app/settings" aria-label={t.settings.title} className="target flex items-center justify-center rounded-lg bg-surface text-ink">
          <Gear size={22} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </header>

      <section className="mt-6" aria-label={t.today.since}>
        <DayPulse breaks={organized ? plan.breaks : []} />
        <p className="mt-2 text-[15px] text-warm">
          {t.today.since}:{' '}
          <span className="kufi text-ink num" role="timer">
            {Math.floor(mins / 60) > 0 ? `${n(Math.floor(mins / 60))} ${t.hr} ` : ''}{n(mins % 60)} {t.min}
          </span>
        </p>
      </section>

      {/* WOW 1: the counter */}
      <section className="mt-6 min-h-[88px]" aria-live="polite">
        {organized ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="kufi text-[48px] leading-none text-maroon flex items-baseline gap-3">
              <span dir="ltr" className="num"><CountUp value={plan.movementMinutes} prefix="+" duration={1.6} /></span>
              <span className="text-[17px] font-medium text-ink">{adaptive ? t.today.recoveredAdaptive : t.today.recovered}</span>
            </p>
            <p className="mt-3 text-sm text-warm">
              {t.today.longest}: <span className="num text-ink">{n(plan.longestSitAfter)} {t.min}</span>
            </p>
          </motion.div>
        ) : (
          <p className="text-[15px] text-warm leading-relaxed max-w-[34ch]">{t.today.target}</p>
        )}
      </section>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={organized ? reset : organize} disabled={busy}
          className="target h-14 flex-1 rounded-lg bg-maroon text-white text-[18px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
          {organized ? <><RotateCcw size={20} strokeWidth={1.5} aria-hidden="true" className="rtl-flip" />{busy ? t.today.organizing : t.today.reset}</> : t.today.organize}
        </button>
        <button type="button" onClick={() => setNudge(true)} aria-label={t.today.simulateNudge} title={t.today.simulateNudge}
          className="target h-14 w-14 rounded-lg bg-surface text-ink flex items-center justify-center">
          <BellRing size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {s.ramadan && <p className="mt-4 text-sm text-warm">{t.today.ramadanNote}</p>}
      {s.role !== 'meetings' && <p className="mt-4 text-sm text-warm">{t.today.deepNote}</p>}

      <div className="mt-8">
        <Timeline plan={plan} organized={organized} role={s.role} onBreak={startBreak} />
      </div>
    </AppShell>
  )
}
