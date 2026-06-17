/**
 * Character.jsx
 * 상태별 2등신 SVG 캐릭터
 *
 * status:
 *  'fast'    → 머리에 불꽃, 빠르게 뛰는 모션
 *  'moving'  → 평온하게 걷는 모션
 *  'waiting' → 자고 있는 모션 (ZZZ)
 *  'arrived' → 도착 완료, 양손 들고 환호
 *
 * ETA 기준 분류:
 *  eta < 5  → fast
 *  eta < 15 → moving
 *  eta null/undefined or status==='waiting' → waiting
 *  status === 'arrived' → arrived
 */

import { useMemo } from 'react'

// ETA → 시각적 상태 분류
export function getCharacterState(member) {
  if (member.status === 'arrived') return 'arrived'
  if (member.status === 'waiting' || member.eta == null) return 'waiting'
  if (member.eta < 5)  return 'fast'
  if (member.eta < 15) return 'moving'
  return 'waiting'
}

// 멤버 색상 → 캐릭터 피부/의상 색
function deriveColors(baseColor) {
  return {
    body:   baseColor || '#4A7C9E',
    skin:   '#FDDBB4',
    hair:   '#3D2B1F',
    shirt:  baseColor || '#4A7C9E',
    pants:  '#2C3E50',
    shoes:  '#1a1a1a',
    cheek:  '#F4A0A0',
  }
}

export default function Character({ member, size = 64, animate = true }) {
  const state  = getCharacterState(member)
  const colors = deriveColors(member?.color)

  const wrapStyle = {
    width:  size,
    height: size,
    position: 'relative',
    display: 'inline-block',
  }

  return (
    <div style={wrapStyle}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 80"
        style={{ overflow: 'visible' }}
      >
        <CharBody state={state} colors={colors} animate={animate} />
      </svg>
    </div>
  )
}

/* ── 상태별 캐릭터 바디 ── */
function CharBody({ state, colors, animate }) {
  switch (state) {
    case 'fast':    return <FastChar    colors={colors} animate={animate} />
    case 'moving':  return <MovingChar  colors={colors} animate={animate} />
    case 'waiting': return <WaitingChar colors={colors} animate={animate} />
    case 'arrived': return <ArrivedChar colors={colors} animate={animate} />
    default:        return <MovingChar  colors={colors} animate={animate} />
  }
}

/* ── 공통 얼굴 ── */
function Face({ cx, cy, r = 14, colors, expression = 'normal' }) {
  return (
    <g>
      {/* 머리 */}
      <circle cx={cx} cy={cy} r={r} fill={colors.skin} />
      {/* 머리카락 */}
      <ellipse cx={cx} cy={cy - r * 0.7} rx={r * 0.95} ry={r * 0.5} fill={colors.hair} />
      {/* 볼 */}
      <ellipse cx={cx - r * 0.5} cy={cy + 2} rx={3} ry={2} fill={colors.cheek} opacity="0.7" />
      <ellipse cx={cx + r * 0.5} cy={cy + 2} rx={3} ry={2} fill={colors.cheek} opacity="0.7" />
      {/* 눈 */}
      {expression === 'sleep' ? (
        <>
          <line x1={cx-5} y1={cy} x2={cx-2} y2={cy+1} stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1={cx+2} y1={cy} x2={cx+5} y2={cy+1} stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      ) : expression === 'excited' ? (
        <>
          <ellipse cx={cx-4} cy={cy} rx={2.5} ry={3} fill="#333" />
          <ellipse cx={cx+4} cy={cy} rx={2.5} ry={3} fill="#333" />
          <circle  cx={cx-3} cy={cy-1} r={0.8} fill="white" />
          <circle  cx={cx+5} cy={cy-1} r={0.8} fill="white" />
        </>
      ) : expression === 'panting' ? (
        <>
          <ellipse cx={cx-4} cy={cy} rx={2} ry={2.5} fill="#333" />
          <ellipse cx={cx+4} cy={cy} rx={2} ry={2.5} fill="#333" />
          <path d={`M ${cx-3} ${cy+5} Q ${cx} ${cy+8} ${cx+3} ${cy+5}`} fill="#F4A0A0" stroke="none"/>
        </>
      ) : (
        <>
          <ellipse cx={cx-4} cy={cy} rx={2} ry={2.2} fill="#333" />
          <ellipse cx={cx+4} cy={cy} rx={2} ry={2.2} fill="#333" />
          <circle  cx={cx-3} cy={cy-0.5} r={0.6} fill="white" />
          <circle  cx={cx+5} cy={cy-0.5} r={0.6} fill="white" />
        </>
      )}
      {/* 입 */}
      {expression !== 'sleep' && expression !== 'panting' && (
        <path
          d={expression === 'excited'
            ? `M ${cx-4} ${cy+6} Q ${cx} ${cy+10} ${cx+4} ${cy+6}`
            : `M ${cx-3} ${cy+6} Q ${cx} ${cy+8} ${cx+3} ${cy+6}`}
          stroke="#c97" strokeWidth="1.2" fill="none" strokeLinecap="round"
        />
      )}
    </g>
  )
}

/* ── 빠름 (fast): 달리기 + 불꽃 ── */
function FastChar({ colors, animate }) {
  return (
    <g>
      {/* 불꽃 */}
      <g opacity="0.95">
        <ellipse cx="32" cy="6" rx="5" ry="7" fill="#FF6B00" opacity="0.9">
          {animate && <animate attributeName="ry" values="7;9;7" dur="0.4s" repeatCount="indefinite"/>}
        </ellipse>
        <ellipse cx="29" cy="8" rx="3" ry="5" fill="#FFD700" opacity="0.85">
          {animate && <animate attributeName="ry" values="5;7;5" dur="0.35s" repeatCount="indefinite"/>}
        </ellipse>
        <ellipse cx="35" cy="8" rx="3" ry="5" fill="#FF4500" opacity="0.8">
          {animate && <animate attributeName="ry" values="5;6;5" dur="0.45s" repeatCount="indefinite"/>}
        </ellipse>
        <ellipse cx="32" cy="9" rx="2.5" ry="3" fill="#FFF176" opacity="0.9"/>
      </g>

      {/* 머리 */}
      <Face cx={32} cy={24} r={13} colors={colors} expression="panting" />

      {/* 몸통 */}
      <rect x="24" y="38" width="16" height="18" rx="5" fill={colors.shirt} />

      {/* 왼팔 (뒤로) */}
      <g>
        <line x1="24" y1="42" x2="15" y2="52" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="15" cy="52" r="3.5" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="-15 24 42;15 24 42;-15 24 42" dur="0.35s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 오른팔 (앞으로) */}
      <g>
        <line x1="40" y1="42" x2="49" y2="52" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="49" cy="52" r="3.5" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="15 40 42;-15 40 42;15 40 42" dur="0.35s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 왼다리 */}
      <g>
        <line x1="28" y1="56" x2="22" y2="70" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
        <ellipse cx="22" cy="71" rx="5" ry="3" fill={colors.shoes}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="-20 28 56;20 28 56;-20 28 56" dur="0.35s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 오른다리 */}
      <g>
        <line x1="36" y1="56" x2="42" y2="70" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
        <ellipse cx="42" cy="71" rx="5" ry="3" fill={colors.shoes}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="20 36 56;-20 36 56;20 36 56" dur="0.35s" repeatCount="indefinite"/>
        )}
      </g>
    </g>
  )
}

/* ── 이동 중 (moving): 평온하게 걷기 ── */
function MovingChar({ colors, animate }) {
  return (
    <g>
      <Face cx={32} cy={22} r={13} colors={colors} expression="normal" />

      {/* 몸통 */}
      <rect x="24" y="36" width="16" height="18" rx="5" fill={colors.shirt} />

      {/* 왼팔 */}
      <g>
        <line x1="24" y1="40" x2="17" y2="52" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="17" cy="52" r="3" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="-10 24 40;10 24 40;-10 24 40" dur="0.6s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 오른팔 */}
      <g>
        <line x1="40" y1="40" x2="47" y2="52" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="47" cy="52" r="3" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="10 40 40;-10 40 40;10 40 40" dur="0.6s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 왼다리 */}
      <g>
        <line x1="28" y1="54" x2="24" y2="68" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
        <ellipse cx="24" cy="69" rx="5" ry="2.5" fill={colors.shoes}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="-12 28 54;12 28 54;-12 28 54" dur="0.6s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 오른다리 */}
      <g>
        <line x1="36" y1="54" x2="40" y2="68" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
        <ellipse cx="40" cy="69" rx="5" ry="2.5" fill={colors.shoes}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="12 36 54;-12 36 54;12 36 54" dur="0.6s" repeatCount="indefinite"/>
        )}
      </g>
    </g>
  )
}

/* ── 미출발 (waiting): 자는 모션 + ZZZ ── */
function WaitingChar({ colors, animate }) {
  return (
    <g>
      {/* ZZZ */}
      <text x="44" y="16" fontSize="8" fontWeight="900" fill="#94A3B8" opacity="0.9">z</text>
      <text x="48" y="10" fontSize="10" fontWeight="900" fill="#94A3B8" opacity="0.7">z</text>
      <text x="53" y="4"  fontSize="12" fontWeight="900" fill="#94A3B8" opacity="0.5">z</text>

      <Face cx={32} cy={26} r={14} colors={colors} expression="sleep" />

      {/* 몸통 — 옆으로 누운 형태 */}
      <ellipse cx="32" cy="52" rx="18" ry="10" fill={colors.shirt} />

      {/* 무릎 올린 다리 */}
      <ellipse cx="44" cy="56" rx="10" ry="7" fill={colors.pants} />
      <ellipse cx="50" cy="60" rx="6" ry="3.5" fill={colors.shoes} />

      {/* 팔 베게 */}
      <ellipse cx="18" cy="48" rx="8" ry="5" fill={colors.shirt} />
      <circle  cx="14" cy="44" r="4" fill={colors.skin} />

      {/* 숨쉬기 */}
      {animate && (
        <animateTransform attributeName="transform" type="translate"
          values="0,0;0,1;0,0" dur="2s" repeatCount="indefinite"/>
      )}
    </g>
  )
}

/* ── 도착 (arrived): 양손 들고 환호 ── */
function ArrivedChar({ colors, animate }) {
  return (
    <g>
      {/* 별 반짝 */}
      <text x="8"  y="14" fontSize="10" fill="#FFD700">✨</text>
      <text x="46" y="12" fontSize="10" fill="#FFD700">✨</text>

      <Face cx={32} cy={22} r={13} colors={colors} expression="excited" />

      {/* 몸통 */}
      <rect x="24" y="36" width="16" height="18" rx="5" fill={colors.shirt} />

      {/* 왼팔 위로 */}
      <g>
        <line x1="24" y1="40" x2="14" y2="26" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="14" cy="26" r="3.5" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="-5 24 40;5 24 40;-5 24 40" dur="0.5s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 오른팔 위로 */}
      <g>
        <line x1="40" y1="40" x2="50" y2="26" stroke={colors.shirt} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="50" cy="26" r="3.5" fill={colors.skin}/>
        {animate && (
          <animateTransform attributeName="transform" type="rotate"
            values="5 40 40;-5 40 40;5 40 40" dur="0.5s" repeatCount="indefinite"/>
        )}
      </g>

      {/* 다리 — 제자리 */}
      <line x1="28" y1="54" x2="25" y2="68" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
      <ellipse cx="25" cy="69" rx="5" ry="2.5" fill={colors.shoes}/>
      <line x1="36" y1="54" x2="39" y2="68" stroke={colors.pants} strokeWidth="6" strokeLinecap="round"/>
      <ellipse cx="39" cy="69" rx="5" ry="2.5" fill={colors.shoes}/>
    </g>
  )
}
