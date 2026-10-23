import ar from './ar'
import en from './en'
import { useSettings, type Lang } from '../state/settings'

const dicts = { ar, en }
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Arabic-Indic numerals in Arabic mode, Western in English mode. */
export function fmt(v: number | string, lang: Lang): string {
  const s = typeof v === 'number' ? v.toLocaleString('en-US') : v
  if (lang === 'en') return s
  return s.replace(/\d/g, (d) => AR_DIGITS[+d]).replace(/,/g, '٬').replace(/\./g, '٫')
}

/** minutes since midnight -> "10:42" (localized digits) */
export function fmtClock(min: number, lang: Lang): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60), mm = m % 60
  // isolate so ranges like "08:00–08:50" never get reordered inside RTL text
  return `⁦${fmt(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, lang)}⁩`
}

export function useT() {
  const { s } = useSettings()
  const t = dicts[s.lang]
  const mw = (c: number) => (s.lang === 'en' ? (c === 1 ? 'minute' : 'minutes') : c === 1 ? 'دقيقة' : c === 2 ? 'دقيقتان' : c >= 3 && c <= 10 ? 'دقائق' : 'دقيقة')
  return { t, lang: s.lang, mw, n: (v: number | string) => fmt(v, s.lang), clock: (m: number) => fmtClock(m, s.lang) }
}
