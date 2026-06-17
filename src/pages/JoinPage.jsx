import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { joinRoom } from '../lib/roomService'
import { isSupabaseReady } from '../lib/supabase'

const EMOJIS = ['🙂','🔥','⚡','🚀','💥','🎯','🐉','🦊','💎','👾','🌈','🐌']

export default function JoinPage() {
  const { roomId }   = useParams()
  const navigate     = useNavigate()
  const { initRoom, setProfile, loadDemoRoom } = useStore(s => ({
    initRoom: s.initRoom, setProfile: s.setProfile, loadDemoRoom: s.loadDemoRoom,
  }))

  const [nickname, setNickname]       = useState('')
  const [emoji, setEmoji]             = useState('🙂')
  const [locationGranted, setGranted] = useState(false)
  const [showModal, setShowModal]     = useState(true)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleGrant = () => {
    if (!navigator.geolocation) { setShowModal(false); return }
    navigator.geolocation.getCurrentPosition(
      () => { setGranted(true); setShowModal(false) },
      () => { setGranted(false); setShowModal(false) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleJoin = async () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setLoading(true)
    setError('')

    try {
      if (isSupabaseReady() && roomId !== 'input') {
        const { memberId, room } = await joinRoom(roomId, { nickname, emoji })
        if (!room) throw new Error('방을 찾을 수 없습니다.')
        initRoom(
          {
            id: room.id, title: room.title,
            destination: { name: room.destination_name, lat: room.destination_lat, lng: room.destination_lng },
            meetingTime: room.meeting_time, penalties: room.penalties || [],
            hostId: room.host_id, phase: room.phase,
          },
          { id: memberId, nickname, emoji, color: '#C9982A', status: 'waiting', eta: null, isHost: false },
          false
        )
        navigate(`/room/${roomId}`)
      } else {
        // 로컬 폴백 (데모)
        setProfile(nickname, emoji)
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
          <div className="w-full max-w-[430px] mx-auto bg-gray-50 rounded-t-3xl p-6 animate-slide-up">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-mcm-blue-light rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-mcm-sm">📍</div>
              <h3 className="font-bold text-mcm-charcoal text-xl mb-2">위치 정보 동의</h3>
              <p className="text-mcm-stone text-sm leading-relaxed">
                실시간 위치와 도착 예정 시간(ETA)을 공유하기 위해<br />
                <strong className="text-mcm-charcoal">위치 정보 수집</strong>에 동의해주세요.<br />
                세션 종료 시 즉시 삭제됩니다.
              </p>
            </div>
            <div className="bg-mcm-mustard-light rounded-xl px-4 py-3 mb-5 text-sm text-mcm-mustard font-medium">
              ⚠️ 현재 약속 방 참여자에게만 위치가 공개됩니다.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-mcm-ghost py-4 flex-1 rounded-pill font-bold">나중에</button>
              <button onClick={handleGrant} className="btn-mcm-primary py-4 flex-[2] font-bold text-base">동의하고 입장 📍</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-mcm-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-mcm-warm flex items-center justify-center text-mcm-charcoal font-bold">←</button>
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

        <div className="card-mcm p-4 animate-scale-in">
          <p className="label-mcm">참가하는 방</p>
          <p className="font-bold text-mcm-charcoal text-lg">
            {roomId === 'input' ? '데모 방' : `방 ID: ${roomId}`}
          </p>
          <p className="text-mcm-stone text-sm mt-1">📍 약속 장소 정보 로딩 중...</p>
        </div>

        <div>
          <label className="label-mcm">캐릭터 선택</label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`text-3xl py-2.5 rounded-xl transition-all duration-150 ${
                  emoji === e ? 'bg-mcm-blue-light shadow-mcm scale-110' : 'bg-white shadow-mcm-sm hover:bg-mcm-warm'
                }`}>{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-mcm">닉네임 *</label>
          <input className="input-mcm font-bold text-lg" placeholder="총알기차" enterKeyHint="done"
            value={nickname} onChange={e => setNickname(e.target.value)} maxLength={8}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleJoin() } }}
              />
        </div>

        <div className="card-mcm p-5 flex flex-col items-center gap-3">
          <div className="w-[72px] h-[72px] rounded-full bg-mcm-blue-light flex items-center justify-center text-4xl shadow-mcm animate-float">
            {emoji}
          </div>
          <span className="font-bold text-mcm-charcoal text-lg">{nickname || '닉네임'}</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="btn-mcm-primary py-4 w-full text-base font-bold disabled:opacity-60"
        >
          {loading ? '입장 중...' : `${emoji} 입장하기!`}
        </button>
      </div>

      <div style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }} className="flex-shrink-0 bg-gray-50" />
    </div>
  )
}
