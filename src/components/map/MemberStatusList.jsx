import { useState } from 'react'
import { useStore } from '../../store/useStore'
import NudgeButton from '../nudge/NudgeButton'

const STATUS = {
  arrived: { label: '도착 완료', badge: 'badge-arrived', dot: 'bg-mcm-pistachio' },
  moving:  { label: '이동 중',   badge: 'badge-moving',  dot: 'bg-mcm-mustard'  },
  waiting: { label: '미출발',    badge: 'badge-waiting', dot: 'bg-mcm-blue'     },
}

// onFocus: 클릭된 멤버를 부모(DashboardPage)로 전달
export default function MemberStatusList({ members, onFocus }) {
  const myId = useStore(s => s.myId)
  const [activeMemberId, setActiveMemberId] = useState(null)

  const sorted = [...members].sort((a, b) => {
    const o = { arrived: 0, moving: 1, waiting: 2 }
    return (o[a.status] ?? 3) - (o[b.status] ?? 3)
  })

  const handleRowClick = (member) => {
    // 위치 없는 멤버는 포커싱 불가
    if (!member.lat || !member.lng) return

    const newId = activeMemberId === member.id ? null : member.id
    setActiveMemberId(newId)
    onFocus?.(newId ? member : null)
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
        <span className="label-mcm mb-0">참여자 현황</span>
        <div className="flex items-center gap-2">
          {activeMemberId && (
            <button
              onClick={() => { setActiveMemberId(null); onFocus?.(null) }}
              className="text-mcm-blue text-xs font-bold bg-mcm-blue-light px-2.5 py-1 rounded-pill"
            >
              전체 보기
            </button>
          )}
          <span className="text-mcm-stone text-xs font-medium">{members.length}명</span>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {sorted.map(member => (
          <MemberRow
            key={member.id}
            member={member}
            isMe={member.id === myId}
            isActive={activeMemberId === member.id}
            onClick={() => handleRowClick(member)}
          />
        ))}
      </div>
    </div>
  )
}

function MemberRow({ member, isMe, isActive, onClick }) {
  const cfg       = STATUS[member.status] || STATUS.waiting
  const hasLocation = !!(member.lat && member.lng)

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-200
        ${isActive ? 'bg-mcm-blue-light/30 border-l-4 border-mcm-blue' : isMe ? 'bg-mcm-blue-light/10' : 'bg-white'}
        ${hasLocation ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'cursor-default'}
      `}
    >
      {/* 아바타 */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-200
            ${isActive ? 'border-mcm-blue shadow-mcm-colored scale-105' : 'border-white shadow-md'}`}
          style={{ background: (member.color || '#4A7C9E') + '22' }}
        >
          {member.emoji}
        </div>
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${cfg.dot} rounded-full border-2 border-white`} />
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-mcm-charcoal text-sm truncate">{member.nickname}</span>
          {isMe    && <span className="bg-mcm-blue-light text-mcm-blue text-xs font-bold px-2 py-0.5 rounded-pill">나</span>}
          {member.isHost && <span className="bg-mcm-mustard-light text-mcm-mustard text-xs font-bold px-2 py-0.5 rounded-pill">방장</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cfg.badge}>{cfg.label}</span>
          {member.status !== 'arrived' && member.eta != null && (
            <span className="text-mcm-stone text-xs font-medium">약 {Math.round(member.eta)}분</span>
          )}
          {/* 위치 없는 멤버 안내 */}
          {!hasLocation && (
            <span className="text-neutral-400 text-xs">위치 미공유</span>
          )}
        </div>
      </div>

      {/* 우측 영역: 포커싱 아이콘 or 재촉 버튼 */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
        {hasLocation && (
          <span className={`text-base transition-transform duration-200 ${isActive ? 'text-mcm-blue scale-125' : 'text-neutral-300'}`}>
            📍
          </span>
        )}
        {!isMe && member.status !== 'arrived' && (
          <NudgeButton targetMember={member} />
        )}
      </div>
    </div>
  )
}
