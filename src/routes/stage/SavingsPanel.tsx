import { useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../../i18n'
import CountUp from '../../components/CountUp'
import { annualSickDaySavingsQar, DEFAULT_INPUT, hoursReturnedPerDay, SETUP_COST_QAR, workingDaysEquivalent, type SavingsInput } from '../../engine/savings'

interface SliderProps { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; shown: string }

function Slider({ label, value, min, max, step, onChange, shown }: SliderProps) {
  const id = label
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[19px] text-sand/80 leading-tight">{label}</label>
        <output htmlFor={id} className="kufi text-[24px] num">{shown}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
        className="mt-2 w-full h-6 accent-sand cursor-pointer" aria-valuetext={shown} />
    </div>
  )
}

export default function SavingsPanel() {
  const { t, n } = useT()
  const [i, setI] = useState<SavingsInput>(DEFAULT_INPUT)
  const set = <K extends keyof SavingsInput>(k: K) => (v: number) => setI((p) => ({ ...p, [k]: v }))

  const hours = hoursReturnedPerDay(i)
  const days = workingDaysEquivalent(hours)
  const annual = annualSickDaySavingsQar(i)
  const gymPct = 100
  const nabdhPct = Math.max(0.6, (SETUP_COST_QAR.nabdh / SETUP_COST_QAR.gym) * 100)

  return (
    <section aria-label={t.stage.savings} className="h-full bg-stage-surface rounded-lg p-6 flex flex-col gap-4">
      <h2 className="kufi text-[28px]">{t.stage.savings}</h2>

      <div className="flex flex-col gap-3">
        <Slider label={t.stage.employees} value={i.employees} min={100} max={5000} step={50} onChange={set('employees')} shown={n(i.employees)} />
        <Slider label={t.stage.meetingsPer} value={i.meetingsPerEmployee} min={1} max={8} step={1} onChange={set('meetingsPerEmployee')} shown={n(i.meetingsPerEmployee)} />
        <Slider label={t.stage.sickDays} value={i.sickDaysAvoided} min={0} max={5} step={0.5} onChange={set('sickDaysAvoided')} shown={n(i.sickDaysAvoided)} />
        <Slider label={t.stage.salary} value={i.dailySalaryQar} min={300} max={3000} step={50} onChange={set('dailySalaryQar')} shown={n(i.dailySalaryQar)} />
      </div>

      <div className="border-t border-sand/10 pt-4 flex flex-col gap-3">
        <p>
          <span className="kufi text-[56px] leading-none"><CountUp value={hours} duration={0.8} /></span>
          <span className="ms-3 text-[20px] text-sand/80">{t.stage.hoursDay}</span>
        </p>
        <p className="text-[20px] text-sand/70">
          ≈ <span className="kufi text-sand text-[24px]"><CountUp value={days} duration={0.8} /></span> {t.stage.daysEq}
        </p>
        <p>
          <span className="kufi text-[40px] leading-none"><CountUp value={annual} duration={0.8} /></span>
          <span className="ms-3 text-[20px] text-sand/80">{t.stage.annual}</span>
        </p>
      </div>

      <div className="mt-auto border-t border-sand/10 pt-4">
        <h3 className="text-[20px] text-sand/70">{t.stage.setup}</h3>
        <div className="mt-3 flex flex-col gap-3">
          {[
            { label: t.stage.nabdh, v: SETUP_COST_QAR.nabdh, pct: nabdhPct, fill: 'bg-sand' },
            { label: t.stage.gym, v: SETUP_COST_QAR.gym, pct: gymPct, fill: 'bg-warm' },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-[19px]">
                <span>{b.label}</span>
                <span className="kufi num">{n(b.v)} {t.stage.qar}</span>
              </div>
              <div className="mt-1 h-3 rounded-sm bg-sand/10 overflow-hidden" dir="ltr">
                <motion.div className={`h-full ${b.fill}`} initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
