import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function HomePage() {
  const navigate = useNavigate()
  const loadDemoRoom = useStore(s => s.loadDemoRoom)

  const handleDemo = () => {
    loadDemoRoom()
    navigate('/room/demo-room-001')
  }

  return (
    <div className="min-h-dvh bg-mcm-cream flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* 로고 카드 */}
        <div className="card-mcm px-10 py-8 text-center mb-8 w-full max-w-[300px] animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-mcm-blue-light mx-auto mb-5 flex items-center justify-center shadow-mcm-sm">
            <span className="text-4xl">📍</span>
          </div>
          <h1 className="font-display text-4xl text-mcm-charcoal leading-tight mb-2">너 어디야</h1>
          <p className="text-mcm-stone text-sm font-medium leading-relaxed">실시간 위치 공유<br />& 지각자 처벌 룰렛</p>
        </div>

        {/* 특징 칩 */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 animate-fade-in">
          {['앱 설치 없음', '링크 하나로 공유', '카카오톡 연동'].map(tag => (
            <span key={tag} className="bg-white text-mcm-stone text-xs font-medium px-3 py-1.5 rounded-pill shadow-mcm-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* 버튼 그룹 */}
        <div className="w-full max-w-[320px] flex flex-col gap-3 animate-slide-up">
          <button
            onClick={() => navigate('/create')}
            className="btn-mcm-primary text-base font-bold py-4 px-6 w-full"
          >
            🚀  방 만들기  (방장)
          </button>
          <button
            onClick={handleDemo}
            className="btn-mcm bg-mcm-pistachio text-white font-bold py-4 px-6 w-full shadow-mcm hover:brightness-105 active:scale-95 transition-all duration-200 rounded-pill"
          >
            👀  데모 체험하기
          </button>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-mcm-border" />
            <span className="text-mcm-stone text-xs">링크가 있다면</span>
            <div className="flex-1 h-px bg-mcm-border" />
          </div>
          <button
            onClick={() => navigate('/join/input')}
            className="btn-mcm-ghost font-bold py-4 px-6 w-full text-base rounded-pill"
          >
            🔗  링크로 참가하기
          </button>
        </div>
      </div>
      <div className="text-center pb-6 pb-safe">
        <p className="text-mcm-stone text-xs">HTTPS 보안 연결 · 위치정보 일회성 수집</p>
      </div>
    </div>
  )
}
