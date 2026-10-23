import { Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { SettingsProvider } from './state/settings'
import AppRoute from './routes/app/AppRoute'
import Stage from './routes/stage/Stage'
import Demo from './routes/demo/Demo'

export default function App() {
  return (
    <SettingsProvider>
      <MotionConfig reducedMotion="user">
        <Routes>
          <Route path="/app/*" element={<AppRoute />} />
          <Route path="/stage" element={<Stage />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </MotionConfig>
    </SettingsProvider>
  )
}
