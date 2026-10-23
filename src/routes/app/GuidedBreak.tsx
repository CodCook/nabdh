import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'
import { buildRoutine, routineSeconds, WALK_BPM, WALK_BPM_RAMADAN } from '../../data/routines'
import { speak, spokenNumber, stopSpeaking } from '../../voice/speak'
import BigPulse from '../../components/BigPulse'
import AppShell from './AppShell'

const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

export default function GuidedBreak() {
  const { t, n, lang, mw } = useT()
  const { s, set } = useSettings()
  const nav = useNavigate()
  const loc = useLocation()
  void loc

  const routine = useMemo(() => buildRoutine({ mode: s.mode, ramadan: s.ramadan, pregnancy: s.pregnancy }), [s.mode, s.ramadan, s.pregnancy])
  const total = routineSeconds(routine)
  const adaptive = s.mode === 'adaptive'
  const walk = routine.kind === 'walk'

  const [idx, setIdx] = useState(0)
  const [left, setLeft] = useState(routine.steps[0].seconds)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const step = routine.steps[idx]
  const stepElapsed = useRef(0)
  stepElapsed.current = step.seconds - left

  // the clock: one tick a second while running
  useEffect(() => {
    if (paused || done) return
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1)
      setLeft((l) => l - 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused, done])

  // advance when a step runs out
  useEffect(() => {
    if (left > 0 || done) return
    if (idx + 1 < routine.steps.length) {
      setIdx(idx + 1)
      setLeft(routine.steps[idx + 1].seconds)
    } else {
      setDone(true)
      stopSpeaking()
    }
  }, [left, idx, done, routine])

  const instruction = walk ? (s.ramadan ? t.guided.ramadanCue : t.guided.walkCue) : t.guided.s[step.key]

  // voice: the instruction at the start of each step, then a count-along for reps and a countdown for holds
  useEffect(() => {
    if (!s.voice || paused || done) { stopSpeaking(); return }
    const timers: number[] = []
    const startMs = stepElapsed.current * 1000
    if (startMs < 800) speak(instruction, lang)
    if (step.reps) {
      const lead = 2800
      const gap = (step.seconds * 1000 - lead - 700) / step.reps
      for (let r = 1; r <= step.reps; r++) {
        const delay = lead + (r - 1) * gap - startMs
        if (delay >= 0) timers.push(window.setTimeout(() => speak(spokenNumber(r, lang), lang, 1.05), delay))
      }
    }
    return () => { timers.forEach(window.clearTimeout); stopSpeaking() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paused, done, s.voice, lang])

  useEffect(() => {
    if (!s.voice || paused || done || !step.hold || left > 3 || left < 1) return
    speak(spokenNumber(left, lang), lang, 1.1)
  }, [left]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopSpeaking(), [])

  const bpm = s.ramadan ? WALK_BPM_RAMADAN : WALK_BPM
  const moveMinutes = Math.max(1, Math.round(elapsed / 60))
  const title = walk ? t.guided.walkTitle : s.mode === 'ladies' ? t.guided.ladiesTitle : t.guided.adaptiveTitle
  const big = adaptive ? 'text-[26px]' : 'text-[22px]'

  const finish = () => nav('/app/checkin', { state: { minutes: moveMinutes } })

  return (
    <AppShell nav={false}>
      <div className="flex flex-col min-h-[calc(100dvh-72px)]">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => nav('/app')} aria-label={t.guided.quit} className="target w-14 flex items-center justify-center rounded-lg bg-surface">
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <h1 className="kufi text-lg text-ink">{title}</h1>
          <button type="button" onClick={() => set({ voice: !s.voice })} aria-pressed={s.voice}
            aria-label={s.voice ? t.guided.voiceOn : t.guided.voiceOff} className="target w-14 flex items-center justify-center rounded-lg bg-surface">
            {s.voice ? <Volume2 size={22} strokeWidth={1.5} aria-hidden="true" /> : <VolumeX size={22} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </header>

        {/* progress: one thin segment per step */}
        <div className="mt-6 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={elapsed}>
          {routine.steps.map((st, i) => (
            <span key={i} className="h-1 flex-1 rounded-full bg-line overflow-hidden">
              <motion.span className="block h-full bg-maroon origin-left rtl:origin-right" initial={false}
                animate={{ scaleX: i < idx || done ? 1 : i === idx ? 1 - left / st.seconds : 0 }} transition={{ duration: 0.3 }} />
            </span>
          ))}
        </div>

        <AnimatePresence>
          {done ? (
            <motion.section key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center gap-6">
              <BigPulse bpm={bpm} size={160} />
              <p className="kufi text-[28px] text-ink">{t.guided.finishBreak}</p>
              <p className="text-warm num">{adaptive ? `${t.guided.adaptiveCounter}: ${n(moveMinutes)}` : `${n(moveMinutes)} ${mw(moveMinutes)}`}</p>
              <button type="button" onClick={finish} className="target h-14 w-full rounded-lg bg-maroon text-white text-[18px] font-semibold">{t.checkin.plate}</button>
            </motion.section>
          ) : (
            <motion.section key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-6">
              <BigPulse bpm={bpm} paused={paused} size={walk ? 240 : 168} />
              <p className={`kufi ${adaptive ? 'text-[32px]' : 'text-[26px]'} leading-snug text-ink max-w-[22ch]`} aria-live="polite">{instruction}</p>
              <p className="kufi text-[88px] leading-none text-maroon num" dir="ltr" role="timer" aria-label={`${n(walk ? left : left)} ${t.guided.seconds}`}>
                {n(mmss(walk ? left : left))}
              </p>
              {step.hold && <p className={`${big} text-warm`}>{t.guided.hold} {n(step.seconds)} {t.guided.seconds}</p>}
              {adaptive ? (
                <p className={`${big} text-ink num`}>{t.guided.adaptiveCounter}: <span className="kufi">{n((elapsed / 60).toFixed(1))}</span></p>
              ) : !walk ? (
                <p className="text-warm num">{t.guided.step} {n(idx + 1)} {t.guided.of} {n(routine.steps.length)}</p>
              ) : null}
            </motion.section>
          )}
        </AnimatePresence>

        {!done && (
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={() => setPaused((p) => !p)}
              className="target h-14 flex-1 rounded-lg bg-surface text-ink text-[18px] font-semibold flex items-center justify-center gap-2">
              {paused ? <Play size={20} strokeWidth={1.5} aria-hidden="true" className="rtl-flip" /> : <Pause size={20} strokeWidth={1.5} aria-hidden="true" />}
              {paused ? t.guided.resume : t.guided.pause}
            </button>
            <button type="button" onClick={finish} className="target h-14 px-6 rounded-lg text-warm">{t.guided.quit}</button>
          </div>
        )}

        {adaptive && <p className="mt-6 text-sm text-warm text-center">{t.guided.therapist}</p>}
      </div>
    </AppShell>
  )
}
