import { Route, Routes } from 'react-router-dom'
import Today from './Today'
import GuidedBreak from './GuidedBreak'
import CheckIn from './CheckIn'

export default function AppRoute() {
  return (
    <Routes>
      <Route index element={<Today />} />
      <Route path="break" element={<GuidedBreak />} />
      <Route path="checkin" element={<CheckIn />} />
      <Route path="*" element={<Today />} />
    </Routes>
  )
}
