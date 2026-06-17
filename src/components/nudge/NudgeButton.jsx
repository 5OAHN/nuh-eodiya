import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store/useStore'

const COOLDOWN_MS = 30000

export default function NudgeButton({ targetMember }) {
  const nudge = useStore(s => s.nudge)
  const myNickname = useStore(s => s.myNickname)
  const room = useStore(s => s.room)

  const [cooldownRemain, setCooldownRemain] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [popped, setPopped] = useState(false)

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldownRemain <= 0) return
    const id = setInterval(() => {
      setCooldownRemain(prev => {
        const next = prev - 1
        return next <= 0 ? 0 : next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownRemain > 0])

  const handleNudge = useCallback(async () => {
    if (cooldownRemain > 0) return

    const result = nudge(targetMember.id)

    if (!result.ok) {
      setCooldownRemain(result.remainSec)
      return
    }

    // 화면 쉐이크 효과
    setShaking(true)
    setTimeout(() => setShaking(false), 600)

    // 팝 피드백
    setPopped(true)
    setTimeout(() => setPopped(false), 2000)

    // 쿨다운 시작
    setCooldownRemain(COOLDOWN_MS / 1000)

    // 카카오톡 메시지 발송 시도
    await sendKakaoNudge(myNickname || '누군가', targetMember.nickname, room)
  }, [cooldownRemain, nudge, targetMember, myNickname, room])

  const isCooling = cooldownRemain > 0

  return (
    <div className="relative flex-shrink-0">
      {/* 피드백 토스트 */}
      {popped && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-kitsch-orange border-2 border-black px-3 py-1 text-black font-black text-xs whitespace-nowrap shadow-[3px_3px_0_#000] animate-bouncy z-10">
          🚨 재촉 발사!
        </div>
      )}

      <button
        onClick={handleNudge}
        disabled={isCooling}
        className={`
          btn-kitsch text-xs font-black px-3 py-2 relative
          ${isCooling
            ? 'bg-gray-600 border-gray-500 text-gray-400 shadow-none cursor-not-allowed'
            : 'bg-kitsch-pink text-white active:bg-kitsch-orange'
          }
          ${shaking ? 'animate-shake' : ''}
        `}
      >
        {isCooling ? (
          <span className="tabular-nums">{cooldownRemain}s</span>
        ) : (
          '찌르기 👉'
        )}
      </button>
    </div>
  )
}

async function sendKakaoNudge(fromName, toName, room) {
  try {
    // Kakao SDK 로드 보장
    const Kakao = await window.loadKakaoSDK()
    if (!Kakao || !Kakao.isInitialized()) {
      console.warn('[Kakao] SDK 미초기화 - 데모 모드')
      return
    }

    const roomUrl = room
      ? `${import.meta.env.VITE_APP_BASE_URL || window.location.origin}/room/${room.id}`
      : window.location.href

    // 카카오 링크 API: Feed 템플릿
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `🚨 ${fromName}님이 분노 게이지를 채우고 있습니다!`,
        description: `${toName}님, 지금 어디야?? 빨리 나와!! 다들 기다리고 있잖아 😤`,
        imageUrl: 'https://via.placeholder.com/800x400/FF4D00/000000?text=%EB%84%88+%EC%96%B4%EB%94%94%EC%95%BC',
        link: {
          mobileWebUrl: roomUrl,
          webUrl: roomUrl,
        },
      },
      buttons: [
        {
          title: '위치 확인하러 가기 📍',
          link: {
            mobileWebUrl: roomUrl,
            webUrl: roomUrl,
          },
        },
      ],
    })
  } catch (e) {
    // API 키 없는 데모 환경에서는 콘솔 로그로 대체
    console.log(`[Nudge 데모] ${fromName} → ${toName}: 카카오톡 메시지 발송 시뮬레이션`)
  }
}
