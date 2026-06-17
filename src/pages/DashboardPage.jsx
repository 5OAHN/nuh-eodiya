import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import CountdownTimer from '../components/map/CountdownTimer'
import KakaoMap from '../components/map/KakaoMap'
import MemberStatusList from '../components/map/MemberStatusList'

export default function DashboardPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { room, members, myId, isHost, phase, startRoulette } = useStore(s => ({
    room: s.room,
    members: s.members,
    myId: s.myId,
    isHost: s.isHost,
    phase: s.phase,
    startRoulette: s.startRoulette,
  }))
  const loadDemoRoom = useStore(s => s.loadDemoRoom)

  const [mapHeight, setMapHeight] = useState('50vh')
  const [shareToast, setShareToast] = useState(false)

  // 방이 없으면 데모 로드
  useEffect(() => {
    if (!room) loadDemoRoom()
  }, [])

  // phase가 roulette이면 룰렛 페이지로
  useEffect(() => {
    if (phase === 'roulette' || phase === 'done') {
      navigate(`/roulette/${roomId}`)
    }
  }, [phase])

  const handleShare = async () => {
    const url = `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}/join/${room?.id || roomId}`

    // 카카오 공유 시도
    try {
      const Kakao = await window.loadKakaoSDK()
      if (Kakao?.isInitialized()) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${room?.title || '너 어디야?'} 🚨`,
            description: `📍 ${room?.destination?.name || '약속 장소'} | 지금 바로 참가해!`,
            imageUrl: 'https://via.placeholder.com/800x400/FF4D00/000000?text=%EB%84%88+%EC%96%B4%EB%94%94%EC%95%BC',
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: '참가하기 📍', link: { mobileWebUrl: url, webUrl: url } }],
        })
        return
      }
    } catch {}

    // 네이티브 공유 폴백
    if (navigator.share) {
      navigator.share({ title: room?.title || '너 어디야', url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2000)
    }
  }

  const handleRoulette = () => {
    startRoulette()
  }

  const arrivedCount = members.filter(m => m.status === 'arrived').length
  const lateCount = members.filter(m => m.status !== 'arrived').length

  if (!room) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-kitsch-dark">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">📍</div>
          <p className="font-black text-white text-xl">위치 연결 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-kitsch-dark">
      {/* 카운트다운 타이머 (최상단 고정) */}
      <CountdownTimer meetingTime={room.meetingTime} />

      {/* 방 정보 바 */}
      <div className="bg-kitsch-gray border-b-2 border-kitsch-gray px-4 py-2 flex items-center justify-between">
        <div>
          <p className="font-black text-white text-sm leading-tight">{room.title}</p>
          <p className="text-gray-400 text-xs">📍 {room.destination?.name}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={`✅ ${arrivedCount}`} color="bg-kitsch-green" dark />
          <StatusBadge label={`🏃 ${lateCount}`} color="bg-kitsch-orange" />
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="relative flex-1 min-h-[280px] max-h-[55vh]">
        <KakaoMap members={members} destination={room.destination} />

        {/* 지도 위 플로팅 버튼들 */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
          {/* 공유 버튼 */}
          <button
            onClick={handleShare}
            className="btn-kitsch bg-kitsch-yellow text-black text-xs font-black px-3 py-2"
          >
            🔗 공유
          </button>

          {/* 방장 전용: 룰렛 시작 */}
          {isHost && (
            <button
              onClick={handleRoulette}
              className="btn-kitsch bg-kitsch-pink text-white text-xs font-black px-3 py-2"
            >
              🎰 룰렛!
            </button>
          )}
        </div>

        {/* 링크 복사 토스트 */}
        {shareToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-kitsch-green border-2 border-black px-4 py-2 text-black font-black text-sm shadow-[3px_3px_0_#000] animate-bouncy z-20">
            📋 링크 복사됨!
          </div>
        )}
      </div>

      {/* 멤버 리스트 (스크롤) */}
      <div className="flex-shrink-0 max-h-[35vh] overflow-y-auto no-scrollbar">
        <MemberStatusList members={members} />
      </div>

      {/* 바텀 안전 영역 */}
      <div className="h-safe-area-inset-bottom bg-kitsch-dark" />
    </div>
  )
}

function StatusBadge({ label, color, dark }) {
  return (
    <span className={`${color} border border-black text-xs font-black px-2 py-1 ${dark ? 'text-black' : 'text-black'}`}>
      {label}
    </span>
  )
}
