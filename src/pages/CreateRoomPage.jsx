import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { createRoom as createRoomService } from '../lib/roomService'
import { isSupabaseReady } from '../lib/supabase'
import PlaceSearchModal from '../components/map/PlaceSearchModal'

const DEFAULT_PENALTIES = ['아메리카노 쏘기 ☕','밥 사기 🍚','노래방 탬버린 담당 🎵','다음 약속 장소 결정 📍','사진 찍힘 📸']
const EMOJIS = ['🔥','⚡','🚀','💥','🎯','🐉','🦊','💎','👾','🌈','🐌','🌙']

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const { createRoom, initRoom, setProfile } = useStore(s => ({
    createRoom: s.createRoom, initRoom: s.initRoom, setProfile: s.setProfile,
  }))

  const [step, setStep]           = useState(1)
  const [title, setTitle]         = useState('')
  const [destination, setDest]    = useState(null)
  const [time, setTime]           = useState('')
  const [penalties, setPenalties] = useState([...DEFAULT_PENALTIES])
  const [newPenalty, setNewP]     = useState('')
  const [nickname, setNickname]   = useState('')
  const [emoji, setEmoji]         = useState('🔥')
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading]     = useState(false)

  const addPenalty = () => {
    if (!newPenalty.trim()) return
    setPenalties(p => [...p, newPenalty.trim()])
    setNewP('')
  }

  const handleCreate = async () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setLoading(true)
    const meetingTime = time ? new Date(time).getTime() : Date.now() + 30 * 60 * 1000
    const roomData = {
      title: title || '우리 약속',
      destination: destination || { name: '약속 장소', lat: 37.4979, lng: 127.0276 },
      meetingTime, penalties: penalties.filter(Boolean),
    }
    try {
      if (isSupabaseReady()) {
        const { roomId, memberId } = await createRoomService(roomData, { nickname, emoji })
        initRoom(
          { id: roomId, ...roomData, hostId: memberId, phase: 'live' },
          { id: memberId, nickname, emoji, color: '#4A7C9E', status: 'waiting', eta: null, isHost: true },
          true
        )
        navigate(`/room/${roomId}`)
      } else {
        setProfile(nickname, emoji)
        const roomId = createRoom(roomData)
        navigate(`/room/${roomId}`)
      }
    } catch (e) {
      alert('방 생성 중 오류: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {showSearch && (
        <PlaceSearchModal onSelect={place => setDest(place)} onClose={() => setShowSearch(false)} />
      )}

      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-mcm-charcoal font-bold hover:bg-gray-200 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="font-bold text-mcm-charcoal text-lg">{step === 1 ? '약속 설정' : '내 프로필'}</h2>
          <p className="text-mcm-stone text-xs">{step} / 2단계</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {[1,2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-mcm-blue' : 'w-4 bg-neutral-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
        {step === 1 ? (
          <div className="flex flex-col gap-5 animate-fade-in">
            <Field label="약속 이름">
              <input className="input-mcm" placeholder="강남역 점심 모임 🍜"
                value={title} onChange={e => setTitle(e.target.value)} />
            </Field>

            <Field label="약속 장소 *">
              <button
                onClick={() => setShowSearch(true)}
                className="input-mcm w-full text-left flex items-center justify-between"
              >
                <span className={destination ? 'text-mcm-charcoal font-bold' : 'text-mcm-stone'}>
                  {destination ? `📍 ${destination.name}` : '장소를 검색해주세요...'}
                </span>
                <span className="text-mcm-stone text-sm">🔍</span>
              </button>
              {destination && (
                <p className="text-mcm-stone text-xs mt-1.5 px-1">
                  위도 {destination.lat.toFixed(4)} · 경도 {destination.lng.toFixed(4)}
                </p>
              )}
            </Field>

            <Field label="약속 시간">
              <input type="datetime-local" className="input-mcm"
                value={time} onChange={e => setTime(e.target.value)} />
            </Field>

            <Field label="지각 벌칙 목록 🎰">
              <div className="flex flex-col gap-2 mb-3">
                {penalties.map((p, i) => (
                  <div key={i} className="card-mcm-sm px-4 py-3 flex items-center gap-2">
                    <span className="flex-1 text-mcm-charcoal text-sm font-medium">{p}</span>
                    <button
                      onClick={() => setPenalties(arr => arr.filter((_,idx) => idx !== i))}
                      className="w-6 h-6 rounded-full bg-gray-100 text-mcm-stone text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input-mcm flex-1 text-sm" placeholder="새 벌칙 추가..."
                  value={newPenalty} onChange={e => setNewP(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addPenalty()} />
                <button onClick={addPenalty} className="btn-mcm-primary px-5 py-3 text-sm font-bold flex-shrink-0">추가</button>
              </div>
            </Field>

            <button onClick={() => setStep(2)} className="btn-mcm-primary py-4 w-full text-base font-bold mt-1">
              다음 단계 →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="card-mcm p-6 text-center">
              <p className="font-display text-2xl text-mcm-blue mb-1">나는 누구?</p>
              <p className="text-mcm-stone text-sm font-medium">참여자들에게 보일 캐릭터를 골라봐요</p>
            </div>

            <Field label="캐릭터 선택">
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={`text-3xl py-2.5 rounded-xl border transition-all duration-150 ${
                      emoji === e
                        ? 'bg-mcm-blue-light border-mcm-blue shadow-md scale-110'
                        : 'bg-white border-neutral-200 hover:bg-gray-50 shadow-sm'
                    }`}>{e}</button>
                ))}
              </div>
            </Field>

            <Field label="닉네임 *">
              <input className="input-mcm font-bold text-lg" placeholder="불꽃감자"
                value={nickname} onChange={e => setNickname(e.target.value)} maxLength={8} />
              <p className="text-mcm-stone text-xs mt-1.5 text-right">{nickname.length} / 8</p>
            </Field>

            {/* 미리보기 */}
            <div className="card-mcm p-6 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-mcm-blue-light flex items-center justify-center text-4xl shadow-md animate-float border-2 border-white">
                {emoji}
              </div>
              <span className="font-bold text-mcm-charcoal text-lg">{nickname || '닉네임'}</span>
              <span className="badge-arrived">미리보기</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-mcm-ghost py-4 flex-1 font-bold text-base rounded-pill">← 이전</button>
              <button onClick={handleCreate} disabled={loading}
                className="btn-mcm-primary py-4 flex-[2] text-base font-bold disabled:opacity-60">
                {loading ? '생성 중...' : '🚀 방 생성!'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }} className="flex-shrink-0 bg-gray-50" />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-mcm">{label}</label>
      {children}
    </div>
  )
}
