import { useState, useRef } from 'react'
import { useStore } from '../../store/useStore'
import confetti from 'canvas-confetti'

const COLORS = ['#4A7C9E','#C9982A','#6B9E6E','#C27B5A','#7B7EC9','#9E6B9E','#6B9E9C','#C96B6B']

export default function RouletteWheel() {
  const { room, rouletteTargets, setRouletteResult } = useStore(s => ({
    room: s.room, rouletteTargets: s.rouletteTargets, setRouletteResult: s.setRouletteResult,
  }))

  const [rotation, setRotation]   = useState(0)
  const [spinning, setSpinning]   = useState(false)
  const [phase, setPhase]         = useState('ready') // ready | spinning | result
  const [result, setResult]       = useState(null)

  const penalties = room?.penalties || ['벌칙 없음']
  const targets   = rouletteTargets.length > 0 ? rouletteTargets : [{ nickname: '전원', emoji: '👥', color: '#4A7C9E' }]
  const segCount  = penalties.length
  const segAngle  = 360 / segCount
  const R         = 118
  const CX = 130; const CY = 130

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setPhase('spinning')

    const tIdx = Math.floor(Math.random() * targets.length)
    const pIdx = Math.floor(Math.random() * penalties.length)
    const targetAngle = pIdx * segAngle
    const finalAngle  = (5 + Math.floor(Math.random() * 3)) * 360 + (360 - targetAngle - segAngle / 2)

    setRotation(prev => prev + finalAngle)

    setTimeout(() => {
      setSpinning(false)
      setPhase('result')
      const r = { member: targets[tIdx], penalty: penalties[pIdx] }
      setResult(r)
      setRouletteResult(r.member, r.penalty)

      // 차분한 컨페티 (MCM 컬러)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.45 },
        colors: ['#4A7C9E', '#C9982A', '#6B9E6E', '#C27B5A', '#F5F0E8'],
        ticks: 200,
      })
    }, 4200)
  }

  const segments = penalties.map((p, i) => {
    const s   = ((i * segAngle) - 90) * (Math.PI / 180)
    const e   = (((i + 1) * segAngle) - 90) * (Math.PI / 180)
    const x1  = CX + R * Math.cos(s); const y1 = CY + R * Math.sin(s)
    const x2  = CX + R * Math.cos(e); const y2 = CY + R * Math.sin(e)
    const mid = (s + e) / 2
    const tR  = R * 0.68
    const tx  = CX + tR * Math.cos(mid); const ty = CY + tR * Math.sin(mid)
    const ta  = (i * segAngle + segAngle / 2) - 90
    return { p, i, x1, y1, x2, y2, tx, ty, ta, color: COLORS[i % COLORS.length], la: segAngle > 180 ? 1 : 0 }
  })

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-6">
      {/* 지각자 배너 */}
      <div className="card-mcm w-full p-4 animate-pop-in">
        <p className="text-center text-mcm-stone text-xs font-bold uppercase tracking-widest mb-2">지각자 처벌 룰렛</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {targets.map(t => (
            <div key={t.id || t.nickname} className="flex items-center gap-1.5 bg-mcm-clay-light text-mcm-clay px-3 py-1.5 rounded-pill text-sm font-bold">
              <span>{t.emoji}</span>
              <span>{t.nickname}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 룰렛 휠 */}
      <div className="relative flex-shrink-0">
        {/* 포인터 삼각형 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ top: -14 }}>
          <div className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '22px solid #C9982A',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          />
        </div>

        {/* 외곽 링 */}
        <div className="w-[260px] h-[260px] rounded-full shadow-mcm-xl bg-white flex items-center justify-center p-2">
          <div className="w-full h-full rounded-full overflow-hidden">
            <svg
              width="260" height="260" viewBox="0 0 260 260"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4.2s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
              }}
            >
              {segments.map(({ p, i, x1, y1, x2, y2, tx, ty, ta, color, la }) => (
                <g key={i}>
                  <path
                    d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${la} 1 ${x2} ${y2} Z`}
                    fill={color}
                    stroke="#F5F0E8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx} y={ty}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={segCount > 6 ? '8' : '10'}
                    fontWeight="700" fill="#fff"
                    transform={`rotate(${ta},${tx},${ty})`}
                  >
                    {p.length > 7 ? p.slice(0, 6) + '…' : p}
                  </text>
                </g>
              ))}
              {/* 중앙 원 */}
              <circle cx={CX} cy={CY} r={20} fill="white" />
              <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="16">🎰</text>
            </svg>
          </div>
        </div>
      </div>

      {/* 스핀 버튼 */}
      {phase === 'ready' && (
        <button onClick={spin} className="btn-mcm-mustard py-4 px-10 text-lg font-bold animate-scale-in rounded-pill">
          🎰 돌려돌려!
        </button>
      )}

      {phase === 'spinning' && (
        <div className="card-mcm p-4 text-center animate-pulse-soft w-full">
          <p className="font-display text-2xl text-mcm-clay">두구두구두구...</p>
          <p className="text-mcm-stone text-sm mt-1">제발 나만 아니게 해주세요 🙏</p>
        </div>
      )}

      {phase === 'result' && result && (
        <ResultCard member={result.member} penalty={result.penalty} />
      )}
    </div>
  )
}

function ResultCard({ member, penalty }) {
  return (
    <div className="w-full animate-pop-in">
      <div className="card-mcm p-6 text-center shadow-mcm-xl">
        <p className="label-mcm">🎉 당첨자 발표!</p>

        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-mcm animate-float border-2 border-white"
          style={{ background: (member.color || '#4A7C9E') + '33' }}
        >
          {member.emoji}
        </div>
        <p className="font-display text-3xl text-mcm-charcoal mb-4">{member.nickname}</p>

        <div className="bg-mcm-clay-light rounded-2xl px-4 py-4 shadow-mcm-sm">
          <p className="label-mcm">오늘의 벌칙</p>
          <p className="font-bold text-mcm-clay text-xl">{penalty}</p>
        </div>

        <p className="text-mcm-stone text-xs mt-4 font-medium">불복 시 벌칙 두 배 적용 (규정)</p>
      </div>
    </div>
  )
}
