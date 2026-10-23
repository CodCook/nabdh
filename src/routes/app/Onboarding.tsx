import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings, type Role } from '../../state/settings'
import { DEPTS } from '../../data/departments'
import PulseLine from '../../components/PulseLine'
import LangToggle from '../../components/LangToggle'
import CountUp from '../../components/CountUp'
import { ModeOptions, Switch } from './Settings'

const GUIDELINE = 150

function Choice({ on, onClick, title, desc }: { on: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick}
      className={`target w-full rounded-lg px-4 py-4 text-start ${on ? 'bg-maroon text-white' : 'bg-surface text-ink'}`}>
      <span className="block kufi text-[18px]">{title}</span>
      <span className={`block text-sm ${on ? 'text-white/85' : 'text-warm'}`}>{desc}</span>
    </button>
  )
}

function YesNo({ q, value, onChange, yes, no }: { q: string; value: boolean | null; onChange: (v: boolean) => void; yes: string; no: string }) {
  return (
    <fieldset className="py-3">
      <legend className="text-[16px] text-ink leading-snug mb-2">{q}</legend>
      <div className="flex gap-2" role="radiogroup">
        {[[true, yes], [false, no]].map(([v, label]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v as boolean)}
            className={`target flex-1 rounded-lg ${value === v ? 'bg-maroon text-white' : 'bg-surface text-ink'}`}>{label as string}</button>
        ))}
      </div>
    </fieldset>
  )
}

export default function Onboarding() {
  const { t, n, mw } = useT()
  const { s, set } = useSettings()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [beating, setBeating] = useState(false)
  const [days, setDays] = useState(3)
  const [mins, setMins] = useState(20)
  const [ready, setReady] = useState<(boolean | null)[]>([null, null, null])

  useEffect(() => {
    const id = window.setTimeout(() => setBeating(true), 1100) // flat line first, then the first beat
    return () => window.clearTimeout(id)
  }, [])

  const weekly = days * mins
  const meets = weekly >= GUIDELINE
  const flagged = ready.some((r) => r === true)
  const answered = ready.every((r) => r !== null)

  const finish = () => {
    set({ onboarded: true, pavsWeekly: weekly })
    nav('/app')
  }
  const skip = () => { set({ onboarded: true, role: 'meetings', mode: 'masar', dept: 'hr' }); nav('/app') }

  return (
    <div className="app-root min-h-full flex justify-center bg-sand">
      <div className="w-full max-w-[430px] min-h-full px-6 py-6 flex flex-col lg:border-x lg:border-line">
        <header className="flex items-center justify-between gap-4">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} aria-label={t.back} className="target w-14 rounded-lg bg-surface flex items-center justify-center">
              <ArrowLeft size={22} strokeWidth={1.5} aria-hidden="true" className="rtl-flip" />
            </button>
          ) : <span />}
          <LangToggle />
        </header>

        <AnimatePresence>
          <motion.main key={step} initial={{ opacity: 0, x: s.lang === 'ar' ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col py-8">
            {step === 0 && (
              <div className="flex-1 flex flex-col justify-center gap-8 text-maroon">
                <div className="relative h-[96px]">
                  <motion.div className="absolute inset-0" animate={{ opacity: beating ? 0 : 1 }} transition={{ duration: 0.6 }}>
                    <PulseLine variant="flat" height={96} strokeWidth={3} />
                  </motion.div>
                  <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: beating ? 1 : 0 }} transition={{ duration: 0.6 }}>
                    <PulseLine variant="loop" height={96} strokeWidth={3} color="var(--coral)" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="kufi text-[64px] leading-none">{t.appName}</h1>
                  <p className="mt-4 text-[18px] text-warm max-w-[26ch] leading-relaxed">{t.tagline}</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <h1 className="kufi text-[28px] text-ink">{t.onb.roleTitle}</h1>
                <p className="mt-2 text-warm">{t.onb.roleSub}</p>
                <div role="radiogroup" className="mt-6 flex flex-col gap-2">
                  {(['meetings', 'deep', 'counter'] as Role[]).map((r) => (
                    <Choice key={r} on={s.role === r} onClick={() => set({ role: r })} title={t.onb.roles[r].t} desc={t.onb.roles[r].d} />
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="kufi text-[28px] text-ink">{t.onb.modeTitle}</h1>
                <p className="mt-2 text-warm">{t.onb.modeSub}</p>
                <div className="mt-6"><ModeOptions /></div>
                {s.mode === 'ladies' && <div className="mt-2 rounded-lg bg-surface px-4"><Switch on={s.pregnancy} onChange={(v) => set({ pregnancy: v })} label={t.onb.pregnancy} /></div>}
                <div className="mt-2 rounded-lg bg-surface px-4"><Switch on={s.ramadan} onChange={(v) => set({ ramadan: v })} label={t.onb.ramadan} hint={t.onb.ramadanD} /></div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="kufi text-[28px] text-ink">{t.onb.activityTitle}</h1>
                <p className="mt-2 text-warm">{t.onb.activitySub}</p>

                <div className="mt-6 rounded-lg bg-surface px-4 py-2 divide-y divide-line">
                  <div className="py-3">
                    <label htmlFor="days" className="text-[16px] text-ink leading-snug block">{t.onb.pavsDays}</label>
                    <div className="mt-2 flex items-center gap-3">
                      <input id="days" type="range" min={0} max={7} value={days} onChange={(e) => setDays(+e.target.value)} className="flex-1 h-8 accent-[#8A1538]" />
                      <span className="kufi text-[20px] w-24 text-end num">{n(days)} {t.onb.days}</span>
                    </div>
                  </div>
                  <div className="py-3">
                    <label htmlFor="mins" className="text-[16px] text-ink leading-snug block">{t.onb.pavsMin}</label>
                    <div className="mt-2 flex items-center gap-3">
                      <input id="mins" type="range" min={0} max={90} step={5} value={mins} onChange={(e) => setMins(+e.target.value)} className="flex-1 h-8 accent-[#8A1538]" />
                      <span className="kufi text-[20px] w-24 text-end num">{n(mins)} {t.min}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4" aria-live="polite">
                  <p className="text-sm text-warm">{t.onb.weekly}</p>
                  <p className="kufi text-[40px] leading-none text-maroon mt-1"><CountUp value={weekly} duration={0.4} /> <span className="text-[17px] text-ink font-medium">{mw(weekly)}</span></p>
                  <div className="mt-3 h-2 rounded-full bg-line overflow-hidden" role="img" aria-label={t.onb.guideline}>
                    <motion.div className="h-full bg-maroon" animate={{ width: `${Math.min(100, (weekly / GUIDELINE) * 100)}%` }} transition={{ duration: 0.4 }} />
                  </div>
                  <p className="mt-2 text-sm text-warm">{t.onb.guideline}</p>
                  <p className="mt-1 text-[15px] text-ink">{meets ? t.onb.meets : t.onb.below}</p>
                </div>

                <div className="mt-6 rounded-lg bg-surface px-4 divide-y divide-line">
                  <YesNo q={t.onb.q1} value={ready[0]} onChange={(v) => setReady([v, ready[1], ready[2]])} yes={t.onb.yes} no={t.onb.no} />
                  <YesNo q={t.onb.q2} value={ready[1]} onChange={(v) => setReady([ready[0], v, ready[2]])} yes={t.onb.yes} no={t.onb.no} />
                  <YesNo q={t.onb.q3} value={ready[2]} onChange={(v) => setReady([ready[0], ready[1], v])} yes={t.onb.yes} no={t.onb.no} />
                </div>
                {flagged && (
                  <p role="status" className="mt-3 flex items-center gap-3 rounded-lg border-2 border-maroon bg-surface p-3 text-[16px] text-ink">
                    <Stethoscope size={22} strokeWidth={1.5} aria-hidden="true" className="flex-none text-maroon" />{t.onb.doctor}
                  </p>
                )}

                <div className="mt-6">
                  <label htmlFor="dept" className="text-sm text-warm block mb-2">{t.onb.dept}</label>
                  <select id="dept" value={s.dept} onChange={(e) => set({ dept: e.target.value })} className="target w-full rounded-lg bg-surface px-4 text-[17px] text-ink">
                    {DEPTS.map((d) => <option key={d.id} value={d.id}>{t.stage.depts[d.id]} – {d.code}</option>)}
                  </select>
                  <p className="mt-2 text-sm text-warm">{t.onb.deptHint}</p>
                </div>
              </>
            )}
          </motion.main>
        </AnimatePresence>

        <footer className="flex flex-col gap-2">
          <button type="button" onClick={() => (step < 3 ? setStep(step + 1) : finish())} disabled={step === 3 && !answered}
            className="target h-14 rounded-lg bg-maroon text-white text-[18px] font-semibold disabled:opacity-50">
            {step === 0 ? t.start : step === 3 ? t.onb.finish : t.next}
          </button>
          <button type="button" onClick={skip} className="target rounded-lg text-warm text-sm">{t.skip}</button>
        </footer>
      </div>
    </div>
  )
}
