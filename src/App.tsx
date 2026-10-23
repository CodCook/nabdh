import { Navigate, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from './state/settings'
import AppRoute from './routes/app/AppRoute'
import Stage from './routes/stage/Stage'

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/app/*" element={<AppRoute />} />
        <Route path="/stage" element={<Stage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </SettingsProvider>
  )
}
