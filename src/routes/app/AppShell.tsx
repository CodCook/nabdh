import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, CalendarDays, Settings as Gear, Workflow } from 'lucide-react'
import { useT } from '../../i18n'
import { useSettings } from '../../state/settings'

/** Phone frame: max 430px, centered on desktop, sand background, bottom navigation. */
export default function AppShell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { t } = useT()
  const { s } = useSettings()
  const items = [
    { to: '/app', end: true, icon: CalendarDays, label: t.nav.today },
    ...(s.role === 'counter' ? [{ to: '/app/relay', end: false, icon: Workflow, label: t.nav.relay }] : []),
    { to: '/app/progress', end: false, icon: Activity, label: t.nav.progress },
    { to: '/app/settings', end: false, icon: Gear, label: t.nav.settings },
  ]
  return (
    <div className="app-root min-h-full flex justify-center bg-sand">
      <div className="relative w-full max-w-[430px] min-h-full flex flex-col bg-sand lg:border-x lg:border-line">
        <main className="flex-1 px-6 pt-6 pb-32">{children}</main>
        {nav && (
          <nav aria-label="Main" className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-[430px] bg-surface border-t border-line flex justify-around px-2 pb-2 pt-1">
            {items.map(({ to, end, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={end} aria-label={label}
                className={({ isActive }) => `target flex-1 flex flex-col items-center justify-center gap-1 text-xs rounded-lg ${isActive ? 'text-maroon' : 'text-warm'}`}>
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                    <span className={isActive ? 'font-semibold' : ''}>{label}</span>
                    <span className={`h-px w-6 ${isActive ? 'bg-maroon' : 'bg-transparent'}`} aria-hidden="true" />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
