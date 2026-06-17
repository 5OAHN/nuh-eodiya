import { useState } from 'react'
import { useStore } from '../../store/useStore'
import confetti from 'canvas-confetti'

const COLORS = ['#4A7C9E','#C9982A','#6B9E6E','#C27B5A','#7B7EC9','#9E6B9E','#6B9E9C','#C96B6B']

// SVG 뷰박스 기준 중심/반지름 — 완전 정사각형 기준
const SIZE = 280
const CX   = SIZE / 2  // 140
const CY   = SIZE / 2  // 140
const R    = 124       // 외곽 반지름

export default function RouletteWheel() {
  const { room, rouletteTargets, setRouletteResult } = useStore(s => ({
    room: s.room, rouletteTargets: s.rouletteTargets, setRouletteResult: s.setRouletteResult,
  }))

  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [phase, setPhase]       = useState('ready')
  const [result, setResult]     = useState(null)

  const rawPenalties = room?.penalties?.filter(Boolean) || []
  // 벌칙 1개일 때 시각적으로 채우기 위해 복제 (최소 2개 보장)
  const penalties = rawPenalties.length === 1
    ? [rawPenalties[0], rawPenalties[0]]
    : rawPenalties.length === 0
      ? ['벌칙 없음', '벌칙 없음']
      : rawPenalties

  const targets  = rouletteTargets.length > 0
    ? rouletteTargets
    : [{ nickname: '전원', color: '#4A7C9E' }]

  const segCount = penalties.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setPhase('spinning')

    const tIdx        = Math.floor(Math.random() * targets.length)
    // 실제 벌칙은 원본 배열에서 랜덤 (복제된 경우 동일)
    const realPIdx    = Math.floor(Math.random() * rawPenalties.length)
    const realPenalty = rawPenalties[realPIdx] || penalties[0]
    // 휠 각도 — 첫 번째 세그먼트 기준
    const pIdx        = rawPenalties.length === 1 ? 0 : realPIdx
    const targetAngle = pIdx * segAngle
    const extraSpins  = (5 + Math.floor(Math.random() * 3)) * 360
    const finalAngle  = extraSpins + (360 - targetAngle - segAngle / 2)

    setRotation(prev => prev + finalAngle)

    setTimeout(() => {
      setSpinning(false)
      setPhase('result')
      const r = { member: targets[tIdx], penalty: realPenalty }
      setResult(r)
      setRouletteResult(r.member, r.penalty)
      confetti({
        particleCount: 120, spread: 75, origin: { y: 0.45 },
        colors: ['#4A7C9E','#C9982A','#6B9E6E','#C27B5A'],
        ticks: 200,
      })
    }, 4300)
  }

  // 세그먼트 계산 — viewBox 좌표계 기준으로 정확하게
  const segments = penalties.map((p, i) => {
    const startDeg = i * segAngle - 90
    const endDeg   = (i + 1) * segAngle - 90
    const s = startDeg * (Math.PI / 180)
    const e = endDeg   * (Math.PI / 180)

    const x1 = CX + R * Math.cos(s)
    const y1 = CY + R * Math.sin(s)
    const x2 = CX + R * Math.cos(e)
    const y2 = CY + R * Math.sin(e)

    // 텍스트 위치: 중간 각도, 반지름 62% 지점
    const mid = (s + e) / 2
    const tR  = R * 0.62
    const tx  = CX + tR * Math.cos(mid)
    const ty  = CY + tR * Math.sin(mid)
    // 텍스트 회전: 세그먼트 중앙 방향으로 눕히기
    const ta  = startDeg + segAngle / 2 + 90

    const largeArc = segAngle > 180 ? 1 : 0

    // 텍스트 줄바꿈: 6자 초과 시 두 줄로
    const maxChars  = segCount <= 4 ? 8 : segCount <= 6 ? 6 : 5
    const line1 = p.length <= maxChars ? p : p.slice(0, maxChars)
    const line2 = p.length > maxChars  ? p.slice(maxChars, maxChars * 2) + (p.length > maxChars * 2 ? '…' : '') : null

    return { p, i, x1, y1, x2, y2, tx, ty, ta, largeArc, line1, line2, color: COLORS[i % COLORS.length] }
  })

  const fontSize = segCount <= 3 ? 11 : segCount <= 5 ? 10 : segCount <= 7 ? 9 : 7
  const lineGap  = fontSize + 2

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-6">

      {/* 지각자 배너 */}
      <div className="card-mcm w-full p-4">
        <p className="text-center text-mcm-stone text-xs font-bold uppercase tracking-widest mb-2">
          지각자 처벌 룰렛
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {targets.map(t => (
            <div
              key={t.id || t.nickname}
              className="flex items-center gap-1.5 bg-mcm-clay-light text-mcm-clay px-3 py-1.5 rounded-pill text-sm font-bold"
            >
              <CharacterIcon status={t.status} color={t.color} size={20} />
              <span>{t.nickname}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 룰렛 휠 — 완전 중앙 정렬 */}
      <div className="flex flex-col items-center w-full">
        {/* 포인터 + 휠을 하나의 relative 컨테이너로 묶어서 정렬 오차 제거 */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>

          {/* 포인터 — 휠 top 중앙 고정 */}
          <div
            className="absolute z-20"
            style={{ top: -10, left: '50%', transform: 'translateX(-50%)' }}
          >
            <svg width="24" height="20" viewBox="0 0 24 20">
              <polygon
                points="12,18 0,0 24,0"
                fill="#C9982A"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}
              />
            </svg>
          </div>

          {/* 외곽 링 그림자 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          />

          {/* SVG 휠 — viewBox와 width/height를 정확히 일치 */}
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{
              transform:  `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 4.3s cubic-bezier(0.17,0.67,0.12,0.99)'
                : 'none',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            {/* 배경 원 */}
            <circle cx={CX} cy={CY} r={R} fill="#f0f0f0" />

            {/* 세그먼트 */}
            {segments.map(({ i, x1, y1, x2, y2, tx, ty, ta, largeArc, line1, line2, color }) => (
              <g key={i}>
                <path
                  d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                {/* 텍스트 그룹 — transform으로 회전 후 줄바꿈 */}
                <g transform={`rotate(${ta}, ${tx}, ${ty})`}>
                  {line2 ? (
                    <>
                      <text
                        x={tx} y={ty - lineGap / 2}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={fontSize} fontWeight="700" fill="#fff"
                      >{line1}</text>
                      <text
                        x={tx} y={ty + lineGap / 2}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={fontSize} fontWeight="700" fill="#fff"
                      >{line2}</text>
                    </>
                  ) : (
                    <text
                      x={tx} y={ty}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={fontSize} fontWeight="700" fill="#fff"
                    >{line1}</text>
                  )}
                </g>
              </g>
            ))}

            {/* 중앙 원 */}
            <circle cx={CX} cy={CY} r={22} fill="white" stroke="#e5e5e5" strokeWidth="2" />
            <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="18">🎰</text>
          </svg>
        </div>
      </div>

      {/* 스핀 버튼 */}
      {phase === 'ready' && (
        <button
          onClick={spin}
          className="btn-mcm-mustard py-4 px-10 text-lg font-bold animate-scale-in rounded-pill mt-2"
        >
          🎰 돌려돌려!
        </button>
      )}

      {phase === 'spinning' && (
        <div className="card-mcm p-4 text-center w-full">
          <p className="font-display text-2xl text-mcm-clay animate-pulse">두구두구두구...</p>
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
      <div className="card-mcm p-6 text-center">
        <p className="label-mcm">🎉 당첨자 발표!</p>
        <div className="flex justify-center mb-3">
          <CharacterIcon status={member.status} color={member.color} size={80} />
        </div>
        <p className="font-display text-3xl text-mcm-charcoal mb-4">{member.nickname}</p>
        <div className="bg-mcm-clay-light rounded-2xl px-4 py-4">
          <p className="label-mcm">오늘의 벌칙</p>
          <p className="font-bold text-mcm-clay text-xl">{penalty}</p>
        </div>
        <p className="text-mcm-stone text-xs mt-4 font-medium">불복 시 벌칙 두 배 적용 (규정)</p>
      </div>
    </div>
  )
}

// 캐릭터 아이콘 미니 버전 (룰렛용)
function CharacterIcon({ status, color, size = 40 }) {
  const bg = color || '#4A7C9E'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="19" fill={bg} opacity="0.15" />
      <StatusCharacterSVG status={status} size={size} />
    </svg>
  )
}

function StatusCharacterSVG({ status }) {
  // 간단한 인라인 캐릭터
  const map = { arrived:'✅', moving:'🏃', waiting:'😴', fast:'🔥' }
  const em  = map[status] || '🙂'
  return (
    <text x="20" y="24" textAnchor="middle" fontSize="20">{em}</text>
  )
}
