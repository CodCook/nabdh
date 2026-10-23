import { Lock } from 'lucide-react'
import { useT } from '../../i18n'
import { clearProgress, lastSevenDays, streak, totals, useProgress } from '../../state/progress'
import CountUp from '../../components/CountUp'
import AppShell from './AppShell'

export default function Progress() {
  const { t, n, lang } = useT()
  const p = useProgress()
  const tot = totals(p)
  const days = lastSevenDays(p)
  const max = Math.max(5, ...days.map((d) => d.minutes))
  const fmtDay = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-QA' : 'en-GB', { weekday: 'short' })

  const W = 350, H = 96, base = 72
  const step = W / 7

  return (
    <AppShell>
      <h1 className="kufi text-[28px] text-ink">{t.progress.title}</h1>
      <p className="mt-3 flex items-start gap-2 text-[15px] text-ink">
        <Lock size={18} strokeWidth={1.5} aria-hidden="true" className="flex-none mt-1 text-maroon" />
        <span><span className="font-semibold">{t.progress.local}</span><br /><span className="text-warm text-sm">{t.progress.localD}</span></span>
      </p>

      <dl className="mt-8 grid grid-cols-3 gap-0">
        {[
          { v: streak(p), l: t.progress.streak },
          { v: tot.minutes, l: t.progress.minutes },
          { v: tot.breaks, l: t.progress.breaks },
        ].map((it, i) => (
          <div key={it.l} className={`${i > 0 ? 'border-s border-line ps-4' : ''}`}>
            <dd className="kufi text-[40px] leading-none text-maroon"><CountUp value={it.v} duration={0.6} /></dd>
            <dt className="mt-2 text-sm text-warm">{it.l}</dt>
          </div>
        ))}
      </dl>

      <section className="mt-10" aria-label={t.progress.week}>
        <p className="text-sm text-warm">{t.progress.week}</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img"
          aria-label={days.map((d) => `${fmtDay.format(d.ts)}: ${n(d.minutes)} ${t.min}`).join('، ')}>
          <line x1="0" x2={W} y1={base} y2={base} stroke="var(--line)" strokeWidth="2" />
          {days.map((d, i) => {
            const cx = step * i + step / 2
            const amp = (d.minutes / max) * 56
            return d.minutes > 0 ? (
              <path key={i} d={`M${cx - 14} ${base} L${cx - 6} ${base} L${cx - 3} ${base + 6} L${cx} ${base - amp} L${cx + 4} ${base + 10} L${cx + 8} ${base} L${cx + 14} ${base}`}
                fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            ) : null
          })}
        </svg>
        <div className="flex">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-xs text-warm">{fmtDay.format(d.ts)}</span>
          ))}
        </div>
        {tot.breaks === 0 && <p className="mt-6 text-[15px] text-warm leading-relaxed">{t.progress.empty}</p>}
      </section>

      {tot.breaks > 0 && (
        <button type="button" onClick={clearProgress} className="target mt-10 px-4 rounded-lg bg-surface text-warm text-sm">{t.progress.clear}</button>
      )}
    </AppShell>
  )
}
