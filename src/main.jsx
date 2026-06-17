import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 카카오 SDK 동적 로드
const loadKakaoSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Kakao && window.Kakao.isInitialized()) { resolve(window.Kakao); return }
    const script = document.createElement('script')
    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js'
    script.async = true
    script.onload = () => {
      const key = import.meta.env.VITE_KAKAO_JS_KEY
      if (key && window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key)
        console.log('[Kakao SDK] Initialized:', window.Kakao.isInitialized())
      }
      resolve(window.Kakao)
    }
    script.onerror = () => reject(new Error('Kakao SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

// 카카오맵 SDK 동적 로드
const loadKakaoMap = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) { resolve(window.kakao.maps); return }
    const key = import.meta.env.VITE_KAKAO_MAP_KEY || ''
    if (!key) {
      console.warn('[KakaoMap] API 키 없음 - 데모 모드로 실행')
      resolve(null)
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('[KakaoMap] Loaded')
        resolve(window.kakao.maps)
      })
    }
    script.onerror = () => reject(new Error('KakaoMap SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

window.loadKakaoSDK = loadKakaoSDK
window.loadKakaoMap = loadKakaoMap

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
