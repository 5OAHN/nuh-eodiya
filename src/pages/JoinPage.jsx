import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { joinRoom, fetchRoom } from '../lib/roomService'
import { isSupabaseReady } from '../lib/supabase'
import { isSessionValid } from '../lib/session'
import Character from '../components/character/Character'

export default function JoinPage() {
  const { roomId }  = useParams()
  const navigate    = useNavigate()
  const { initRoom, setProfile, loadDemoRoom } = useStore(s => ({
    initRoom: s.initRoom, setProfile: s.setProfile, loadDemoRoom: s.loadDemoRoom,
  }))

  const [nickname, setNickname]         = useState('')
  const [emoji, setEmoji]               = useState('🙂')
  const [locationGranted, setGranted]   = useState(false)
  const [showModal, setShowModal]       = useState(true)
  const [grantLoading, setGrantLoading] = useState(false) // ← 버그3: 위치 요청 로딩
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [roomTitle, setRoomTitle]       = useState('')
  const [roomDest, setRoomDest]         = useState('')

  useEffect(() => {
    if (roomId && roomId !== 'input' && isSessionValid(roomId)) {
      navigate(`/room/${roomId}`, { replace: true })
      return
    }
    if (roomId && roomId !== 'input' && isSupabaseReady()) {
      fetchRoom(roomId).then(r => {
        if (r) { setRoomTitle(r.title); setRoomDest(r.destination?.name || '') }
      })
    }
  }, [roomId])

  // ── 버그3 수정: 위치 요청 중 로딩 표시 + 타임아웃 단축 ──
  const handleGrant = () => {
    if (!navigator.geolocation) {
      setShowModal(false)
      return
    }
    setGrantLoading(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setGranted(true)
        setGrantLoading(false)
        setShowModal(false)
      },
      () => {
        // 거부해도 닫기 (위치 없이 진행)
        setGranted(false)
        setGrantLoading(false)
        setShowModal(false)
      },
      {
        enableHighAccuracy: false, // 정확도보다 속도 우선
        timeout: 5000,             // 5초로 단축 (기존 8초)
        maximumAge: 30000,         // 30초 캐시 활용
      }
    )
  }

  const handleJoin = async () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setLoading(true)
    setError('')
    try {
      if (isSupabaseReady() && roomId !== 'input') {
        const { memberId, room } = await joinRoom(roomId, { nickname, emoji: '🙂' })
        if (!room) throw new Error('방을 찾을 수 없습니다.')
        initRoom(
          {
            id: room.id, title: room.title,
            destination: { name: room.destination_name, lat: room.destination_lat, lng: room.destination_lng },
            meetingTime: room.meeting_time,
            penalties:   room.penalties || [],
            hostId:      room.host_id,
            phase:       room.phase,
          },
          { id: memberId, nickname, emoji: '🙂', color: '#C9982A', status: 'waiting', eta: null, isHost: false },
          false
        )
        navigate(`/room/${roomId}`)
      } else {
        setProfile(nickname, '🙂')
        loadDemoRoom()
        navigate(`/room/${roomId === 'input' ? 'demo-room-001' : roomId}`)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">

      {/* 위치 동의 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl p-6 animate-slide-up border-t border-neutral-200 shadow-xl">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-mcm-blue-light rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-md">
                📍
              </div>
              <h3 className="font-bold text-mcm-charcoal text-xl mb-2">위치 정보 동의</h3>
              <p className="text-mcm-stone text-sm leading-relaxed">
                실시간 위치와 도착 예정 시간(ETA)을 공유하기 위해<br />
                <strong className="text-mcm-charcoal">위치 정보 수집</strong>에 동의해주세요.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-mcm-mustard font-medium">
              ⚠️ 현재 약속 방 참여자에게만 위치가 공개됩니다.
            </div>

            <div className="flex gap-3">
              {/* 나중에 버튼 — 로딩 중엔 비활성 */}
              <button
                onClick={() => { if (!grantLoading) setShowModal(false) }}
                disabled={grantLoading}
                className="btn-mcm-ghost py-4 flex-1 rounded-pill font-bold disabled:opacity-40"
              >
                나중에
              </button>

              {/* 동의 버튼 — 로딩 상태 표시 */}
              <button
                onClick={handleGrant}
                disabled={grantLoading}
                className="btn-mcm-primary py-4 flex-[2] font-bold text-base disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {grantLoading ? (
                  <>
                    {/* 스피너 */}
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span>위치 확인 중...</span>
                  </>
                ) : (
                  '동의하고 입장 📍'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-mcm-charcoal font-bold hover:bg-gray-200 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="font-bold text-mcm-charcoal text-lg">약속방 참가</h2>
          <p className={`text-xs font-medium ${locationGranted ? 'text-mcm-pistachio' : 'text-mcm-stone'}`}>
            {locationGranted ? '✅ 위치 공유 준비 완료' : '위치 미허용 (ETA 제한됨)'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-5 flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* 방 정보 카드 */}
        <div className="card-mcm p-4 animate-scale-in">
          <p className="label-mcm">참가하는 방</p>
          <p className="font-bold text-mcm-charcoal text-lg">
            {roomTitle || (roomId === 'input' ? '데모 방' : `방 ID: ${roomId}`)}
          </p>
          {roomDest && <p className="text-mcm-stone text-sm mt-1">📍 {roomDest}</p>}
        </div>
        {/* 닉네임 */}
        <div>
          <label className="label-mcm">닉네임 *</label>
          <input
            className="input-mcm font-bold text-lg"
            placeholder="총알기차"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={8}
            enterKeyHint="done"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleJoin() } }}
          />
        </div>

        {/* 미리보기 */}
        <div className="card-mcm p-5 flex flex-col items-center gap-3">
          <Character member={{ status: 'moving', color: '#C9982A' }} size={72} animate />
          <span className="font-bold text-mcm-charcoal text-lg">{nickname || '닉네임'}</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="btn-mcm-primary py-4 w-full text-base font-bold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              입장 중...
            </>
          ) : `${emoji} 입장하기!`}
        </button>
      </div>

      <div style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }} className="flex-shrink-0 bg-gray-50" />
    </div>
  )
}
