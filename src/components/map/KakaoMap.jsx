import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

const STATUS_LABEL = {
  arrived: { text: '도착',   bg: '#6B9E6E', color: '#fff' },
  moving:  { text: '이동중', bg: '#C9982A', color: '#fff' },
  waiting: { text: '미출발', bg: '#4A7C9E', color: '#fff' },
}

const KakaoMap = forwardRef(function KakaoMap({ members, destination }, ref) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const [mapReady, setMapReady]   = useState(false)
  const [demoMode, setDemoMode]   = useState(false)
  const [focusedId, setFocusedId] = useState(null)

  // 부모에서 호출할 포커싱/리셋 메서드 노출
  useImperativeHandle(ref, () => ({
    focusMember: (member) => {
      setFocusedId(member.id)
      setTimeout(() => setFocusedId(null), 3000)

      if (!mapRef.current || !window.kakao?.maps) return
      const pos = new window.kakao.maps.LatLng(member.lat, member.lng)
      mapRef.current.panTo(pos)
      mapRef.current.setLevel(3, { animate: true })
    },
    resetView: () => {
      setFocusedId(null)
      if (!mapRef.current || !window.kakao?.maps) return
      const center = new window.kakao.maps.LatLng(
        destination?.lat || 37.4979,
        destination?.lng || 127.0276
      )
      mapRef.current.panTo(center)
      mapRef.current.setLevel(4, { animate: true })
    },
  }), [destination])

  // 카카오맵 초기화
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const maps = await window.loadKakaoMap()
        if (!maps || !mounted) { setDemoMode(true); return }

        const center = new maps.LatLng(destination?.lat || 37.4979, destination?.lng || 127.0276)
        const map = new maps.Map(containerRef.current, {
          center, level: 4, mapTypeId: maps.MapTypeId.NORMAL,
        })
        if (containerRef.current) {
          containerRef.current.style.filter = 'saturate(0.55) brightness(1.06)'
        }
        new maps.CustomOverlay({
          position: center,
          content: `<div style="background:#4A7C9E;color:#fff;border-radius:20px;padding:5px 12px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.18);transform:translateY(-110%);white-space:nowrap;">📍 ${destination?.name || '목적지'}</div>`,
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
      const pos       = new maps.LatLng(member.lat, member.lng)
      const status    = STATUS_LABEL[member.status] || STATUS_LABEL.waiting
      const etaTxt    = member.status === 'arrived' ? '' : member.eta ? `${Math.round(member.eta)}분` : ''
      const isFocused = focusedId === member.id
      const size      = isFocused ? '52px' : '44px'
      const fontSize  = isFocused ? '26px' : '22px'
      const border    = isFocused ? '4px solid #4A7C9E' : '3px solid #fff'
      const shadow    = isFocused
        ? '0 0 0 6px rgba(74,124,158,0.2), 0 8px 20px rgba(0,0,0,0.2)'
        : '0 4px 14px rgba(0,0,0,0.18)'

      const overlay = new maps.CustomOverlay({
        position: pos,
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;transform:translateY(-100%)">
            <div style="
              width:${size};height:${size};border-radius:50%;
              background:${member.color};
              display:flex;align-items:center;justify-content:center;font-size:${fontSize};
              box-shadow:${shadow}; border:${border};
              transition:all 0.3s;
            ">${member.emoji}</div>
            <div style="
              background:${status.bg};color:${status.color};
              border-radius:20px;padding:2px 10px;
              font-weight:700;font-size:11px;
              box-shadow:0 2px 8px rgba(0,0,0,0.14);white-space:nowrap;
            ">${member.nickname}${etaTxt ? ' · ' + etaTxt : ''}</div>
          </div>`,
        yAnchor: 1,
        zIndex: isFocused ? 10 : 1,
      })
      overlay.setMap(mapRef.current)
      markersRef.current.push({ overlay })
    })
  }, [members, mapReady, demoMode, focusedId])

  if (demoMode) return <DemoMap members={members} destination={destination} focusedId={focusedId} />
  return <div ref={containerRef} className="w-full h-full map-light" style={{ minHeight: 280 }} />
})

export default KakaoMap

/* ── 데모 SVG 지도 ── */
function DemoMap({ members, destination, focusedId }) {
  const cLat = destination?.lat || 37.4979
  const cLng = destination?.lng || 127.0276
  const focusedMember = focusedId ? members.find(m => m.id === focusedId) : null

  // 위치 캐시 (랜덤 고정)
  const posCache = useRef({})
  members.forEach(m => {
    if (!posCache.current[m.id]) {
      posCache.current[m.id] = {
        lat: m.lat || cLat + (Math.random() - 0.5) * 0.012,
        lng: m.lng || cLng + (Math.random() - 0.5) * 0.012,
      }
    }
    if (m.lat) posCache.current[m.id] = { lat: m.lat, lng: m.lng }
  })

  const toXY = (lat, lng) => {
    const baseLat = focusedMember ? posCache.current[focusedMember.id]?.lat || cLat : cLat
    const baseLng = focusedMember ? posCache.current[focusedMember.id]?.lng || cLng : cLng
    const scale   = focusedMember ? 9000 : 6000
    return {
      x: Math.max(5, Math.min(93, ((lng - baseLng) * scale) + 50)),
      y: Math.max(8, Math.min(88, -((lat - baseLat) * scale) + 50)),
    }
  }

  const destXY = toXY(cLat, cLng)

  return (
    <div className="relative w-full h-full bg-stone-100 overflow-hidden" style={{ minHeight: 280 }}>
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
      <div
        className="absolute transition-all duration-500"
        style={{ left: `${destXY.x}%`, top: `${destXY.y}%`, transform: 'translate(-50%,-100%)' }}
      >
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-mcm-blue flex items-center justify-center text-white text-lg shadow-md">📍</div>
          <div className="bg-mcm-blue text-white rounded-pill px-3 py-1 text-xs font-bold mt-1.5 shadow-sm whitespace-nowrap">
            {destination?.name || '약속 장소'}
          </div>
        </div>
      </div>

      {/* 멤버 마커 */}
      {members.map(m => {
        const { lat, lng } = posCache.current[m.id] || { lat: cLat, lng: cLng }
        const { x, y }    = toXY(lat, lng)
        const status      = STATUS_LABEL[m.status] || STATUS_LABEL.waiting
        const isFocused   = focusedId === m.id

        return (
          <div
            key={m.id}
            className="absolute flex flex-col items-center transition-all duration-500"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-100%)', zIndex: isFocused ? 10 : 1 }}
          >
            <div
              className={`rounded-full flex items-center justify-center transition-all duration-300 ${m.status !== 'arrived' ? 'marker-pulse' : ''}`}
              style={{
                width:      isFocused ? '52px' : '40px',
                height:     isFocused ? '52px' : '40px',
                background: m.color,
                border:     isFocused ? '4px solid #4A7C9E' : '2px solid #fff',
                boxShadow:  isFocused
                  ? '0 0 0 6px rgba(74,124,158,0.2), 0 8px 20px rgba(0,0,0,0.2)'
                  : '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: isFocused ? '26px' : '20px',
              }}
            >
              {m.emoji}
            </div>
            <div
              className="rounded-pill px-2 py-0.5 text-xs font-bold mt-1 whitespace-nowrap shadow-sm"
              style={{ background: status.bg, color: status.color }}
            >
              {m.nickname}{m.eta && m.status !== 'arrived' ? ` · ${Math.round(m.eta)}분` : ''}
            </div>
          </div>
        )
      })}

      {/* 데모 배지 */}
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-mcm-stone text-xs font-medium px-2.5 py-1 rounded-pill shadow-sm border border-neutral-200">
        데모 지도
      </div>
    </div>
  )
}
