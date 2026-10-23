import { useEffect, useState } from 'react'
import { useT } from '../../i18n'
import AppQr from '../../components/AppQr'
import { StageView } from '../stage/Stage'

const W = 1920, H = 1080
const PHONE_W = 390, PHONE_H = 844, BEZEL = 14
const STAGE_K = 1344 / 1920 // the stage fills the right ~70%

/** A phone body: rounded corners, notch, home indicator, no brand marks. The screen is the real /app, fully interactive. */
function PhoneFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative" style={{ width: PHONE_W + BEZEL * 2, height: PHONE_H + BEZEL * 2 }}>
      {/* side keys */}
      <span className="absolute -left-[3px] top-[150px] w-[3px] h-[56px] rounded-l bg-stage-surface" aria-hidden="true" />
      <span className="absolute -left-[3px] top-[230px] w-[3px] h-[88px] rounded-l bg-stage-surface" aria-hidden="true" />
      <span className="absolute -right-[3px] top-[200px] w-[3px] h-[110px] rounded-r bg-stage-surface" aria-hidden="true" />
      <div className="absolute inset-0 rounded-[64px] bg-stage-surface" style={{ boxShadow: 'inset 0 0 0 2px rgba(245,240,232,0.14)' }}>
        <div className="absolute overflow-hidden bg-sand" style={{ inset: BEZEL, borderRadius: 50 }}>
          <iframe src={src} title={title} className="block border-0" style={{ width: PHONE_W, height: PHONE_H }} />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black pointer-events-none" style={{ top: BEZEL + 11, width: 116, height: 32 }} aria-hidden="true" />
        <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-ink/45 pointer-events-none" style={{ bottom: BEZEL + 8, width: 136, height: 5 }} aria-hidden="true" />
      </div>
    </div>
  )
}

/** #/demo: phone and stage side by side on one laptop. Check-ins travel over BroadcastChannel, no network. */
export default function Demo() {
  const { t, lang } = useT()
  const [k, setK] = useState(1)
  useEffect(() => {
    const f = () => setK(Math.min(window.innerWidth / W, window.innerHeight / H))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])

  const phoneSrc = `${window.location.href.split('#')[0]}#/app`

  return (
    <div className="fixed inset-0 bg-stage overflow-hidden flex items-center justify-center on-dark" dir="ltr">
      <div className="relative flex-none text-sand" style={{ width: W, height: H, transform: `scale(${k})` }}>
        {/* left ~30%: the phone */}
        <section className="absolute left-0 top-0 flex items-center justify-center" style={{ width: 576, height: H }} aria-label="Nabdh app">
          <PhoneFrame src={phoneSrc} title="نبض — التطبيق" />
        </section>

        {/* right ~70%: the stage, scaled to fit */}
        <section className="absolute overflow-hidden" style={{ left: 576, top: 56, width: 1344, height: H * STAGE_K }} aria-label="Nabdh stage">
          <div style={{ width: W, height: H, transform: `scale(${STAGE_K})`, transformOrigin: 'top left' }}>
            <StageView footer={false} />
          </div>
        </section>

        {/* bottom corner: privacy line and the small QR (the stage footer is hidden here) */}
        <footer className="absolute flex items-center justify-between gap-8" style={{ left: 616, right: 40, bottom: 40 }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <p className="text-[20px] text-sand/60">{t.stage.privacy}</p>
          <div className="flex items-center gap-4">
            <span className="text-[20px] text-sand/80">{t.stage.tryNow}</span>
            <AppQr size={88} label={`${t.stage.tryNow} — QR`} />
          </div>
        </footer>
        <p className="sr-only">{t.stage.hints}</p>
      </div>
    </div>
  )
}
