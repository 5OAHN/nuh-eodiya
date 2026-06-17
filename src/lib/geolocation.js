/**
 * geolocation.js
 * 실제 GPS 위치 추적 + 카카오맵 경로 기반 ETA 계산
 */

// 위치 추적 시작 (watchPosition)
export function startLocationTracking(onUpdate, onError) {
  if (!navigator.geolocation) {
    onError?.('Geolocation 미지원 브라우저')
    return () => {}
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      })
    },
    (err) => {
      console.warn('[Geolocation]', err.message)
      onError?.(err.message)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,     // 10초 캐시
      timeout: 8000,
    }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}

// 1회성 위치 조회
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation 미지원'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}

// 직선거리 기반 ETA 추정 (카카오 경로 API 없을 때 폴백)
// Haversine 공식
export function calcEtaMinutes(fromLat, fromLng, toLat, toLng) {
  const R = 6371000 // 지구 반경 (m)
  const dLat = (toLat - fromLat) * Math.PI / 180
  const dLng = (toLng - fromLng) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat * Math.PI / 180) *
    Math.cos(toLat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) // 미터

  // 도보 평균 속도 80m/min 기준
  const walkingMin = dist / 80

  if (dist < 200) return 0          // 200m 이내 = 도착
  return Math.ceil(walkingMin)
}

// 상태 계산
export function calcStatus(etaMinutes) {
  if (etaMinutes === null || etaMinutes === undefined) return 'waiting'
  if (etaMinutes <= 1) return 'arrived'
  return 'moving'
}
