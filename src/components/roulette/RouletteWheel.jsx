import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import confetti from 'canvas-confetti'

export default function RouletteWheel() {
  const { room, rouletteTargets, setRouletteResult } = useStore(s => ({
    room: s.room,
    rouletteTargets: s.rouletteTargets,
    setRouletteResult: s.setRouletteResult,
  }))

  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [phase, setPhase] = useState('ready') // 'ready' | 'spinning' | 'result'
  const wheelRef = useRef(null)

  const penalties = room?.penalties || ['벌칙 없음']
  const targets = rouletteTargets.length > 0 ? rouletteTargets : [{ nickname: '전원', emoji: '👥', color: '#FF4D00' }]

  // 지각자 우선, 없으면 전체 돌림
  const winner = result

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setPhase('spinning')

    // 결과 미리 결정
    const targetIdx = Math.floor(Math.random() * targets.length)
    const penaltyIdx = Math.floor(Math.random() * penalties.length)
    const winnerTarget = targets[targetIdx]
    const winnerPenalty = penalties[penaltyIdx]

    // 휠 회전 계산
    const segAngle = 360 / penalties.length
    const targetAngle = penaltyIdx * segAngle
    const spins = 5 + Math.floor(Math.random() * 3) // 5~7바퀴
    const finalAngle = spins * 360 + (360 - targetAngle - segAngle / 2)

    setRotation(prev => prev + finalAngle)

    // 4초 후 결과
    setTimeout(() => {
      setSpinning(false)
      setPhase('result')
      setResult({ member: winnerTarget, penalty: winnerPenalty })
      setRouletteResult(winnerTarget, winnerPenalty)

      // 컨페티
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#FF4D00', '#0047FF', '#00FF88', '#FFE600', '#FF0080'],
      })
    }, 4200)
  }

  const segmentCount = penalties.length
  const segAngle = 360 / segmentCount
  const COLORS = ['#FF4D00','#0047FF','#00FF88','#FFE600','#FF0080','#FF6B00','#7B2FFF','#00CFFF']

  const radius = 130
  const cx = 140
  const cy = 140

  const segments = penalties.map((p, i) => {
    const startAngle = (i * segAngle - 90) * (Math.PI / 180)
    const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180)
    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)
    const midAngle = (startAngle + endAngle) / 2
    const textR = radius * 0.68
    const tx = cx + textR * Math.cos(midAngle)
    const ty = cy + textR * Math.sin(midAngle)
    const textAngle = ((i * segAngle + segAngle / 2)) - 90

    const color = COLORS[i % COLORS.length]
    const largeArc = segAngle > 180 ? 1 : 0

    return { p, i, x1, y1, x2, y2, tx, ty, textAngle, color, largeArc }
  })

  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-6">
      {/* 지각자 배너 */}
      <div className="w-full bg-kitsch-orange border-4 border-black shadow-[6px_6px_0_#000] p-4 animate-pop-in">
        <p className="font-display text-2xl font-black text-black text-center leading-tight">
          🚨 시간이 됐다!<br/>
          <span className="text-3xl">지각자 처벌 룰렛</span>
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {targets.map(t => (
            <div
              key={t.id || t.nickname}
              className="flex items-center gap-1 bg-black text-white px-3 py-1 border border-white text-sm font-bold"
            >
              <span>{t.emoji}</span>
              <span>{t.nickname}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 룰렛 휠 */}
      <div className="relative">
        {/* 포인터 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ top: '-12px' }}>
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #FFE600',
              filter: 'drop-shadow(0 2px 0 #000)',
            }}
          />
        </div>

        {/* 바깥 링 */}
        <div className="w-[280px] h-[280px] rounded-full border-4 border-black bg-black flex items-center justify-center shadow-[8px_8px_0_#000]">
          <svg
            ref={wheelRef}
            width="280"
            height="280"
            viewBox="0 0 280 280"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
              borderRadius: '50%',
            }}
          >
            {segments.map(({ p, i, x1, y1, x2, y2, tx, ty, textAngle, color, largeArc }) => (
              <g key={i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#000"
                  strokeWidth="2"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={penalties.length > 6 ? "8" : "10"}
                  fontWeight="900"
                  fill="#000"
                  transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                >
                  {p.length > 8 ? p.slice(0, 7) + '…' : p}
                </text>
              </g>
            ))}
            {/* 중앙 원 */}
            <circle cx={cx} cy={cy} r={22} fill="#1A1A1A" stroke="#FFE600" strokeWidth="4" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">🎰</text>
          </svg>
        </div>
      </div>

      {/* 스핀 버튼 */}
      {phase === 'ready' && (
        <button
          onClick={spin}
          className="btn-kitsch bg-kitsch-yellow text-black text-2xl font-black py-5 px-10 animate-bouncy"
        >
          🎰 돌려돌려!
        </button>
      )}

      {phase === 'spinning' && (
        <div className="text-center animate-pulse-fast">
          <p className="font-display text-3xl font-black text-kitsch-orange">두구두구두구...</p>
          <p className="text-white text-sm mt-1">제발 나만 아니게 해주세요 🙏</p>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && winner && (
        <ResultCard member={winner.member} penalty={winner.penalty} />
      )}
    </div>
  )
}

function ResultCard({ member, penalty }) {
  return (
    <div className="w-full animate-pop-in">
      <div className="bg-kitsch-yellow border-4 border-black shadow-[8px_8px_0_#000] p-5 text-center">
        <p className="font-display text-xl font-black text-black mb-3">🎉 당첨자 발표!</p>

        {/* 당첨자 */}
        <div
          className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl mx-auto mb-2 shadow-[4px_4px_0_#000]"
          style={{ background: member.color }}
        >
          {member.emoji}
        </div>
        <p className="font-display text-3xl font-black text-black">{member.nickname}</p>

        {/* 벌칙 */}
        <div className="bg-kitsch-orange border-2 border-black px-4 py-3 mt-4 shadow-[4px_4px_0_#000]">
          <p className="text-xs font-black text-black/60 uppercase tracking-wider mb-1">오늘의 벌칙</p>
          <p className="font-display text-2xl font-black text-black">{penalty}</p>
        </div>

        <p className="text-black/50 text-xs font-bold mt-4">
          불복 시 벌칙 두 배 적용 (규정)
        </p>
      </div>
    </div>
  )
}
