import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'
import type { Block, Plan } from '../../engine/cadence'
import { SAMPLE_DAY, TIMELINE_END, TIMELINE_START } from '../../data/sampleDay'

const PX = 2 // px per minute
const top = (m: number) => (m - TIMELINE_START) * PX
const HOURS = Array.from({ length: 8 }, (_, i) => (8 + i) * 60) // whole hours, 08:00 to 15:00

interface Props {
  plan: Plan
  organized: boolean
  role: string
  onBreak: (b: Block) => void
}

export default function Timeline({ plan, organized, role, onBreak }: Props) {
  const { t, n, clock } = useT()
  const { s } = useSettings()
  const adaptive = s.mode === 'adaptive'

  // before organizing, show the day as Outlook has it; after, the shortened blocks
  const meetings = role === 'meetings' ? plan.schedule.filter((b) => b.type === 'meeting') : []
  const buffers = plan.schedule.filter((b) => b.type === 'buffer')
  const breaks = plan.breaks
  const lunch = plan.breaks.find((b) => b.reason === 'lunch')
  const original = new Map(SAMPLE_DAY.map((m) => [m.id, m]))

  const reasonLabel = (b: Block) =>
    b.reason === 'lunch' ? t.today.lunchPeak : b.reason === 'prayer' ? t.today.afterPrayer : b.reason === 'meetingEnd' ? t.today.meetingEnd : t.today.spacing

  return (
    <div className="relative" style={{ height: (TIMELINE_END - TIMELINE_START) * PX + 16 }}>
      {/* hour rules */}
      {HOURS.map((h) => (
        <div key={h} className="absolute inset-x-0 flex items-center" style={{ top: top(h) }}>
          <span className="w-12 flex-none text-xs text-warm num">{clock(h)}</span>
          <span className="flex-1 h-px bg-line/70" />
        </div>
      ))}

      {/* prayer markers */}
      {([['dhuhr', s.dhuhr], ['asr', s.asr]] as const).map(([k, m]) => (
        <div key={k} className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: top(m) }}>
          <span className="w-12 flex-none" />
          <span className="flex-1 border-t border-dashed border-warm/60" />
          <span className="absolute end-0 -translate-y-full text-[11px] text-warm bg-sand ps-1 num">{t.today.prayer[k]} {clock(m)}</span>
        </div>
      ))}

      {/* meetings */}
      <div className="absolute inset-y-0 start-12 end-0">
        {meetings.map((b) => {
          const o = original.get(b.id)
          const end = organized ? b.end : (b.originalEnd ?? b.end)
          const vip = b.kind === 'vip'
          const cut = organized && b.originalEnd ? b.originalEnd - b.end : 0
          return (
            <motion.div
              key={b.id}
              layout="position"
              initial={false}
              animate={{ height: (end - b.start) * PX - 2 }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute inset-x-0 overflow-hidden rounded-lg bg-surface px-3 py-2 border ${vip ? 'border-gold border-2' : 'border-maroon'}`}
              style={{ top: top(b.start) + 1 }}
              aria-label={`${t.meetings[b.titleKey as keyof typeof t.meetings]}, ${clock(b.start)}–${clock(end)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-medium leading-snug text-ink">{t.meetings[b.titleKey as keyof typeof t.meetings]}</p>
                {cut > 0 && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xs text-maroon flex-none num">−{n(cut)} {t.min}</motion.span>
                )}
              </div>
              <p className="text-xs text-warm num">
                {clock(b.start)}–{clock(end)} · {vip ? t.today.vip : b.kind === 'external' ? t.today.external : t.today.internal}
                {o?.recurring ? ` · ${t.meetings.recurring}` : ''}
              </p>
            </motion.div>
          )
        })}

        {/* VIP / external recovery buffers */}
        <AnimatePresence>
          {organized && buffers.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
              style={{ top: top(b.start) + 1, height: (b.end - b.start) * PX - 2, originY: 0 }}
              className="absolute inset-x-0 rounded-sm border border-dashed border-gold bg-gold/15 flex items-center px-3"
            >
              <span className="text-[11px] text-[#7a5d2e] leading-none">{t.today.buffer} · {n(b.end - b.start)} {t.min}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* movement breaks: coral pulse dots slide into the freed gaps */}
        <AnimatePresence>
          {organized && breaks.map((b, i) => (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => onBreak(b)}
              aria-label={`${adaptive ? t.today.breakLblAdaptive : t.today.breakLbl}, ${clock(b.start)}, ${n(b.end - b.start)} ${t.min}`}
              initial={{ opacity: 0, x: s.lang === 'ar' ? -56 : 56 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.5 + i * 0.22 }}
              className="absolute inset-x-0 flex items-center gap-2 text-start after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']"
              style={{ top: top(b.start), height: Math.max(20, (b.end - b.start) * PX) }}
            >
              <span className="relative flex-none w-3 h-3 ms-1">
                <span className="absolute inset-0 rounded-full bg-coral" />
                <motion.span className="absolute inset-0 rounded-full border-2 border-coral"
                  animate={{ scale: [1, 2.6], opacity: [0.9, 0] }}
                  transition={{ duration: 60 / (s.ramadan ? 40 : 72) * 1.6, repeat: Infinity, ease: 'easeOut' }} />
              </span>
              <span className="text-[12px] text-ink leading-none num whitespace-nowrap">
                <span className="font-medium">{n(b.end - b.start)} {t.min}</span>
                <span className="text-warm"> · {clock(b.start)} · {reasonLabel(b)}</span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
        {organized && lunch && <span className="sr-only">{t.today.lunchPeak}</span>}
      </div>
    </div>
  )
}
