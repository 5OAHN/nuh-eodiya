import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const DEFAULT_PENALTIES = [
  '아메리카노 쏘기 ☕',
  '밥 사기 🍚',
  '노래방 탬버린 담당 🎵',
  '다음 약속 장소 결정 📍',
  '사진 찍힘 📸',
]

const EMOJIS = ['🔥','⚡','🚀','💥','🎯','🐉','🦊','💎','👾','🌈']

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const createRoom = useStore(s => s.createRoom)
  const setProfile = useStore(s => s.setProfile)

  const [step, setStep] = useState(1) // 1: 방 설정, 2: 프로필
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [time, setTime] = useState('')
  const [penalties, setPenalties] = useState([...DEFAULT_PENALTIES])
  const [newPenalty, setNewPenalty] = useState('')
  const [nickname, setNickname] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🔥')

  const handleAddPenalty = () => {
    if (!newPenalty.trim()) return
    setPenalties(p => [...p, newPenalty.trim()])
    setNewPenalty('')
  }

  const handleRemovePenalty = (i) => {
    setPenalties(p => p.filter((_, idx) => idx !== i))
  }

  const handleCreate = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setProfile(nickname, selectedEmoji)

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
    <div className="min-h-dvh bg-kitsch-dark flex flex-col">
      {/* 헤더 */}
      <div className="bg-kitsch-orange border-b-4 border-black px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-black text-2xl font-black">←</button>
        <h2 className="font-display text-2xl font-black text-black">방 만들기</h2>
        <div className="ml-auto flex gap-1">
          {[1,2].map(i => (
            <div key={i} className={`w-8 h-3 border-2 border-black ${step >= i ? 'bg-black' : 'bg-white'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4">
        {step === 1 ? (
          <>
            <FieldBlock label="약속 이름 🎉" required>
              <input
                className="w-full bg-white border-2 border-black px-3 py-3 text-black font-bold text-base outline-none"
                placeholder="강남역 점심 모임"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FieldBlock>

            <FieldBlock label="약속 장소 📍" required>
              <input
                className="w-full bg-white border-2 border-black px-3 py-3 text-black font-bold text-base outline-none"
                placeholder="강남역 12번 출구"
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
            </FieldBlock>

            <FieldBlock label="약속 시간 ⏰">
              <input
                type="datetime-local"
                className="w-full bg-white border-2 border-black px-3 py-3 text-black font-bold text-base outline-none"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </FieldBlock>

            <FieldBlock label="지각 벌칙 목록 🎰">
              <div className="flex flex-col gap-2 mb-3">
                {penalties.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-kitsch-yellow border-2 border-black px-3 py-2">
                    <span className="flex-1 text-black font-bold text-sm">{p}</span>
                    <button onClick={() => handleRemovePenalty(i)} className="text-black text-lg leading-none font-black">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white border-2 border-black px-3 py-2 text-black text-sm outline-none"
                  placeholder="벌칙 추가..."
                  value={newPenalty}
                  onChange={e => setNewPenalty(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPenalty()}
                />
                <button onClick={handleAddPenalty} className="btn-kitsch bg-kitsch-green text-black px-4 py-2 font-black">+</button>
              </div>
            </FieldBlock>

            <button
              onClick={() => setStep(2)}
              className="btn-kitsch bg-kitsch-orange text-black text-xl py-5 w-full mt-2"
            >
              다음 →
            </button>
          </>
        ) : (
          <>
            <div className="bg-kitsch-blue border-4 border-black shadow-kitsch-lg p-5 text-center animate-bouncy">
              <p className="font-display text-3xl font-black text-white mb-1">나는 누구?</p>
              <p className="text-kitsch-green text-sm font-bold">닉네임과 캐릭터를 골라봐</p>
            </div>

            <FieldBlock label="이모지 캐릭터 선택">
              <div className="grid grid-cols-5 gap-3">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedEmoji(e)}
                    className={`text-3xl py-2 border-2 border-black transition-all ${
                      selectedEmoji === e
                        ? 'bg-kitsch-orange shadow-[3px_3px_0px_#000] scale-110'
                        : 'bg-white'
                    }`}
                  >{e}</button>
                ))}
              </div>
            </FieldBlock>

            <FieldBlock label="닉네임" required>
              <input
                className="w-full bg-white border-2 border-black px-3 py-3 text-black font-black text-xl outline-none"
                placeholder="불꽃감자"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">최대 8자</p>
            </FieldBlock>

            {/* 미리보기 */}
            <div className="flex justify-center py-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-[6px_6px_0px_#000] bg-kitsch-orange animate-float"
                >
                  {selectedEmoji}
                </div>
                <span className="font-black text-white text-lg">{nickname || '닉네임'}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="btn-kitsch bg-white text-black py-4 flex-1">← 이전</button>
              <button onClick={handleCreate} className="btn-kitsch bg-kitsch-green text-black py-4 flex-[2] text-lg font-black">
                🚀 방 생성!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FieldBlock({ label, children, required }) {
  return (
    <div>
      <label className="block text-kitsch-yellow font-black text-sm mb-2 uppercase tracking-wider">
        {label} {required && <span className="text-kitsch-orange">*</span>}
      </label>
      {children}
    </div>
  )
}
