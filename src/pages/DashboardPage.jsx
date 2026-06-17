import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useRealtime } from '../hooks/useRealtime'
import { useRoomRestore } from '../hooks/useRoomRestore'
import { makeJoinUrl, makeKakaoSharePayload } from '../lib/shareUrl'
import CountdownTimer from '../components/map/CountdownTimer'
import KakaoMap from '../components/map/KakaoMap'
import MemberStatusList from '../components/map/MemberStatusList'

export default function DashboardPage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()

  const { room, members, myId, isHost, phase, startRoulette, leaveRoom, resetPhase } = useStore(s => ({
    room: s.room, members: s.members, myId: s.myId,
    isHost: s.isHost, phase: s.phase,
    startRoulette: s.startRoulette,
    leaveRoom: s.leaveRoom,
    resetPhase: s.resetPhase,
  }))

  const { restoreState, errorMsg, retry } = useRoomRestore(roomId)
  useRealtime(restoreState === 'ok' ? roomId : null)

  const mapRef = useRef(null)
  const [shareOpen, setShareOpen]         = useState(false)
  const [shareToast, setShareToast]       = useState(false)
  const [shareToastMsg, setShareToastMsg] = useState('')
  const [focusedMember, setFocusedMember] = useState(null)

  // ── 버그2 수정: 룰렛 phase일 때만 이동, done은 여기서 머묾 ──
  useEffect(() => {
    if (phase === 'roulette') navigate(`/roulette/${roomId}`)
  }, [phase])

  const handleFocus = (member) => {
    setFocusedMember(member)
    if (member) mapRef.current?.focusMember(member)
    else        mapRef.current?.resetView()
  }

  const showToast = (msg) => {
    setShareToastMsg(msg)
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  const handleShare = async () => {
    setShareOpen(false)
    const payload = makeKakaoSharePayload({
      title:       `${room?.title || '너 어디야?'} 📍`,
      description: `📍 ${room?.destination?.name || '약속 장소'} | 지금 바로 참가해!`,
      roomId:      room?.id || roomId,
    })
    try {
      const Kakao = await window.loadKakaoSDK()
      if (Kakao?.isInitialized()) { Kakao.Share.sendDefault(payload); return }
    } catch {}
    const joinUrl = makeJoinUrl(room?.id || roomId)
    if (navigator.share) {
      try { await navigator.share({ title: room?.title || '너 어디야', text: `📍 ${room?.destination?.name}에서 만나요!`, url: joinUrl }); return } catch {}
    }
    try { await navigator.clipboard.writeText(joinUrl); showToast('📋 링크 복사됨!') } catch { showToast(`링크: ${joinUrl}`) }
  }

  const handleCopyLink = async () => {
    setShareOpen(false)
    const joinUrl = makeJoinUrl(room?.id || roomId)
    try { await navigator.clipboard.writeText(joinUrl); showToast('📋 링크 복사됨!') } catch {}
  }

  // ── 로딩 ──
  if (restoreState === 'loading') {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl animate-float">📍</div>
        <p className="font-bold text-mcm-charcoal text-lg mb-1">방 정보 불러오는 중...</p>
        <div className="flex gap-1.5 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-mcm-blue animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  // ── 에러 ──
  if (restoreState === 'error') {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-5 px-6">
        <div className="text-5xl">😵</div>
        <div className="card-mcm p-6 text-center w-full max-w-[320px]">
          <p className="font-bold text-mcm-charcoal text-lg mb-2">앗, 문제가 생겼어요</p>
          <p className="text-mcm-stone text-sm mb-5">{errorMsg}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-mcm-ghost py-3 flex-1 text-sm font-bold rounded-pill">홈으로</button>
            <button onClick={retry} className="btn-mcm-primary py-3 flex-1 text-sm font-bold">다시 시도</button>
          </div>
        </div>
      </div>
    )
  }

  const arrivedCount = members.filter(m => m.status === 'arrived').length
  const movingCount  = members.filter(m => m.status === 'moving').length
  const waitingCount = members.filter(m => m.status === 'waiting').length

  return (
    /*
     * ── 버그1 수정: 레이아웃 구조 ──
     * h-dvh + flex-col 으로 전체 높이 고정
     * 지도(flex-1)가 남은 공간 채우고, 멤버리스트는 고정 높이(28vh)로 제한
     * → 지도 영역 침범 없음
     */
    <div className="h-dvh flex flex-col bg-gray-50 overflow-hidden">

      {/* ① 카운트다운 — flex-shrink-0으로 높이 고정 */}
      <div className="flex-shrink-0 z-10 shadow-sm">
        <CountdownTimer meetingTime={room.meetingTime} />
      </div>

      {/* ② 방 정보 바 — flex-shrink-0 */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-bold text-mcm-charcoal text-sm leading-tight truncate">{room.title}</p>
          <p className="text-mcm-stone text-xs mt-0.5 truncate">📍 {room.destination?.name}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          <span className="badge-arrived">✅ {arrivedCount}</span>
          <span className="badge-moving">🏃 {movingCount}</span>
          <span className="badge-waiting">🛋️ {waitingCount}</span>
          <button
            onClick={() => { leaveRoom(); navigate('/') }}
            className="text-mcm-stone text-sm p-1 ml-1 hover:text-mcm-clay transition-colors"
          >✕</button>
        </div>
      </div>

      {/* ③ 지도 — flex-1로 남은 공간 전부 차지 */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <KakaoMap ref={mapRef} members={members} destination={room.destination} />

        {/* 포커싱 중 전체보기 */}
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

        {/* 오버레이 (공유 패널 닫기) */}
        {shareOpen && (
          <div className="absolute inset-0 z-10" onClick={() => setShareOpen(false)} />
        )}

        {/* 공유 패널 */}
        {shareOpen && (
          <div className="absolute bottom-14 right-3 z-20 w-[240px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 animate-scale-in">
            <p className="label-mcm mb-2">참가 링크 공유</p>
            <div className="bg-gray-50 border border-neutral-200 rounded-xl px-3 py-2 mb-3 break-all">
              <p className="text-xs text-mcm-charcoal font-medium leading-relaxed">
                {makeJoinUrl(room?.id || roomId)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleShare}
                className="btn-mcm-primary py-2.5 w-full text-sm font-bold flex items-center justify-center gap-1.5">
                💬 카카오톡으로 공유
              </button>
              <button onClick={handleCopyLink}
                className="btn-mcm-ghost py-2.5 w-full text-sm font-bold rounded-pill flex items-center justify-center gap-1.5">
                📋 링크 복사
              </button>
            </div>
          </div>
        )}

        {/* 공유 FAB */}
        <button
          onClick={() => setShareOpen(o => !o)}
          className="absolute bottom-3 right-3 z-10
                     bg-white border border-neutral-200 shadow-lg rounded-pill
                     px-4 py-2 text-sm font-bold text-mcm-charcoal
                     flex items-center gap-1.5 active:scale-95 transition-all duration-150"
        >
          🔗 공유
        </button>

        <GpsIndicator members={members} myId={myId} />

        {shareToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
                          bg-white border border-neutral-200 shadow-lg rounded-pill
                          px-4 py-2 text-sm font-bold text-mcm-pistachio animate-bouncy whitespace-nowrap">
            {shareToastMsg}
          </div>
        )}
      </div>

      {/* ④ 멤버 리스트 — 고정 높이, 스크롤 가능 */}
      <div
        className="flex-shrink-0 overflow-y-auto no-scrollbar bg-white"
        style={{
          height: '28vh',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <MemberStatusList members={members} onFocus={handleFocus} />
      </div>

      {/* ⑤ 하단 액션 바 — flex-shrink-0 */}
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
