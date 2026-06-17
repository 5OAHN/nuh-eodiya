import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useRealtime } from '../hooks/useRealtime'
import { useRoomRestore } from '../hooks/useRoomRestore'
import CountdownTimer from '../components/map/CountdownTimer'
import KakaoMap from '../components/map/KakaoMap'
import MemberStatusList from '../components/map/MemberStatusList'

export default function DashboardPage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()

  const { room, members, myId, isHost, phase, startRoulette, leaveRoom } = useStore(s => ({
    room:          s.room,
    members:       s.members,
    myId:          s.myId,
    isHost:        s.isHost,
    phase:         s.phase,
    startRoulette: s.startRoulette,
    leaveRoom:     s.leaveRoom,
  }))

  // ── 새로고침/직접접속 시 상태 복원 ──
  const { restoreState, errorMsg, retry } = useRoomRestore(roomId)

  // ── 실시간 GPS + Supabase 구독 (복원 완료 후에만 활성) ──
  useRealtime(restoreState === 'ok' ? roomId : null)

  const mapRef = useRef(null)
  const [shareToast, setShareToast]   = useState(false)
  const [focusedMember, setFocusedMember] = useState(null)

  useEffect(() => {
    if (phase === 'roulette' || phase === 'done') navigate(`/roulette/${roomId}`)
  }, [phase])

  const handleFocus = (member) => {
    setFocusedMember(member)
    if (member) mapRef.current?.focusMember(member)
    else        mapRef.current?.resetView()
  }

  const handleShare = async () => {
    const url = `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}/join/${room?.id || roomId}`
    try {
      const Kakao = await window.loadKakaoSDK()
      if (Kakao?.isInitialized()) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${room?.title || '너 어디야?'} 📍`,
            description: `📍 ${room?.destination?.name} | 지금 바로 참가해!`,
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

  // ── 로딩 화면 ──
  if (restoreState === 'loading') {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl animate-float">📍</div>
        <div className="text-center">
          <p className="font-bold text-mcm-charcoal text-lg mb-1">방 정보 불러오는 중...</p>
          <p className="text-mcm-stone text-sm">잠시만 기다려주세요</p>
        </div>
        {/* 로딩 인디케이터 */}
        <div className="flex gap-1.5 mt-2">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-mcm-blue animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── 에러 화면 ──
  if (restoreState === 'error') {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-5 px-6">
        <div className="text-5xl">😵</div>
        <div className="card-mcm p-6 text-center w-full max-w-[320px]">
          <p className="font-bold text-mcm-charcoal text-lg mb-2">앗, 문제가 생겼어요</p>
          <p className="text-mcm-stone text-sm mb-5">{errorMsg}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-mcm-ghost py-3 flex-1 text-sm font-bold rounded-pill"
            >
              홈으로
            </button>
            <button
              onClick={retry}
              className="btn-mcm-primary py-3 flex-1 text-sm font-bold"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const arrivedCount = members.filter(m => m.status === 'arrived').length
  const movingCount  = members.filter(m => m.status === 'moving').length
  const waitingCount = members.filter(m => m.status === 'waiting').length

  return (
    <div className="h-dvh flex flex-col bg-gray-50 overflow-hidden">

      {/* ① 카운트다운 */}
      <div className="flex-shrink-0 z-10 shadow-sm">
        <CountdownTimer meetingTime={room.meetingTime} />
      </div>

      {/* ② 방 정보 바 */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-bold text-mcm-charcoal text-sm leading-tight truncate">{room.title}</p>
          <p className="text-mcm-stone text-xs mt-0.5 truncate">📍 {room.destination?.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <div className="flex gap-1">
            <span className="badge-arrived">✅ {arrivedCount}</span>
            <span className="badge-moving">🏃 {movingCount}</span>
            <span className="badge-waiting">🛋️ {waitingCount}</span>
          </div>
          {/* 나가기 버튼 */}
          <button
            onClick={() => { leaveRoom(); navigate('/') }}
            className="text-mcm-stone text-xs font-medium hover:text-mcm-clay transition-colors ml-1"
            title="방 나가기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ③ 지도 */}
      <div className="flex-1 relative min-h-0">
        <KakaoMap ref={mapRef} members={members} destination={room.destination} />

        {/* 포커싱 중 전체보기 버튼 */}
        {focusedMember && (
          <button
            onClick={() => handleFocus(null)}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10
                       bg-mcm-blue text-white text-xs font-bold
                       px-3 py-1.5 rounded-pill shadow-md
                       flex items-center gap-1.5 animate-bouncy whitespace-nowrap"
          >
            🗺️ 전체 보기
          </button>
        )}

        {/* 공유 FAB */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 right-3 z-10
                     bg-white border border-neutral-200 shadow-lg rounded-pill
                     px-4 py-2 text-sm font-bold text-mcm-charcoal
                     flex items-center gap-1.5
                     hover:shadow-xl active:scale-95 transition-all duration-150"
        >
          🔗 공유
        </button>

        {/* GPS 상태 */}
        <GpsIndicator members={members} myId={myId} />

        {shareToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                          bg-white border border-neutral-200 shadow-lg rounded-pill
                          px-4 py-2 text-sm font-bold text-mcm-pistachio
                          animate-bouncy whitespace-nowrap">
            📋 링크 복사됨!
          </div>
        )}
      </div>

      {/* ④ 멤버 리스트 */}
      <div className="flex-shrink-0 max-h-[40vh] overflow-y-auto no-scrollbar shadow-[0_-4px_20px_rgba(0,0,0,0.06)] bg-white">
        <MemberStatusList members={members} onFocus={handleFocus} />
      </div>

      {/* ⑤ 하단 액션 바 */}
      <div
        className="flex-shrink-0 bg-white border-t border-neutral-200 px-4 pt-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {isHost ? (
          <button
            onClick={() => startRoulette()}
            className="btn-mcm bg-mcm-clay text-white font-bold py-3.5 w-full text-base shadow-md
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

function GpsIndicator({ members, myId }) {
  const me = members.find(m => m.id === myId)
  if (!me?.lat) return null
  return (
    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-md rounded-pill px-3 py-1.5 flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-mcm-pistachio animate-pulse" />
      <span className="text-mcm-charcoal text-xs font-medium">위치 공유 중</span>
    </div>
  )
}
