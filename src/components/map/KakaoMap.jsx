import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { getCharacterState } from '../character/Character'

// 상태별 마커 SVG (Base64 인코딩용 인라인 SVG 문자열 생성)
function makeMarkerSVG(member) {
  const state = getCharacterState(member)
  const c     = member.color || '#4A7C9E'
  const skin  = '#FDDBB4'
  const hair  = '#3D2B1F'

  // 말풍선 스타일 마커: 위쪽 원형 + 아래 뾰족이
  const bg = c

  let faceExtra = ''
  let bodyExtra = ''
  let topExtra  = ''

  if (state === 'fast') {
    topExtra = `<ellipse cx="24" cy="7" rx="4" ry="6" fill="#FF6B00" opacity="0.9"/>
                <ellipse cx="24" cy="8" rx="2.5" ry="4" fill="#FFD700"/>
                <ellipse cx="21" cy="9" rx="2" ry="4" fill="#FF4500" opacity="0.8"/>
                <ellipse cx="27" cy="9" rx="2" ry="4" fill="#FF4500" opacity="0.8"/>`
    faceExtra = `<path d="M 20 29 Q 24 33 28 29" fill="#F4A0A0"/>`
  } else if (state === 'arrived') {
    topExtra = `<text x="10" y="10" font-size="8" fill="#FFD700">✨</text>
                <text x="34" y="8"  font-size="8" fill="#FFD700">✨</text>`
    faceExtra = `<ellipse cx="20" cy="26" rx="2.5" ry="3" fill="#333"/>
                 <ellipse cx="28" cy="26" rx="2.5" ry="3" fill="#333"/>
                 <path d="M 18 30 Q 24 35 30 30" stroke="#c97" stroke-width="1.5" fill="none"/>`
  } else if (state === 'waiting') {
    topExtra = `<text x="30" y="10" font-size="7"  fill="#94A3B8" opacity="0.8">z</text>
                <text x="34" y="6"  font-size="9"  fill="#94A3B8" opacity="0.6">z</text>
                <text x="39" y="2"  font-size="11" fill="#94A3B8" opacity="0.4">z</text>`
    faceExtra = `<line x1="19" y1="26" x2="22" y2="27" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
                 <line x1="26" y1="26" x2="29" y2="27" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>`
  } else {
    faceExtra = `<ellipse cx="20" cy="26" rx="2" ry="2.2" fill="#333"/>
                 <ellipse cx="28" cy="26" rx="2" ry="2.2" fill="#333"/>
                 <path d="M 20 31 Q 24 34 28 31" stroke="#c97" stroke-width="1.2" fill="none"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
    <!-- 말풍선 배경 -->
    <rect x="2" y="2" width="44" height="44" rx="22" fill="${bg}" opacity="0.15"/>
    <rect x="4" y="4" width="40" height="40" rx="20" fill="white" stroke="${bg}" stroke-width="2.5"/>
    <!-- 뾰족이 -->
    <polygon points="19,44 29,44 24,54" fill="white" stroke="${bg}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="20,43 28,43 24,51" fill="white"/>

    ${topExtra}

    <!-- 머리 -->
    <circle cx="24" cy="22" r="13" fill="${skin}"/>
    <ellipse cx="24" cy="14" rx="12" ry="6" fill="${hair}"/>
    <!-- 볼 -->
    <ellipse cx="18" cy="24" rx="3" ry="2" fill="#F4A0A0" opacity="0.7"/>
    <ellipse cx="30" cy="24" rx="3" ry="2" fill="#F4A0A0" opacity="0.7"/>
    ${faceExtra}
  </svg>`

  return svg
}

function svgToDataUrl(svgStr) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
}

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
      const center = new window.kakao.maps.LatLng(destination?.lat || 37.4979, destination?.lng || 127.0276)
      mapRef.current.panTo(center)
      mapRef.current.setLevel(4, { animate: true })
    },
  }), [destination])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const maps = await window.loadKakaoMap()
        if (!maps || !mounted) { setDemoMode(true); return }
        const center = new maps.LatLng(destination?.lat || 37.4979, destination?.lng || 127.0276)
        const map = new maps.Map(containerRef.current, { center, level: 4 })
        if (containerRef.current) containerRef.current.style.filter = 'saturate(0.55) brightness(1.06)'
        new maps.CustomOverlay({
          position: center,
          content: `<div style="background:#4A7C9E;color:#fff;border-radius:20px;padding:5px 12px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.18);transform:translateY(-110%);white-space:nowrap;">📍 ${destination?.name || '목적지'}</div>`,
          yAnchor: 1,
        }).setMap(map)
        mapRef.current = map
        setMapReady(true)
      } catch { setDemoMode(true) }
    }
    init()
    return () => { mounted = false }
  }, [])

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
      const isFocused = focusedId === member.id
      const markerSvg = makeMarkerSVG(member)
      const scale = isFocused ? 1.3 : 1
      const w = Math.round(48 * scale)
      const h = Math.round(60 * scale)

      const overlay = new maps.CustomOverlay({
        position: pos,
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-100%);${isFocused ? 'filter:drop-shadow(0 0 8px rgba(74,124,158,0.5))' : ''}">
            <img src="${svgToDataUrl(markerSvg)}" width="${w}" height="${h}" style="transition:all 0.3s"/>
            <div style="background:${status.bg};color:${status.color};border-radius:20px;padding:2px 10px;font-weight:700;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.14);white-space:nowrap;margin-top:-4px;">
              ${member.nickname}${etaTxt ? ' · ' + etaTxt : ''}
            </div>
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

/* ── 데모 지도 ── */
function DemoMap({ members, destination, focusedId }) {
  const cLat = destination?.lat || 37.4979
  const cLng = destination?.lng || 127.0276
  const focusedMember = focusedId ? members.find(m => m.id === focusedId) : null
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
    const bLat = focusedMember ? posCache.current[focusedMember.id]?.lat || cLat : cLat
    const bLng = focusedMember ? posCache.current[focusedMember.id]?.lng || cLng : cLng
    const scale = focusedMember ? 9000 : 6000
    return {
      x: Math.max(5, Math.min(91, ((lng - bLng) * scale) + 50)),
      y: Math.max(8, Math.min(86, -((lat - bLat) * scale) + 50)),
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
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#B5AFA6" strokeWidth="3" opacity="0.5"/>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#B5AFA6" strokeWidth="3" opacity="0.5"/>
        <rect x="25%" y="20%" width="20%" height="12%" rx="4" fill="#D4CFC8" opacity="0.6"/>
        <rect x="55%" y="60%" width="18%" height="10%" rx="4" fill="#D4CFC8" opacity="0.6"/>
      </svg>

      {/* 목적지 핀 */}
      <div className="absolute transition-all duration-500" style={{ left:`${destXY.x}%`, top:`${destXY.y}%`, transform:'translate(-50%,-100%)' }}>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-mcm-blue flex items-center justify-center text-white text-lg shadow-md">📍</div>
          <div className="bg-mcm-blue text-white rounded-pill px-3 py-1 text-xs font-bold mt-1.5 shadow-sm whitespace-nowrap">
            {destination?.name || '약속 장소'}
          </div>
        </div>
      </div>

      {/* 멤버 마커 — SVG 캐릭터 */}
      {members.map(m => {
        const { lat, lng } = posCache.current[m.id] || { lat: cLat, lng: cLng }
        const { x, y }    = toXY(lat, lng)
        const status       = STATUS_LABEL[m.status] || STATUS_LABEL.waiting
        const isFocused    = focusedId === m.id
        const markerSvg    = makeMarkerSVG(m)

        return (
          <div
            key={m.id}
            className="absolute flex flex-col items-center transition-all duration-500"
            style={{ left:`${x}%`, top:`${y}%`, transform:'translate(-50%,-100%)', zIndex: isFocused ? 10 : 1 }}
          >
            <img
              src={svgToDataUrl(markerSvg)}
              width={isFocused ? 60 : 48}
              height={isFocused ? 75 : 60}
              style={{
                transition: 'all 0.3s',
                filter: isFocused ? 'drop-shadow(0 0 8px rgba(74,124,158,0.5))' : 'none',
              }}
              alt={m.nickname}
            />
            <div
              className="rounded-pill px-2 py-0.5 text-xs font-bold shadow-sm whitespace-nowrap"
              style={{ background: status.bg, color: status.color, marginTop: -4 }}
            >
              {m.nickname}{m.eta && m.status !== 'arrived' ? ` · ${Math.round(m.eta)}분` : ''}
            </div>
          </div>
        )
      })}

      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-mcm-stone text-xs font-medium px-2.5 py-1 rounded-pill shadow-sm border border-neutral-200">
        데모 지도
      </div>
    </div>
  )
}
