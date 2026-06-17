import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage      from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinPage      from './pages/JoinPage'
import DashboardPage from './pages/DashboardPage'
import RoulettePage  from './pages/RoulettePage'

export default function App() {
  return (
    <div className="max-w-[430px] mx-auto min-h-dvh relative bg-gray-50">
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/create"            element={<CreateRoomPage />} />
        {/* /join/input → 데모 참가, /join/:roomId → 실제 방 참가 */}
        <Route path="/join/:roomId"      element={<JoinPage />} />
        {/* /room/:roomId → URL만으로 방 상태 복원 가능 */}
        <Route path="/room/:roomId"      element={<DashboardPage />} />
        <Route path="/roulette/:roomId"  element={<RoulettePage />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
