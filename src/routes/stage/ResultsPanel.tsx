import { useT } from '../../i18n'
import CountUp from '../../components/CountUp'
import { testResults as r } from '../../config/testResults'

export default function ResultsPanel() {
  const { t, lang } = useT()
  const pct = lang === 'ar' ? '٪' : '%'
  const items = [
    { v: r.participants, label: t.stage.participants, dec: 0, suffix: '' },
    { v: r.completionRatePct, label: t.stage.completion, dec: 0, suffix: pct },
    { v: r.sweatedPct, label: t.stage.sweat, dec: 0, suffix: pct },
    { v: r.averageExertion, label: t.stage.exertion, dec: 1, suffix: '' },
    { v: r.easeOfUse, label: t.stage.ease, dec: 1, suffix: '' },
  ]
  return (
    <section aria-label={t.stage.results}>
      <h2 className="text-[22px] text-sand/70">{t.stage.results}</h2>
      <dl className="mt-3 flex">
        {items.map((it, i) => (
          <div key={it.label} className={`flex-1 ${i > 0 ? 'border-s border-sand/10 ps-6' : ''}`}>
            <dd className="kufi text-[48px] leading-none">
              <CountUp value={it.v} decimals={it.dec} duration={1.4} />{it.suffix}
            </dd>
            <dt className="mt-2 text-[20px] text-sand/70">{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
