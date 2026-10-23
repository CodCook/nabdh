import { Navigate, Route, Routes } from 'react-router-dom'
import { useSettings } from '../../state/settings'
import Today from './Today'
import GuidedBreak from './GuidedBreak'
import CheckIn from './CheckIn'
import Relay from './Relay'
import Progress from './Progress'
import Settings from './Settings'
import Onboarding from './Onboarding'

export default function AppRoute() {
  const { s } = useSettings()
  // first visit only: onboarding, then the app (the flag lives in localStorage)
  if (!s.onboarded) return <Onboarding />
  return (
    <Routes>
      <Route index element={<Today />} />
      <Route path="break" element={<GuidedBreak />} />
      <Route path="checkin" element={<CheckIn />} />
      <Route path="relay" element={<Relay />} />
      <Route path="progress" element={<Progress />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
