import { Route, Routes } from 'react-router-dom'
import Today from './Today'

export default function AppRoute() {
  return (
    <Routes>
      <Route index element={<Today />} />
      <Route path="*" element={<Today />} />
    </Routes>
  )
}
