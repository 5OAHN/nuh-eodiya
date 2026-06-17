import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinPage from './pages/JoinPage'
import DashboardPage from './pages/DashboardPage'
import RoulettePage from './pages/RoulettePage'

export default function App() {
  return (
    <div className="max-w-[430px] mx-auto min-h-dvh relative bg-kitsch-dark">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join/:roomId" element={<JoinPage />} />
        <Route path="/room/:roomId" element={<DashboardPage />} />
        <Route path="/roulette/:roomId" element={<RoulettePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
