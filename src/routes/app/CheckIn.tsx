import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Lock, Nfc, TimerOff } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'
import { lastCheckinTs, recordBreak } from '../../state/progress'
import { deptById } from '../../data/departments'
import { sync, type CheckinEvent } from '../../sync'
import { useNow } from '../../lib/time'
import AppShell from './AppShell'

const COOLDOWN_MS = 60_000

export default function CheckIn() {
  const { t, n, clock, lang } = useT()
  const { s } = useSettings()
  const nav = useNavigate()
  const loc = useLocation()
  const minutes = (loc.state as { minutes?: number } | null)?.minutes ?? 3
  const now = useNow(250)

  const [ripple, setRipple] = useState(0)
  const [sent, setSent] = useState<CheckinEvent | null>(null)
  const [rejected, setRejected] = useState(false)
  const [open, setOpen] = useState(false)

  const dept = deptById(s.dept)
  const deptName = t.stage.depts[dept.id]
  const remaining = Math.max(0, Math.ceil((lastCheckinTs() + COOLDOWN_MS - now) / 1000))

  const press = () => {
    setRipple((r) => r + 1)
    if (Date.now() - lastCheckinTs() < COOLDOWN_MS) {
      setRejected(true)
      return
    }
    setRejected(false)
    const evt: CheckinEvent = { dept: dept.code, mode: s.mode, ts: Date.now() }
    recordBreak(minutes, evt.ts)
    sync().publish(evt) // the only data that leaves the device
    setSent(evt)
  }

  const d = sent ? new Date(sent.ts) : null
  const sentClock = d ? clock(d.getHours() * 60 + d.getMinutes()) : ''
  const receipt = `${t.checkin.sent}: ${lang === 'ar' ? `${t.checkin.dept} ${deptName}` : `${deptName} ${t.checkin.dept}`} · ${sentClock} · ${t.checkin.modeNames[s.mode]}`
  const payload = sent ? `{ "dept": "${sent.dept}", "mode": "${sent.mode}", "ts": ${sent.ts} }` : ''

  return (
    <AppShell nav={false}>
      <div className="flex flex-col items-center min-h-[calc(100dvh-72px)] text-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
          {/* the plate */}
          <div className="relative w-[240px] h-[240px] flex items-center justify-center">
            {ripple > 0 && [0, 1, 2].map((i) => (
              <motion.span key={`${ripple}-${i}`} className="absolute inset-0 rounded-full border-2 border-coral pointer-events-none"
                initial={{ scale: 0.7, opacity: 0.8 }} animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.4, delay: i * 0.25, ease: 'easeOut' }} />
            ))}
            <button type="button" onClick={press} aria-label={`${t.checkin.plate} — ${t.checkin.plateSub}`}
              className="relative w-[200px] h-[200px] rounded-full bg-maroon text-white flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
              <Nfc size={44} strokeWidth={1.25} aria-hidden="true" />
              <span className="kufi text-[24px]">{t.checkin.plate}</span>
              <span className="text-sm text-white/80">{t.checkin.plateSub}</span>
            </button>
          </div>

          <div className="w-full min-h-[200px]" aria-live="polite">
            <AnimatePresence>
              {rejected && (
                <motion.div key="rej" role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border-2 border-maroon bg-surface p-4 flex items-center gap-3 text-start">
                  <TimerOff size={24} strokeWidth={1.5} className="text-maroon flex-none" aria-hidden="true" />
                  <p className="text-[17px] text-ink leading-snug">
                    {t.checkin.cooldown} <span className="num kufi">{n(remaining || 60)}</span> {t.checkin.seconds}
                  </p>
                </motion.div>
              )}
              {!rejected && sent && (
                <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-surface p-4 text-start">
                  <p className="text-[17px] font-medium text-ink leading-snug num">{receipt}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-warm">
                    <Lock size={16} strokeWidth={1.5} aria-hidden="true" className="flex-none" />{t.checkin.noId}
                  </p>
                  <div className="mt-3 border-t border-line pt-3">
                    <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
                      className="target w-full flex items-center justify-between text-sm text-ink">
                      <span>{t.checkin.payload}</span>
                      <span className="flex items-center gap-1 text-warm">{open ? t.checkin.hide : t.checkin.show}
                        <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.pre initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          dir="ltr" className="overflow-hidden text-start text-[13px] leading-relaxed text-ink bg-sand rounded-lg px-3 py-2 font-mono whitespace-pre-wrap break-all">
                          {payload}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {(sent || rejected) && (
          <button type="button" onClick={() => nav('/app')} className="target h-14 w-full rounded-lg bg-surface text-ink text-[18px] font-semibold">{t.checkin.again}</button>
        )}
      </div>
    </AppShell>
  )
}
