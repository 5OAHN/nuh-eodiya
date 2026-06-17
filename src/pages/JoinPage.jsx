import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'

const EMOJIS = ['🙂','🔥','⚡','🚀','💥','🎯','🐉','🦊','💎','👾','🌈','🐌','🐣','🌙','🎸']

export default function JoinPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const setProfile = useStore(s => s.setProfile)
  const loadDemoRoom = useStore(s => s.loadDemoRoom)

  const [nickname, setNickname] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🙂')
  const [locationGranted, setLocationGranted] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(true)

  const handleGrantLocation = () => {
    if (!navigator.geolocation) {
      alert('위치 정보를 지원하지 않는 브라우저입니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => { setLocationGranted(true); setShowLocationModal(false) },
      () => { setLocationGranted(false); setShowLocationModal(false) }
    )
  }

  const handleJoin = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!')
    setProfile(nickname, selectedEmoji)
    // 데모방 로드 (실제로는 roomId로 fetch)
    loadDemoRoom()
    navigate(`/room/${roomId}`)
  }

  return (
    <div className="min-h-dvh bg-kitsch-dark flex flex-col">
      {/* 위치 동의 모달 */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
          <div className="w-full max-w-[430px] bg-white border-t-4 border-black p-6 animate-slide-up">
            <div className="text-center mb-5">
              <div className="text-6xl mb-3">📍</div>
              <h3 className="font-display text-2xl font-black text-black mb-2">위치 정보 동의</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                약속 장소까지의 실시간 위치와 ETA를 공유하기 위해
                <br />
                <strong>위치 정보 1회성 수집</strong>에 동의해주세요.
                <br />
                앱 종료 시 즉시 삭제됩니다.
              </p>
            </div>
            <div className="bg-kitsch-yellow border-2 border-black p-3 mb-4 text-xs text-black font-bold">
              ⚠️ 위치 정보는 현재 약속 방 참여자에게만 공개됩니다.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="btn-kitsch bg-gray-200 text-black py-4 flex-1"
              >
                나중에
              </button>
              <button
                onClick={handleGrantLocation}
                className="btn-kitsch bg-kitsch-orange text-black py-4 flex-[2] font-black text-lg"
              >
                동의하고 입장 📍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-kitsch-blue border-b-4 border-black px-4 py-4">
        <h2 className="font-display text-2xl font-black text-white">약속방 참가</h2>
        <p className="text-kitsch-green text-xs font-bold mt-1">
          {locationGranted ? '✅ 위치 공유 준비 완료' : '⚠️ 위치 미허용 (ETA 제한됨)'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-5">
        {/* 방 정보 카드 */}
        <div className="bg-kitsch-yellow border-2 border-black shadow-[4px_4px_0px_#000] p-4 animate-bouncy">
          <p className="text-xs font-black text-black/60 uppercase tracking-wider mb-1">참가 방</p>
          <p className="font-display text-xl font-black text-black">강남역 점심 🍜</p>
          <p className="text-sm text-black/70 font-bold mt-1">📍 강남역 12번 출구</p>
        </div>

        {/* 이모지 선택 */}
        <div>
          <p className="text-kitsch-yellow font-black text-sm mb-3 uppercase tracking-wider">캐릭터 선택</p>
          <div className="grid grid-cols-5 gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setSelectedEmoji(e)}
                className={`text-3xl py-3 border-2 border-black transition-all ${
                  selectedEmoji === e
                    ? 'bg-kitsch-orange scale-110 shadow-[3px_3px_0px_#000]'
                    : 'bg-kitsch-gray'
                }`}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* 닉네임 */}
        <div>
          <p className="text-kitsch-yellow font-black text-sm mb-2 uppercase tracking-wider">닉네임 <span className="text-kitsch-orange">*</span></p>
          <input
            className="w-full bg-white border-2 border-black px-4 py-4 text-black font-black text-xl outline-none"
            placeholder="총알기차"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={8}
          />
        </div>

        {/* 미리보기 */}
        <div className="flex justify-center py-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full border-4 border-black bg-kitsch-blue flex items-center justify-center text-4xl shadow-[6px_6px_0px_#000] animate-float">
              {selectedEmoji}
            </div>
            <span className="font-black text-white text-lg">{nickname || '닉네임'}</span>
          </div>
        </div>

        <button
          onClick={handleJoin}
          className="btn-kitsch bg-kitsch-green text-black text-xl py-5 w-full"
        >
          {selectedEmoji} 입장하기!
        </button>
      </div>
    </div>
  )
}
