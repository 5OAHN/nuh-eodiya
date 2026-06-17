import { useState, useEffect, useRef } from 'react'

/**
 * 카카오맵 장소 검색 모달
 * 카카오맵 SDK의 Places 서비스 사용
 * SDK 미로드 시 텍스트 입력 폴백
 */
export default function PlaceSearchModal({ onSelect, onClose }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const psRef = useRef(null)

  useEffect(() => {
    // 카카오맵 Places 서비스 초기화
    window.loadKakaoMap().then(maps => {
      if (maps?.services) {
        psRef.current = new maps.services.Places()
        setSdkReady(true)
      }
    }).catch(() => {})
  }, [])

  const handleSearch = () => {
    if (!query.trim()) return

    if (!sdkReady || !psRef.current) {
      // SDK 없으면 텍스트만 반환
      onSelect({ name: query, lat: 37.4979, lng: 127.0276 })
      onClose()
      return
    }

    setLoading(true)
    psRef.current.keywordSearch(query, (data, status) => {
      setLoading(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 8).map(p => ({
          name: p.place_name,
          address: p.road_address_name || p.address_name,
          lat: parseFloat(p.y),
          lng: parseFloat(p.x),
          category: p.category_group_name,
        })))
      } else {
        setResults([])
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl flex flex-col animate-slide-up"
           style={{ maxHeight: '85dvh' }}>

        {/* 헤더 */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-mcm-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-mcm-warm flex items-center justify-center text-mcm-charcoal font-bold"
          >
            ×
          </button>
          <h3 className="font-bold text-mcm-charcoal text-base">약속 장소 검색</h3>
        </div>

        {/* 검색 입력 */}
        <div className="px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            className="input-mcm flex-1"
            placeholder="장소명 또는 주소 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            enterKeyHint="search" onKeyDown={e => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button
            onClick={handleSearch}
            className="btn-mcm-primary px-4 py-3 text-sm font-bold flex-shrink-0"
          >
            {loading ? '...' : '검색'}
          </button>
        </div>

        {/* SDK 없을 때 안내 */}
        {!sdkReady && (
          <div className="mx-4 mb-3 bg-mcm-mustard-light rounded-xl px-3 py-2 text-mcm-mustard text-xs font-medium flex-shrink-0">
            ⚠️ 카카오맵 API 키 미설정 — 장소명만 입력 후 선택 가능
          </div>
        )}

        {/* 결과 목록 */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
          {results.length === 0 && query && !loading && (
            <div className="text-center py-8 text-mcm-stone text-sm">
              검색 결과가 없어요
            </div>
          )}

          {results.length === 0 && !query && (
            <div className="text-center py-10">
              <span className="text-4xl">🔍</span>
              <p className="text-mcm-stone text-sm mt-2">장소를 검색해보세요</p>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-1">
            {results.map((place, i) => (
              <button
                key={i}
                onClick={() => { onSelect(place); onClose() }}
                className="card-mcm-sm px-4 py-3 text-left hover:bg-mcm-blue-light/30 transition-colors active:scale-98"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">📍</span>
                  <div className="min-w-0">
                    <p className="font-bold text-mcm-charcoal text-sm">{place.name}</p>
                    <p className="text-mcm-stone text-xs mt-0.5 truncate">{place.address}</p>
                    {place.category && (
                      <span className="badge-arrived mt-1 inline-block">{place.category}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
