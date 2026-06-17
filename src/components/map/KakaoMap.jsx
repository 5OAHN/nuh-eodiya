import { useEffect, useRef, useState } from 'react'

const STATUS_LABEL = {
  arrived: { text: '도착 ✅', bg: '#00FF88', color: '#000' },
  moving:  { text: '이동중 🏃', bg: '#FF4D00', color: '#fff' },
  waiting: { text: '미출발 🛋️', bg: '#0047FF', color: '#fff' },
}

// 흑백 카카오맵 스타일 JSON (카카오맵 커스텀 스카이)
// 실제 배포 시: map.setCustomOverlay()로 적용
const GRAYSCALE_STYLE = `
  [data-v-app] .kakao_map_container { filter: grayscale(85%) contrast(1.1) brightness(0.85); }
`

export default function KakaoMap({ members, destination }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const maps = await window.loadKakaoMap()
        if (!maps || !isMounted) {
          setDemoMode(true)
          return
        }

        const center = new maps.LatLng(
          destination?.lat || 37.4979,
          destination?.lng || 127.0276
        )
        const map = new maps.Map(containerRef.current, {
          center,
          level: 4,
          mapTypeId: maps.MapTypeId.NORMAL,
        })

        // 흑백 스타일 (CSS 방식)
        if (containerRef.current) {
          containerRef.current.style.filter = 'grayscale(85%) contrast(1.1)'
        }

        // 목적지 마커
        const destMarker = new maps.Marker({
          position: center,
          map,
          title: destination?.name || '목적지',
        })
        const destOverlay = new maps.CustomOverlay({
          position: center,
          content: `<div style="
            background:#FFE600; border:3px solid #000; padding:4px 8px;
            font-weight:900; font-size:12px; color:#000;
            box-shadow:3px 3px 0 #000; transform:translateY(-110%);
            white-space:nowrap;
          ">📍 ${destination?.name || '목적지'}</div>`,
          yAnchor: 1,
        })
        destOverlay.setMap(map)

        mapRef.current = map
        setMapReady(true)
      } catch (e) {
        console.warn('KakaoMap 초기화 실패, 데모 모드:', e)
        setDemoMode(true)
      }
    }

    init()
    return () => { isMounted = false }
  }, [])

  // 멤버 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps || demoMode) return
    const maps = window.kakao.maps

    // 기존 마커 제거
    markersRef.current.forEach(({ marker, overlay }) => {
      marker.setMap(null)
      overlay.setMap(null)
    })
    markersRef.current = []

    members.forEach(member => {
      if (!member.lat || !member.lng) return
      const pos = new maps.LatLng(member.lat, member.lng)

      const marker = new maps.Marker({ position: pos, map: mapRef.current })

      const status = STATUS_LABEL[member.status] || STATUS_LABEL.waiting
      const etaText = member.status === 'arrived' ? '' :
        member.eta ? `<span style="margin-left:4px; opacity:.8">${Math.round(member.eta)}분</span>` : ''

      const overlayContent = `
        <div style="
          display:flex; flex-direction:column; align-items:center; gap:4px;
          transform:translateY(-110%);
        ">
          <div style="
            background:${member.color}; border:3px solid #000; border-radius:50%;
            width:44px; height:44px; display:flex; align-items:center;
            justify-content:center; font-size:22px;
            box-shadow:3px 3px 0 #000;
            ${member.status === 'arrived' ? '' : 'animation: marker-pulse 2s ease-in-out infinite;'}
          ">${member.emoji}</div>
          <div style="
            background:${status.bg}; color:${status.color};
            border:2px solid #000; padding:2px 8px;
            font-weight:900; font-size:11px; white-space:nowrap;
            box-shadow:2px 2px 0 #000;
          ">${member.nickname}${etaText}</div>
        </div>
      `

      const overlay = new maps.CustomOverlay({
        position: pos,
        content: overlayContent,
        yAnchor: 1,
      })
      overlay.setMap(mapRef.current)
      marker.setMap(null) // 커스텀 오버레이만 사용

      markersRef.current.push({ marker, overlay })
    })
  }, [members, mapReady, demoMode])

  // 데모 모드: SVG 가상 지도
  if (demoMode) {
    return <DemoMap members={members} destination={destination} />
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full map-grayscale"
      style={{ minHeight: '300px' }}
    />
  )
}

// 카카오맵 API 키 없을 때 보여주는 데모 SVG 맵
function DemoMap({ members, destination }) {
  const centerLat = destination?.lat || 37.4979
  const centerLng = destination?.lng || 127.0276

  const toXY = (lat, lng) => {
    const x = ((lng - centerLng) * 6000) + 50
    const y = -((lat - centerLat) * 6000) + 50
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden" style={{ minHeight: '300px' }}>
      {/* 격자 배경 (가상 지도) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* 도로 시뮬레이션 */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" opacity="0.3"/>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="3" opacity="0.3"/>
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="white" strokeWidth="1.5" opacity="0.15"/>
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="1.5" opacity="0.15"/>
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="1.5" opacity="0.15"/>
      </svg>

      {/* 목적지 */}
      <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-kitsch-yellow border-2 border-black flex items-center justify-center text-lg shadow-[3px_3px_0_#000]">
            📍
          </div>
          <div className="bg-kitsch-yellow border-2 border-black px-2 py-0.5 text-xs font-black text-black mt-1 shadow-[2px_2px_0_#000]">
            {destination?.name || '약속 장소'}
          </div>
        </div>
      </div>

      {/* 멤버 마커 */}
      {members.map(member => {
        const { x, y } = toXY(member.lat || centerLat + (Math.random()-0.5)*0.01, member.lng || centerLng + (Math.random()-0.5)*0.01)
        const status = STATUS_LABEL[member.status] || STATUS_LABEL.waiting
        return (
          <div
            key={member.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
          >
            <div
              className={`w-10 h-10 rounded-full border-3 border-black flex items-center justify-center text-xl shadow-[3px_3px_0_#000] ${member.status !== 'arrived' ? 'marker-pulse' : ''}`}
              style={{ background: member.color, borderWidth: '3px', borderColor: '#000', borderStyle: 'solid' }}
            >
              {member.emoji}
            </div>
            <div
              className="px-2 py-0.5 border-2 border-black text-xs font-black mt-1 shadow-[2px_2px_0_#000] whitespace-nowrap"
              style={{ background: status.bg, color: status.color }}
            >
              {member.nickname} {member.eta && member.status !== 'arrived' ? `${Math.round(member.eta)}분` : ''}
            </div>
          </div>
        )
      })}

      {/* 데모 배지 */}
      <div className="absolute top-2 right-2 bg-kitsch-orange/90 border-2 border-black px-2 py-1 text-xs font-black text-black">
        데모 지도
      </div>
    </div>
  )
}
