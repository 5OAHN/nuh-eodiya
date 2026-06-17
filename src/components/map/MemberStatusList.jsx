import { useStore } from '../../store/useStore'
import NudgeButton from '../nudge/NudgeButton'

const STATUS = {
  arrived: { label: '도착 완료', badge: 'badge-arrived', dot: 'bg-mcm-pistachio' },
  moving:  { label: '이동 중',   badge: 'badge-moving',  dot: 'bg-mcm-mustard'  },
  waiting: { label: '미출발',    badge: 'badge-waiting', dot: 'bg-mcm-blue'     },
}

export default function MemberStatusList({ members }) {
  const myId = useStore(s => s.myId)
  const sorted = [...members].sort((a, b) => {
    const o = { arrived: 0, moving: 1, waiting: 2 }
    return (o[a.status] ?? 3) - (o[b.status] ?? 3)
  })

  return (
    <div className="bg-white">
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
        <span className="label-mcm mb-0">참여자 현황</span>
        <span className="text-mcm-stone text-xs font-medium">{members.length}명</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {sorted.map(member => (
          <MemberRow key={member.id} member={member} isMe={member.id === myId} />
        ))}
      </div>
    </div>
  )
}

function MemberRow({ member, isMe }) {
  const cfg = STATUS[member.status] || STATUS.waiting

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isMe ? 'bg-mcm-blue-light/20' : 'bg-white'}`}>
      {/* 아바타 */}
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center text-2xl"
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
          {isMe && <span className="bg-mcm-blue-light text-mcm-blue text-xs font-bold px-2 py-0.5 rounded-pill">나</span>}
          {member.isHost && <span className="bg-mcm-mustard-light text-mcm-mustard text-xs font-bold px-2 py-0.5 rounded-pill">방장</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cfg.badge}>{cfg.label}</span>
          {member.status !== 'arrived' && member.eta != null && (
            <span className="text-mcm-stone text-xs font-medium">약 {Math.round(member.eta)}분</span>
          )}
        </div>
      </div>

      {/* 재촉 버튼 */}
      {!isMe && member.status !== 'arrived' && (
        <NudgeButton targetMember={member} />
      )}
    </div>
  )
}
