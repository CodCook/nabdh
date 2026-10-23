import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'
import { sync } from '../../sync'
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

type Done = [boolean, boolean, boolean]
const NONE: Done = [false, false, false]

/** Three quiet steps. Each lights up in coral when that action happens in the phone; R clears them. */
function DemoSteps({ done }: { done: Done }) {
  const { t, n } = useT()
  const labels = [t.demo.steps.organize, t.demo.steps.plate, t.demo.steps.mode]
  const count = done.filter(Boolean).length
  return (
    <nav aria-label={t.demo.label} className="w-full">
      <ol className="flex items-center justify-between gap-6">
        {labels.map((label, i) => (
          <li key={i} className="contents">
            <span className="flex items-center gap-4" aria-current={done[i] ? 'step' : undefined}>
              <span
                className={`kufi flex-none w-14 h-14 rounded-full flex items-center justify-center text-[28px] transition-colors duration-500 ${done[i] ? 'bg-coral text-stage' : 'border border-sand/30 text-sand/45'}`}
              >
                {n(i + 1)}
              </span>
              <span className={`text-[30px] transition-colors duration-500 ${done[i] ? 'text-coral' : 'text-sand/45'}`}>
                {label}
                {done[i] && <span className="sr-only"> ✓</span>}
              </span>
            </span>
            {i < 2 && <ArrowRight size={32} strokeWidth={1.25} aria-hidden="true" className="rtl-flip flex-none text-sand/30" />}
          </li>
        ))}
      </ol>
      {/* the bar under the steps fills as they are reached (anchored at the reading start) */}
      <div className="mt-6 h-[2px] bg-sand/10 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={count} aria-label={t.demo.label}>
        <div className="h-full bg-coral transition-[width] duration-700 ease-out" style={{ width: `${(count / 3) * 100}%` }} />
      </div>
    </nav>
  )
}

/** #/demo: phone and stage side by side on one laptop. Check-ins travel over BroadcastChannel, no network. */
export default function Demo() {
  const { t, lang } = useT()
  const { s } = useSettings()
  const [k, setK] = useState(1)
  const [done, setDone] = useState<Done>(NONE)

  useEffect(() => {
    const f = () => setK(Math.min(window.innerWidth / W, window.innerHeight / H))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])

  const mark = useCallback((i: 0 | 1 | 2) => setDone((d) => (d[i] ? d : (d.map((v, j) => (j === i ? true : v)) as Done))), [])

  // step 1: "Organize my day" pressed in the phone (posted from inside the frame)
  // R: reset, whether pressed on this page or inside the phone (forwarded)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'nabdh-step' && e.data.step === 'organize') mark(0)
      if (e.data?.type === 'nabdh-key' && String(e.data.key).toLowerCase() === 'r') setDone(NONE)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key.toLowerCase() === 'r') setDone(NONE)
    }
    window.addEventListener('message', onMsg)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('message', onMsg)
      window.removeEventListener('keydown', onKey)
    }
  }, [mark])

  // step 2: a check-in published by the phone (the stage's own T/H keys are not phone actions)
  useEffect(() => sync().subscribe(() => mark(1)), [mark])

  // step 3: the mode changed in the phone (settings are shared across frames)
  const mode = useRef(s.mode)
  useEffect(() => {
    if (mode.current !== s.mode) mark(2)
    mode.current = s.mode
  }, [s.mode, mark])

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

        {/* the empty band under the stage: the three steps, with the privacy line and QR in the corner beside them */}
        <div className="absolute flex items-end justify-between gap-16" style={{ left: 616, right: 40, top: 56 + H * STAGE_K + 48, bottom: 40 }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex-1 self-center max-w-[800px]">
            <DemoSteps done={done} />
          </div>
          <footer className="flex-none w-[420px] flex flex-col items-end gap-4 text-end">
            <div className="flex items-center gap-4">
              <span className="text-[20px] text-sand/80">{t.stage.tryNow}</span>
              <AppQr size={88} label={`${t.stage.tryNow} — QR`} />
            </div>
            <p className="text-[16px] leading-snug text-sand/55">{t.stage.privacy}</p>
          </footer>
        </div>
        <p className="sr-only">{t.stage.hints}</p>
      </div>
    </div>
  )
}
