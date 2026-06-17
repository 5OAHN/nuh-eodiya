import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import RouletteWheel from '../components/roulette/RouletteWheel'

export default function RoulettePage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()
  const { room, rouletteTargets, phase, loadDemoRoom, startRoulette } = useStore(s => ({
    room: s.room, rouletteTargets: s.rouletteTargets,
    phase: s.phase, loadDemoRoom: s.loadDemoRoom, startRoulette: s.startRoulette,
  }))

  useEffect(() => {
    if (!room) { loadDemoRoom(); setTimeout(() => startRoulette(), 100) }
    else if (rouletteTargets.length === 0) startRoulette()
  }, [])

  return (
    <div className="min-h-dvh bg-mcm-cream flex flex-col">
      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-mcm-border px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(`/room/${roomId}`)}
          className="w-9 h-9 rounded-full bg-mcm-warm flex items-center justify-center text-mcm-charcoal font-bold"
        >
          ←
        </button>
        <div>
          <h2 className="font-bold text-mcm-charcoal text-lg">지각자 처벌</h2>
          <p className="text-mcm-clay text-xs font-medium">룰렛이 결정합니다 🎰</p>
        </div>
      </div>

      {/* 룰렛 */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-5">
        <RouletteWheel />
      </div>

      {/* 결과 후 버튼 */}
      {phase === 'done' && (
        <div
          className="flex-shrink-0 bg-white border-t border-mcm-border px-4 pt-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => navigate(`/room/${roomId}`)}
            className="btn-mcm-primary py-4 w-full text-base font-bold"
          >
            🗺️ 지도로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
