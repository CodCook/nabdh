import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'ar' | 'en'
export type Role = 'meetings' | 'deep' | 'counter'
export type Mode = 'masar' | 'ladies' | 'adaptive'

export interface Settings {
  lang: Lang
  role: Role
  mode: Mode
  pregnancy: boolean
  ramadan: boolean
  voice: boolean
  dept: string
  onboarded: boolean
  dhuhr: number // minutes since midnight
  asr: number
  pavsWeekly: number | null
}

const DEFAULTS: Settings = {
  lang: 'ar', role: 'meetings', mode: 'masar', pregnancy: false, ramadan: false, voice: false,
  dept: 'hr', onboarded: false, dhuhr: 11 * 60 + 20, asr: 14 * 60 + 35, pavsWeekly: null,
}
const KEY = 'nabdh.settings.v1'

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch { /* storage unavailable */ }
  return DEFAULTS
}

interface Ctx { s: Settings; set: (p: Partial<Settings>) => void }
const SettingsCtx = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(load)

  const set = useCallback((p: Partial<Settings>) => {
    setS((prev) => {
      const next = { ...prev, ...p }
      // adaptive mode: voice on by default when entering it
      if (p.mode === 'adaptive' && prev.mode !== 'adaptive' && p.voice === undefined) next.voice = true
      return next
    })
  }, [])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
  }, [s])

  // other frames of the same app (the #/demo phone and stage) stay in step, e.g. language
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return
      setS((prev) => (JSON.stringify(prev) === e.newValue ? prev : { ...DEFAULTS, ...JSON.parse(e.newValue!) }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // global effects: direction, language, mode, pulse speed (Ramadan slows the whole app)
  useEffect(() => {
    const el = document.documentElement
    el.lang = s.lang
    el.dir = s.lang === 'ar' ? 'rtl' : 'ltr'
    el.dataset.mode = s.mode
    el.style.setProperty('--pulse-bpm', s.ramadan ? '40' : '72')
  }, [s.lang, s.mode, s.ramadan])

  const value = useMemo(() => ({ s, set }), [s, set])
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>
}

export function useSettings() {
  const c = useContext(SettingsCtx)
  if (!c) throw new Error('SettingsProvider missing')
  return c
}
