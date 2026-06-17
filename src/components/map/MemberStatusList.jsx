import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import NudgeButton from '../nudge/NudgeButton'

const STATUS_CONFIG = {
  arrived: { label: '도착 완료', icon: '✅', bg: 'bg-kitsch-green', textColor: 'text-black' },
  moving:  { label: '이동 중',   icon: '🏃', bg: 'bg-kitsch-orange', textColor: 'text-black' },
  waiting: { label: '미출발',    icon: '🛋️', bg: 'bg-kitsch-blue',   textColor: 'text-white' },
}

export default function MemberStatusList({ members }) {
  const myId = useStore(s => s.myId)

  const sorted = [...members].sort((a, b) => {
    const order = { arrived: 0, moving: 1, waiting: 2 }
    return (order[a.status] ?? 3) - (order[b.status] ?? 3)
  })

  return (
    <div className="bg-kitsch-dark border-t-4 border-black">
      <div className="px-4 py-2 border-b-2 border-kitsch-gray">
        <p className="font-black text-white text-xs uppercase tracking-widest">
          참여자 현황 ({members.length}명)
        </p>
      </div>
      <div className="flex flex-col gap-0">
        {sorted.map((member, i) => (
          <MemberCard
            key={member.id}
            member={member}
            isMe={member.id === myId}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function MemberCard({ member, isMe, isLast }) {
  const cfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.waiting

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-kitsch-gray' : ''} ${isMe ? 'bg-kitsch-gray' : ''}`}>
      {/* 아바타 */}
      <div
        className="w-11 h-11 rounded-full border-2 border-black flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: member.color }}
      >
        {member.emoji}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-white text-base truncate">{member.nickname}</span>
          {isMe && (
            <span className="bg-kitsch-yellow border border-black text-black text-xs font-black px-1.5 py-0.5 flex-shrink-0">
              나
            </span>
          )}
          {member.isHost && (
            <span className="bg-kitsch-orange border border-black text-black text-xs font-black px-1.5 py-0.5 flex-shrink-0">
              방장
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`${cfg.bg} ${cfg.textColor} text-xs font-black px-2 py-0.5 border border-black`}>
            {cfg.icon} {cfg.label}
          </span>
          {member.status !== 'arrived' && member.eta != null && (
            <span className="text-gray-400 text-xs font-bold">
              약 {Math.round(member.eta)}분
            </span>
          )}
        </div>
      </div>

      {/* 재촉하기 버튼 */}
      {!isMe && member.status !== 'arrived' && (
        <NudgeButton targetMember={member} />
      )}
    </div>
  )
}
