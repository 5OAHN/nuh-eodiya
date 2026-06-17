/**
 * session.js
 * 새로고침 / 뒤로가기 후에도 방 세션을 복원하기 위한
 * sessionStorage 기반 경량 영속성 레이어
 *
 * 저장 구조:
 * sessionStorage['nuh_session'] = {
 *   roomId   : string,
 *   memberId : string,
 *   nickname : string,
 *   emoji    : string,
 *   isHost   : boolean,
 *   savedAt  : number (timestamp)
 * }
 *
 * TTL: 6시간 (약속 특성상 당일만 유효)
 */

const KEY = 'nuh_session'
const TTL = 6 * 60 * 60 * 1000  // 6시간

export function saveSession(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() }))
  } catch {}
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // TTL 초과 시 폐기
    if (Date.now() - parsed.savedAt > TTL) {
      clearSession()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearSession() {
  try { sessionStorage.removeItem(KEY) } catch {}
}

// URL의 roomId와 세션 roomId가 일치하는지 검증
export function isSessionValid(roomId) {
  const s = loadSession()
  return s && s.roomId === roomId
}
