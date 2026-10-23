import ar from './ar'
import en from './en'
import { useSettings, type Lang } from '../state/settings'

const dicts = { ar, en }
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Arabic-Indic numerals in Arabic mode, Western in English mode. */
export function fmt(v: number | string, lang: Lang): string {
  const s = typeof v === 'number' ? v.toLocaleString('en-US') : v
  if (lang === 'en') return s
  return s.replace(/\d/g, (d) => AR_DIGITS[+d]).replace(/,/g, '٬')
}

/** minutes since midnight -> "10:42" (localized digits) */
export function fmtClock(min: number, lang: Lang): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60), mm = m % 60
  return fmt(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, lang)
}

export function useT() {
  const { s } = useSettings()
  const t = dicts[s.lang]
  return { t, lang: s.lang, n: (v: number | string) => fmt(v, s.lang), clock: (m: number) => fmtClock(m, s.lang) }
}
