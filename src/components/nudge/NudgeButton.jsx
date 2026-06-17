import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store/useStore'

const COOLDOWN_SEC = 30

export default function NudgeButton({ targetMember }) {
  const nudge       = useStore(s => s.nudge)
  const myNickname  = useStore(s => s.myNickname)
  const room        = useStore(s => s.room)

  const [cooldown, setCooldown]   = useState(0)
  const [shaking, setShaking]     = useState(false)
  const [feedback, setFeedback]   = useState(false) // 토스트 표시
  const [pressed, setPressed]     = useState(false)  // 눌림 피드백

  // 쿨다운 카운터
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(p => p <= 1 ? 0 : p - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown > 0])

  const handleNudge = useCallback(async () => {
    if (cooldown > 0) return

    const result = nudge(targetMember.id)
    if (!result.ok) {
      setCooldown(result.remainSec)
      return
    }

    // 눌림 → 흔들기 순서
    setPressed(true)
    setTimeout(() => setPressed(false), 150)
    setShaking(true)
    setTimeout(() => setShaking(false), 600)

    // 피드백 토스트
    setFeedback(true)
    setTimeout(() => setFeedback(false), 2000)

    setCooldown(COOLDOWN_SEC)
    await sendKakaoNudge(myNickname || '누군가', targetMember.nickname, room)
  }, [cooldown, nudge, targetMember, myNickname, room])

  const isCooling = cooldown > 0
  // 쿨다운 진행률 (원형 SVG용)
  const coolPct = isCooling ? ((COOLDOWN_SEC - cooldown) / COOLDOWN_SEC) : 0

  return (
    <div className="relative flex-shrink-0">
      {/* 피드백 토스트 */}
      {feedback && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10
                        bg-mcm-mustard text-white text-xs font-bold
                        px-3 py-1.5 rounded-pill shadow-mcm
                        whitespace-nowrap animate-bouncy pointer-events-none">
          👉 재촉 완료!
        </div>
      )}

      <button
        onClick={handleNudge}
        disabled={isCooling}
        className={`
          relative overflow-hidden
          flex items-center gap-1.5
          text-xs font-bold px-3.5 py-2
          rounded-pill transition-all duration-150
          ${isCooling
            ? 'bg-mcm-warm text-mcm-stone cursor-not-allowed'
            : 'bg-mcm-mustard text-white shadow-mcm hover:brightness-105 active:scale-95'
          }
          ${shaking ? 'animate-shake' : ''}
          ${pressed ? 'scale-90' : ''}
        `}
      >
        {isCooling ? (
          <>
            {/* 쿨다운 원형 인디케이터 */}
            <svg width="14" height="14" className="flex-shrink-0 -rotate-90">
              <circle cx="7" cy="7" r="5" fill="none" stroke="#C8C2B8" strokeWidth="2"/>
              <circle
                cx="7" cy="7" r="5" fill="none"
                stroke="#C9982A" strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 5}`}
                strokeDashoffset={`${2 * Math.PI * 5 * (1 - coolPct)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="tabular-nums">{cooldown}s</span>
          </>
        ) : (
          <>
            <span>👉</span>
            <span>재촉하기</span>
          </>
        )}
      </button>
    </div>
  )
}

async function sendKakaoNudge(fromName, toName, room) {
  try {
    const Kakao = await window.loadKakaoSDK()
    if (!Kakao?.isInitialized()) return

    const url = room
      ? `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}/room/${room.id}`
      : window.location.href

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `📍 ${fromName}님이 찾고 있어요!`,
        description: `${toName}님, 지금 어디야?? 다들 기다리고 있어요 😤`,
        imageUrl: 'https://via.placeholder.com/800x400/4A7C9E/ffffff?text=%EB%84%88+%EC%96%B4%EB%94%94%EC%95%BC',
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: '위치 확인하기 📍', link: { mobileWebUrl: url, webUrl: url } }],
    })
  } catch {
    console.log(`[Nudge 데모] ${fromName} → ${toName}`)
  }
}
