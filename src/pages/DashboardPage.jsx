import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import CountdownTimer from '../components/map/CountdownTimer'
import KakaoMap from '../components/map/KakaoMap'
import MemberStatusList from '../components/map/MemberStatusList'

export default function DashboardPage() {
  const { roomId }    = useParams()
  const navigate      = useNavigate()
  const { room, members, myId, isHost, phase, startRoulette, loadDemoRoom } = useStore(s => ({
    room: s.room, members: s.members, myId: s.myId,
    isHost: s.isHost, phase: s.phase,
    startRoulette: s.startRoulette, loadDemoRoom: s.loadDemoRoom,
  }))

  const [shareToast, setShareToast] = useState(false)

  useEffect(() => { if (!room) loadDemoRoom() }, [])
  useEffect(() => {
    if (phase === 'roulette' || phase === 'done') navigate(`/roulette/${roomId}`)
  }, [phase])

  const handleShare = async () => {
    const url = `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}/join/${room?.id || roomId}`
    try {
      const Kakao = await window.loadKakaoSDK()
      if (Kakao?.isInitialized()) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${room?.title || '너 어디야?'} 📍`,
            description: `📍 ${room?.destination?.name || '약속 장소'} | 지금 바로 참가해!`,
            imageUrl: 'https://via.placeholder.com/800x400/4A7C9E/ffffff?text=%EB%84%88+%EC%96%B4%EB%94%94%EC%95%BC',
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '참가하기 📍', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      }
    } catch {}
    if (navigator.share) {
      navigator.share({ title: room?.title || '너 어디야', url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2200)
    }
  }

  const arrivedCount = members.filter(m => m.status === 'arrived').length
  const movingCount  = members.filter(m => m.status === 'moving').length
  const waitingCount = members.filter(m => m.status === 'waiting').length

  if (!room) return (
    <div className="min-h-dvh bg-mcm-cream flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-float">📍</div>
        <p className="text-mcm-stone font-medium">위치 연결 중...</p>
      </div>
    </div>
  )

  return (
    /*
      전체 레이아웃: dvh 고정, flex-col
      ① 카운트다운 (고정 높이)
      ② 방 정보 바 (고정 높이)
      ③ 지도 (flex-1 → 남은 공간 가득)
      ④ 멤버 리스트 (고정 최대 높이, 스크롤)
      ⑤ 하단 액션 바 (고정, safe-area 처리)
    */
    <div className="h-dvh flex flex-col bg-mcm-cream overflow-hidden">

      {/* ① 카운트다운 */}
      <div className="flex-shrink-0 shadow-mcm-sm z-10">
        <CountdownTimer meetingTime={room.meetingTime} />
      </div>

      {/* ② 방 정보 바 */}
      <div className="flex-shrink-0 bg-white border-b border-mcm-border px-4 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-bold text-mcm-charcoal text-sm leading-tight truncate">{room.title}</p>
          <p className="text-mcm-stone text-xs mt-0.5 truncate">📍 {room.destination?.name}</p>
        </div>
        {/* 미니 상태 뱃지 */}
        <div className="flex gap-1.5 flex-shrink-0 ml-3">
          <span className="badge-arrived">✅ {arrivedCount}</span>
          <span className="badge-moving">🏃 {movingCount}</span>
          <span className="badge-waiting">🛋️ {waitingCount}</span>
        </div>
      </div>

      {/* ③ 지도 (flex-1) */}
      <div className="flex-1 relative min-h-0">
        <KakaoMap members={members} destination={room.destination} />

        {/* 공유 FAB */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 right-3 z-10
                     bg-white shadow-mcm rounded-pill
                     px-4 py-2 text-sm font-bold text-mcm-charcoal
                     flex items-center gap-1.5
                     hover:shadow-mcm-lg active:scale-95 transition-all duration-150"
        >
          🔗 공유
        </button>

        {/* 링크 복사 토스트 */}
        {shareToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                          bg-white shadow-mcm rounded-pill
                          px-4 py-2 text-sm font-bold text-mcm-pistachio
                          animate-bouncy whitespace-nowrap">
            📋 링크 복사됨!
          </div>
        )}
      </div>

      {/* ④ 멤버 리스트 (최대 40% 높이, 스크롤) */}
      <div className="flex-shrink-0 max-h-[40vh] overflow-y-auto no-scrollbar shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <MemberStatusList members={members} />
      </div>

      {/* ⑤ 하단 액션 바 (방장 전용 룰렛 버튼 포함) */}
      <div
        className="flex-shrink-0 bg-white border-t border-mcm-border px-4 pt-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {isHost ? (
          <button
            onClick={() => startRoulette()}
            className="btn-mcm bg-mcm-clay text-white font-bold py-3.5 w-full text-base shadow-mcm
                       hover:brightness-105 active:scale-95 transition-all duration-200 rounded-pill"
          >
            🎰  지각자 룰렛 시작하기
          </button>
        ) : (
          <p className="text-center text-mcm-stone text-xs font-medium py-1">
            방장이 룰렛을 시작하면 자동으로 이동됩니다
          </p>
        )}
      </div>
    </div>
  )
}
