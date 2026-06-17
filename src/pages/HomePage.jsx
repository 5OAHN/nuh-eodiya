import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const EMOJIS = ['🔥','⚡','🚀','💥','🎯','👾','🐉','🦊','🌈','💎']

export default function HomePage() {
  const navigate = useNavigate()
  const loadDemoRoom = useStore(s => s.loadDemoRoom)

  const handleDemo = () => {
    loadDemoRoom()
    navigate('/room/demo-room-001')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-kitsch-dark px-5 relative overflow-hidden">
      {/* BG 데코 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-32 h-32 bg-kitsch-orange rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-5 w-40 h-40 bg-kitsch-blue rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-kitsch-pink opacity-5 blur-3xl rounded-full" />
      </div>

      {/* 플로팅 이모지 */}
      {['🚨','📍','⏰','💨','🔥'].map((e, i) => (
        <span
          key={i}
          className="absolute text-3xl opacity-30 animate-float"
          style={{
            left: `${10 + i * 20}%`,
            top: `${15 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + i * 0.3}s`,
          }}
        >{e}</span>
      ))}

      {/* 로고 */}
      <div className="relative z-10 text-center mb-10 animate-bouncy">
        <div className="inline-block bg-kitsch-orange border-4 border-black shadow-[8px_8px_0px_#000] px-6 py-3 mb-4 rotate-[-2deg]">
          <h1 className="font-display text-5xl font-black text-black tracking-tight leading-none">
            너<br/>어디야
          </h1>
        </div>
        <div className="bg-kitsch-yellow border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 inline-block rotate-[1deg]">
          <p className="font-bold text-black text-sm">실시간 위치 공유 & 지각자 처벌기</p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="relative z-10 w-full flex flex-col gap-4 max-w-[320px]">
        <button
          onClick={() => navigate('/create')}
          className="btn-kitsch bg-kitsch-orange text-black text-xl py-5 w-full rounded-none text-center"
        >
          🚀 방 만들기 (방장)
        </button>

        <button
          onClick={handleDemo}
          className="btn-kitsch bg-kitsch-blue text-white text-xl py-5 w-full rounded-none text-center"
        >
          👀 데모 체험하기
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-kitsch-gray" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-kitsch-dark px-3 text-xs text-gray-500">링크가 있다면</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/join/input')}
          className="btn-kitsch bg-kitsch-green text-black text-base py-4 w-full rounded-none"
        >
          🔗 링크로 참가하기
        </button>
      </div>

      {/* 바텀 카피 */}
      <p className="absolute bottom-6 text-xs text-gray-600 z-10">
        앱 설치 불필요 · 링크 하나로 끝
      </p>
    </div>
  )
}
