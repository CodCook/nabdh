import { useT } from '../../i18n'
import { pilotTargets, type PilotTarget } from '../../config/pilotTargets'

const R = 44
const C = 2 * Math.PI * R

/** A ring that starts empty: the track is always drawn, the arc grows with `current` toward the target. */
function Ring({ item }: { item: PilotTarget }) {
  const { t, n, lang } = useT()
  const pct = lang === 'ar' ? '٪' : '%'
  const progress = Math.max(0, Math.min(1, item.current / item.target))
  const value = `${n(item.target)}${item.unit === 'pct' ? pct : ''}${item.orMore ? '+' : ''}`
  const label = t.stage.pilot[item.id]
  return (
    <li className="flex-1 flex flex-col items-center text-center gap-2" aria-label={`${label}: ${t.stage.pilot.target} ${value}`}>
      <div className="relative w-[96px] h-[96px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(245,240,232,0.14)" strokeWidth="5" />
          {progress > 0 && (
            <circle cx="50" cy="50" r={R} fill="none" stroke="#FF4D4D" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
          )}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="kufi text-[28px] leading-none num" dir="ltr">{value}</span>
          <span className="mt-1 text-[14px] text-sand/60">{t.stage.pilot.target}</span>
        </span>
      </div>
      <span className="text-[18px] leading-snug text-sand/80 max-w-[210px]">{label}</span>
    </li>
  )
}

export default function PilotTargets() {
  const { t } = useT()
  return (
    <section aria-label={t.stage.pilot.title}>
      <h2 className="text-[22px] text-sand/70">{t.stage.pilot.title}</h2>
      <ul className="mt-2 flex gap-4">
        {pilotTargets.map((it) => <Ring key={it.id} item={it} />)}
      </ul>
    </section>
  )
}
