import { useEffect, useRef, useState } from 'react'

const STATUS_LABEL = {
  arrived: { text: '도착',   bg: '#6B9E6E', color: '#fff' },
  moving:  { text: '이동중', bg: '#C9982A', color: '#fff' },
  waiting: { text: '미출발', bg: '#4A7C9E', color: '#fff' },
}

export default function KakaoMap({ members, destination }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const [mapReady, setMapReady]   = useState(false)
  const [demoMode, setDemoMode]   = useState(false)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const maps = await window.loadKakaoMap()
        if (!maps || !mounted) { setDemoMode(true); return }

        const center = new maps.LatLng(
          destination?.lat || 37.4979,
          destination?.lng || 127.0276
        )
        const map = new maps.Map(containerRef.current, {
          center, level: 4, mapTypeId: maps.MapTypeId.NORMAL,
        })

        // 라이트 톤 필터 (CSS)
        if (containerRef.current) {
          containerRef.current.style.filter = 'saturate(0.55) brightness(1.06)'
        }

        // 목적지 오버레이
        new maps.CustomOverlay({
          position: center,
          content: `<div style="
            background:#4A7C9E; color:#fff;
            border-radius:20px; padding:5px 12px;
            font-weight:700; font-size:12px;
            box-shadow:0 4px 12px rgba(0,0,0,0.18);
            transform:translateY(-110%); white-space:nowrap;
          ">📍 ${destination?.name || '목적지'}</div>`,
          yAnchor: 1,
        }).setMap(map)

        mapRef.current = map
        setMapReady(true)
      } catch (e) {
        console.warn('[KakaoMap] 데모 모드:', e)
        setDemoMode(true)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  // 멤버 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps || demoMode) return
    const maps = window.kakao.maps

    markersRef.current.forEach(({ overlay }) => overlay.setMap(null))
    markersRef.current = []

    members.forEach(member => {
      if (!member.lat || !member.lng) return
      const pos    = new maps.LatLng(member.lat, member.lng)
      const status = STATUS_LABEL[member.status] || STATUS_LABEL.waiting
      const etaTxt = member.status === 'arrived' ? '' : member.eta ? `${Math.round(member.eta)}분` : ''

      const overlay = new maps.CustomOverlay({
        position: pos,
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;transform:translateY(-100%)">
            <div style="
              width:44px;height:44px;border-radius:50%;
              background:${member.color};
              display:flex;align-items:center;justify-content:center;font-size:22px;
              box-shadow:0 4px 14px rgba(0,0,0,0.18);
              border:3px solid #fff;
            ">${member.emoji}</div>
            <div style="
              background:${status.bg};color:${status.color};
              border-radius:20px;padding:2px 10px;
              font-weight:700;font-size:11px;
              box-shadow:0 2px 8px rgba(0,0,0,0.14);
              white-space:nowrap;
            ">${member.nickname}${etaTxt ? ' · ' + etaTxt : ''}</div>
          </div>`,
        yAnchor: 1,
      })
      overlay.setMap(mapRef.current)
      markersRef.current.push({ overlay })
    })
  }, [members, mapReady, demoMode])

  if (demoMode) return <DemoMap members={members} destination={destination} />

  return <div ref={containerRef} className="w-full h-full map-light" style={{ minHeight: 280 }} />
}

/* ── 데모 SVG 지도 ── */
function DemoMap({ members, destination }) {
  const cLat = destination?.lat || 37.4979
  const cLng = destination?.lng || 127.0276

  const toXY = (lat, lng) => ({
    x: Math.max(5, Math.min(93, ((lng - cLng) * 6000) + 50)),
    y: Math.max(8, Math.min(88, -((lat - cLat) * 6000) + 50)),
  })

  return (
    <div className="relative w-full h-full bg-stone-100 overflow-hidden" style={{ minHeight: 280 }}>
      {/* 격자 SVG */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#C8C2B8" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#B5AFA6" strokeWidth="3" opacity="0.5"/>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#B5AFA6" strokeWidth="3" opacity="0.5"/>
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#C8C2B8" strokeWidth="1.5" opacity="0.4"/>
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#C8C2B8" strokeWidth="1.5" opacity="0.4"/>
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#C8C2B8" strokeWidth="1.5" opacity="0.4"/>
        <rect x="25%" y="20%" width="20%" height="12%" rx="4" fill="#D4CFC8" opacity="0.6"/>
        <rect x="55%" y="60%" width="18%" height="10%" rx="4" fill="#D4CFC8" opacity="0.6"/>
        <rect x="15%" y="60%" width="22%" height="8%" rx="4" fill="#D4CFC8" opacity="0.6"/>
      </svg>

      {/* 목적지 핀 */}
      <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-100%)' }}>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-mcm-blue flex items-center justify-center text-white text-lg shadow-mcm">
            📍
          </div>
          <div className="bg-mcm-blue text-white rounded-pill px-3 py-1 text-xs font-bold mt-1.5 shadow-mcm-sm whitespace-nowrap">
            {destination?.name || '약속 장소'}
          </div>
        </div>
      </div>

      {/* 멤버 마커 */}
      {members.map(m => {
        const lat = m.lat || cLat + (Math.random() - 0.5) * 0.012
        const lng = m.lng || cLng + (Math.random() - 0.5) * 0.012
        const { x, y } = toXY(lat, lng)
        const status = STATUS_LABEL[m.status] || STATUS_LABEL.waiting
        return (
          <div
            key={m.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-mcm border-2 border-white ${m.status !== 'arrived' ? 'marker-pulse' : ''}`}
              style={{ background: m.color }}
            >
              {m.emoji}
            </div>
            <div
              className="rounded-pill px-2 py-0.5 text-xs font-bold mt-1 shadow-mcm-sm whitespace-nowrap"
              style={{ background: status.bg, color: status.color }}
            >
              {m.nickname}{m.eta && m.status !== 'arrived' ? ` · ${Math.round(m.eta)}분` : ''}
            </div>
          </div>
        )
      })}

      {/* 데모 배지 */}
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-mcm-stone text-xs font-medium px-2.5 py-1 rounded-pill shadow-mcm-sm">
        데모 지도
      </div>
    </div>
  )
}
