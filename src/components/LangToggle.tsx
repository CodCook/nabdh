import { useSettings } from '../state/settings'

export default function LangToggle({ dark = false }: { dark?: boolean }) {
  const { s, set } = useSettings()
  const base = 'target px-4 text-sm rounded-lg transition-colors'
  const on = dark ? 'bg-sand text-stage' : 'bg-maroon text-white'
  const off = dark ? 'text-sand/70' : 'text-warm'
  return (
    <div role="group" aria-label="Language / اللغة" className={`inline-flex gap-1 p-1 rounded-lg ${dark ? 'bg-stage-surface' : 'bg-surface'}`} dir="ltr">
      {(['ar', 'en'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={s.lang === l} lang={l}
          className={`${base} ${s.lang === l ? on : off}`} onClick={() => set({ lang: l })}>
          {l === 'ar' ? 'عربي' : 'English'}
        </button>
      ))}
    </div>
  )
}
