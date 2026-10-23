import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useT } from '../../i18n'

export default function NudgeBanner({ open, onStart, onLater }: { open: boolean; onStart: () => void; onLater: () => void }) {
  const { t } = useT()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alert"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="fixed top-[calc(var(--safe-top,0px)+16px)] inset-x-4 mx-auto max-w-[398px] z-20 bg-maroon text-white rounded-lg p-4 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <Bell size={22} strokeWidth={1.5} aria-hidden="true" className="flex-none mt-1" />
            <p className="text-[17px] leading-snug">{t.today.nudge}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onStart} className="target flex-1 bg-white text-maroon rounded-lg font-semibold">{t.today.startBreak}</button>
            <button type="button" onClick={onLater} className="target px-4 rounded-lg text-white/90">{t.today.later}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
