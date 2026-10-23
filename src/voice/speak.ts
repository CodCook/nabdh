import type { Lang } from '../state/settings'

const AR_NUM = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة']
const EN_NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

export const spokenNumber = (n: number, lang: Lang) => (lang === 'ar' ? AR_NUM : EN_NUM)[n] ?? String(n)

const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string, lang: Lang, rate = 0.95) {
  if (!supported()) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
  u.rate = rate
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang === 'ar' ? 'ar' : 'en'))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel()
}
