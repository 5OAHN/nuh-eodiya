import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const DEFAULT_PENALTIES = [
  '아메리카노 쏘기 ☕', '밥 사기 🍚',
  '노래방 탬버린 담당 🎵', '다음 약속 장소 결정 📍', '사진 찍힘 📸',
]
const EMOJIS = ['🔥','⚡','🚀','💥','🎯','🐉','🦊','💎','👾','🌈','🐌','🌙']

export default function CreateRoomPage() {
  const navigate    = useNavigate()
  const createRoom  = useStore(s => s.createRoom)
  const setProfile  = useStore(s => s.setProfile)

  const [step, setStep]             = useState(1)
  const [title, setTitle]           = useState('')
  const [destination, setDest]      = useState('')
  const [time, setTime]             = useState('')
  const [penalties, setPenalties]   = useState([...DEFAULT_PENALTIES])
  const [newPenalty, setNewP]       = useState('')
  const [nickname, setNickname]     = useState('')
  const [emoji, setEmoji]           = useState('🔥')

  const addPenalty = () => {
    if (!newPenalty.trim()) return
    setPenalties(p => [...p, newPenalty.trim()])
    setNewP('')
  }

  const handleCreate = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setProfile(nickname, emoji)
    const meetingTime = time ? new Date(time).getTime() : Date.now() + 30 * 60 * 1000
    const roomId = createRoom({
      title: title || '우리 약속',
      destination: { name: destination || '약속 장소', lat: 37.4979, lng: 127.0276 },
      meetingTime,
      penalties: penalties.filter(Boolean),
    })
    navigate(`/room/${roomId}`)
  }

  return (
    <div className="min-h-dvh bg-mcm-cream flex flex-col">
      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-mcm-border px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          className="w-9 h-9 rounded-full bg-mcm-warm flex items-center justify-center text-mcm-charcoal font-bold text-base hover:bg-mcm-border transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="font-bold text-mcm-charcoal text-lg leading-tight">
            {step === 1 ? '약속 설정' : '내 프로필'}
          </h2>
          <p className="text-mcm-stone text-xs">{step} / 2단계</p>
        </div>
        {/* 스텝 바 */}
        <div className="ml-auto flex gap-1.5">
          {[1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-mcm-blue' : 'w-4 bg-mcm-border'}`} />
          ))}
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-5">
        {step === 1 ? (
          <div className="flex flex-col gap-4 animate-fade-in">

            <Field label="약속 이름">
              <input
                className="input-mcm"
                placeholder="강남역 점심 모임 🍜"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </Field>

            <Field label="약속 장소">
              <input
                className="input-mcm"
                placeholder="강남역 12번 출구"
                value={destination}
                onChange={e => setDest(e.target.value)}
              />
            </Field>

            <Field label="약속 시간">
              <input
                type="datetime-local"
                className="input-mcm"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </Field>

            <Field label="지각 벌칙 목록 🎰">
              <div className="flex flex-col gap-2 mb-3">
                {penalties.map((p, i) => (
                  <div key={i} className="card-mcm-sm px-3 py-2.5 flex items-center gap-2">
                    <span className="flex-1 text-mcm-charcoal text-sm font-medium">{p}</span>
                    <button
                      onClick={() => setPenalties(arr => arr.filter((_, idx) => idx !== i))}
                      className="w-6 h-6 rounded-full bg-mcm-warm text-mcm-stone text-sm flex items-center justify-center hover:bg-mcm-border transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input-mcm flex-1 text-sm"
                  placeholder="새 벌칙 추가..."
                  value={newPenalty}
                  onChange={e => setNewP(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addPenalty()}
                />
                <button onClick={addPenalty} className="btn-mcm-primary px-4 py-3 text-sm font-bold flex-shrink-0">
                  추가
                </button>
              </div>
            </Field>

            <button
              onClick={() => setStep(2)}
              className="btn-mcm-primary py-4 w-full text-base font-bold mt-2"
            >
              다음 단계 →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* 안내 카드 */}
            <div className="card-mcm p-5 text-center">
              <p className="font-display text-2xl text-mcm-blue mb-1">나는 누구?</p>
              <p className="text-mcm-stone text-sm">참여자들에게 보일 캐릭터를 골라봐요</p>
            </div>

            {/* 이모지 선택 */}
            <Field label="캐릭터 선택">
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-3xl py-2.5 rounded-xl transition-all duration-150
                      ${emoji === e
                        ? 'bg-mcm-blue-light shadow-mcm scale-110'
                        : 'bg-white shadow-mcm-sm hover:bg-mcm-warm'
                      }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>

            {/* 닉네임 */}
            <Field label="닉네임 *">
              <input
                className="input-mcm font-bold text-lg"
                placeholder="불꽃감자"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={8}
              />
              <p className="text-mcm-stone text-xs mt-1.5 text-right">{nickname.length} / 8</p>
            </Field>

            {/* 미리보기 */}
            <div className="card-mcm p-6 flex flex-col items-center gap-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-mcm animate-float border-2 border-white"
                style={{ background: '#4A7C9E33' }}
              >
                {emoji}
              </div>
              <span className="font-bold text-mcm-charcoal text-lg">{nickname || '닉네임'}</span>
              <span className="badge-arrived">미리보기</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-mcm-ghost py-4 flex-1 font-bold text-base rounded-pill">
                ← 이전
              </button>
              <button onClick={handleCreate} className="btn-mcm-primary py-4 flex-[2] text-base font-bold">
                🚀 방 생성!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 safe area */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} className="flex-shrink-0 bg-mcm-cream" />
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
