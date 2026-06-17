import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import RouletteWheel from '../components/roulette/RouletteWheel'

export default function RoulettePage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { room, rouletteTargets, phase, loadDemoRoom, startRoulette } = useStore(s => ({
    room: s.room,
    rouletteTargets: s.rouletteTargets,
    phase: s.phase,
    loadDemoRoom: s.loadDemoRoom,
    startRoulette: s.startRoulette,
  }))

  useEffect(() => {
    if (!room) {
      loadDemoRoom()
      setTimeout(() => startRoulette(), 100)
    } else if (rouletteTargets.length === 0) {
      startRoulette()
    }
  }, [])

  return (
    <div className="min-h-dvh bg-kitsch-dark flex flex-col">
      {/* 헤더 */}
      <div className="bg-red-600 border-b-4 border-black px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/room/${roomId}`)}
          className="text-white text-2xl font-black"
        >
          ←
        </button>
        <h2 className="font-display text-2xl font-black text-white">⚡ 지각자 처벌</h2>
        <div className="ml-auto text-white animate-pulse text-xl">🚨</div>
      </div>

      {/* 룰렛 영역 */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        <RouletteWheel />
      </div>

      {/* 결과 후 버튼 */}
      {phase === 'done' && (
        <div className="p-4 border-t-4 border-black bg-kitsch-dark">
          <button
            onClick={() => navigate(`/room/${roomId}`)}
            className="btn-kitsch bg-kitsch-blue text-white text-lg py-4 w-full font-black"
          >
            🗺️ 지도로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
