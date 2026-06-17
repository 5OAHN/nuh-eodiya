import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useRoomRestore } from '../hooks/useRoomRestore'
import RouletteWheel from '../components/roulette/RouletteWheel'

export default function RoulettePage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()

  const { phase, startRoulette, rouletteTargets, resetPhase } = useStore(s => ({
    phase:           s.phase,
    startRoulette:   s.startRoulette,
    rouletteTargets: s.rouletteTargets,
    resetPhase:      s.resetPhase,
  }))

  const { restoreState } = useRoomRestore(roomId)

  useEffect(() => {
    if (restoreState !== 'ok') return
    if (rouletteTargets.length === 0) startRoulette()
  }, [restoreState])

  // ── 버그2 수정: 지도로 돌아갈 때 phase를 'live'로 리셋 ──
  const handleBackToMap = () => {
    resetPhase()
    navigate(`/room/${roomId}`, { replace: true })
  }

  if (restoreState === 'loading') {
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🎰</div>
          <p className="text-mcm-stone font-medium">룰렛 준비 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {/* 헤더 — 뒤로가기도 phase 리셋 */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={handleBackToMap}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-mcm-charcoal font-bold hover:bg-gray-200 transition-colors"
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
          className="flex-shrink-0 bg-white border-t border-neutral-200 px-4 pt-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={handleBackToMap}
            className="btn-mcm-primary py-4 w-full text-base font-bold"
          >
            🗺️ 지도로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
