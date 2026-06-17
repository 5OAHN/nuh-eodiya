/**
 * shareUrl.js
 * 공유 URL을 안전하게 생성하는 유틸
 *
 * 우선순위:
 * 1. VITE_APP_BASE_URL (Vercel 환경변수 - 가장 안정적)
 * 2. window.location.origin (브라우저 현재 도메인)
 * 3. window.location.href 에서 origin 추출 (인앱브라우저 폴백)
 */

function getBaseUrl() {
  // 1순위: 명시적 환경변수
  const envUrl = import.meta.env.VITE_APP_BASE_URL
  if (envUrl && envUrl !== 'https://your-app.vercel.app') {
    return envUrl.replace(/\/$/, '') // 끝 슬래시 제거
  }

  // 2순위: window.location.origin
  if (window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin
  }

  // 3순위: href에서 파싱 (카카오 인앱브라우저 안전망)
  try {
    const url = new URL(window.location.href)
    return `${url.protocol}//${url.host}`
  } catch {
    return ''
  }
}

/** 참가 링크: /join/:roomId */
export function makeJoinUrl(roomId) {
  const base = getBaseUrl()
  if (!base) return `https://nuh-eodiya.vercel.app/join/${roomId}` // 최종 하드코딩 폴백
  return `${base}/join/${roomId}`
}

/** 방 직접 링크: /room/:roomId */
export function makeRoomUrl(roomId) {
  const base = getBaseUrl()
  if (!base) return `https://nuh-eodiya.vercel.app/room/${roomId}`
  return `${base}/room/${roomId}`
}

/** 카카오 공유 공통 템플릿 */
export function makeKakaoSharePayload({ title, description, roomId, imageUrl }) {
  const joinUrl = makeJoinUrl(roomId)

  return {
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl: imageUrl || `https://via.placeholder.com/800x400/4A7C9E/ffffff?text=${encodeURIComponent('너 어디야 📍')}`,
      link: {
        mobileWebUrl: joinUrl,
        webUrl:       joinUrl,
      },
    },
    buttons: [
      {
        title: '📍 위치 확인하러 가기',
        link: {
          mobileWebUrl: joinUrl,
          webUrl:       joinUrl,
        },
      },
    ],
  }
}
