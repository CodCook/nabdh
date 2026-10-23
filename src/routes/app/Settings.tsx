import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Footprints, Armchair, Accessibility } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings, type Mode, type Role } from '../../state/settings'
import LangToggle from '../../components/LangToggle'
import AppShell from './AppShell'

export function Switch({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="target w-full flex items-center justify-between gap-4 py-2 text-start">
      <span>
        <span className="block text-[17px] text-ink">{label}</span>
        {hint && <span className="block text-sm text-warm">{hint}</span>}
      </span>
      <span className={`relative flex-none w-14 h-8 rounded-full transition-colors ${on ? 'bg-maroon' : 'bg-line'}`} aria-hidden="true">
        <span className="absolute top-1 w-6 h-6 rounded-full bg-white transition-[inset-inline-start] duration-200"
          style={{ insetInlineStart: on ? 28 : 4 }} />
      </span>
    </button>
  )
}

const MODE_ICONS = { masar: Footprints, ladies: Armchair, adaptive: Accessibility } as const

export function ModeOptions() {
  const { t } = useT()
  const { s, set } = useSettings()
  return (
    <div role="radiogroup" aria-label={t.settings.mode} className="flex flex-col gap-2">
      {(['masar', 'ladies', 'adaptive'] as Mode[]).map((m) => {
        const Icon = MODE_ICONS[m]
        const on = s.mode === m
        return (
          <motion.button key={m} layout type="button" role="radio" aria-checked={on} onClick={() => set({ mode: m })}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`target w-full rounded-lg px-4 py-4 flex items-center gap-4 text-start ${on ? 'bg-maroon text-white' : 'bg-surface text-ink'}`}>
            <Icon size={s.mode === 'adaptive' ? 30 : 24} strokeWidth={1.5} aria-hidden="true" className="flex-none" />
            <span>
              <span className="block kufi text-[18px]">{t.onb.modes[m].t}</span>
              <span className={`block text-sm ${on ? 'text-white/85' : 'text-warm'}`}>{t.onb.modes[m].d}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

const toMin = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export default function Settings() {
  const { t } = useT()
  const { s, set } = useSettings()
  const nav = useNavigate()

  return (
    <AppShell>
      <h1 className="kufi text-[28px] text-ink">{t.settings.title}</h1>

      <section className="mt-6 flex flex-col gap-6">
        <div>
          <p className="text-sm text-warm mb-2">{t.settings.language}</p>
          <LangToggle />
        </div>

        <div>
          <p className="text-sm text-warm mb-2">{t.settings.mode}</p>
          <ModeOptions />
          {s.mode === 'ladies' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <Switch on={s.pregnancy} onChange={(v) => set({ pregnancy: v })} label={t.settings.pregnancy} />
            </motion.div>
          )}
        </div>

        <div className="rounded-lg bg-surface px-4 divide-y divide-line">
          <Switch on={s.ramadan} onChange={(v) => set({ ramadan: v })} label={t.settings.ramadan} hint={t.onb.ramadanD} />
          <Switch on={s.voice} onChange={(v) => set({ voice: v })} label={t.settings.voice} />
        </div>

        <div>
          <label htmlFor="role" className="text-sm text-warm mb-2 block">{t.settings.role}</label>
          <select id="role" value={s.role} onChange={(e) => set({ role: e.target.value as Role })}
            className="target w-full rounded-lg bg-surface px-4 text-[17px] text-ink">
            {(['meetings', 'deep', 'counter'] as Role[]).map((r) => <option key={r} value={r}>{t.onb.roles[r].t}</option>)}
          </select>
        </div>

        <div>
          <p className="text-sm text-warm mb-2">{t.settings.prayerTimes}</p>
          <div className="flex gap-2">
            {([['dhuhr', t.today.prayer.dhuhr], ['asr', t.today.prayer.asr]] as const).map(([k, label]) => (
              <label key={k} className="flex-1 rounded-lg bg-surface px-4 py-2 text-sm text-warm">
                {label}
                <input type="time" value={fromMin(s[k])} onChange={(e) => e.target.value && set({ [k]: toMin(e.target.value) })}
                  className="target block w-full bg-transparent text-[17px] text-ink" dir="ltr" />
              </label>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => { set({ onboarded: false }); nav('/app') }}
          className="target self-start px-4 rounded-lg bg-surface text-warm text-sm">{t.settings.redo}</button>
      </section>
    </AppShell>
  )
}
