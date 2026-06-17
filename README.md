# 너 어디야 🚨
실시간 위치 공유 & 지각자 처벌 룰렛 서비스

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열고 카카오 API 키 입력

# 3. 개발 서버 실행
npm run dev

# 4. 빌드
npm run build
```

## 🔑 카카오 API 키 발급

1. https://developers.kakao.com 접속 → 내 애플리케이션 → 앱 추가
2. **플랫폼 → Web** 탭에서 사이트 도메인 추가
   - 로컬: `http://localhost:3000`
   - 배포: `https://your-app.vercel.app`
3. **카카오 로그인 → 동의항목**: 위치정보 활성화
4. **앱 키 탭**에서 `JavaScript 키` 복사

```env
# .env.local
VITE_KAKAO_JS_KEY=발급받은_JavaScript_키
VITE_KAKAO_MAP_KEY=발급받은_JavaScript_키  # 보통 동일
VITE_APP_BASE_URL=https://your-app.vercel.app
```

## ☁️ Vercel 배포

```bash
# Vercel CLI
npm i -g vercel
vercel

# 환경변수는 Vercel 대시보드 → Settings → Environment Variables에 추가
```

**⚠️ 중요**: 카카오 개발자 콘솔에서 Vercel 도메인을 허용 도메인으로 추가해야 합니다.

## 🗂️ 폴더 구조

```
src/
├── components/
│   ├── map/
│   │   ├── KakaoMap.jsx        ← 카카오맵 + 데모 SVG맵
│   │   ├── CountdownTimer.jsx  ← 심장박동 카운트다운
│   │   └── MemberStatusList.jsx← 멤버 상태 패널
│   ├── nudge/
│   │   └── NudgeButton.jsx     ← 재촉하기 + 쿨타임 + 카카오 공유
│   └── roulette/
│       └── RouletteWheel.jsx   ← SVG 룰렛 + 컨페티
├── pages/
│   ├── HomePage.jsx            ← 랜딩
│   ├── CreateRoomPage.jsx      ← 방 생성 (2단계 위저드)
│   ├── JoinPage.jsx            ← 링크 참가
│   ├── DashboardPage.jsx       ← 실시간 대시보드 ⭐
│   └── RoulettePage.jsx        ← 룰렛 풀스크린
├── store/
│   └── useStore.js             ← Zustand 전역 상태
├── App.jsx                     ← 라우팅
└── main.jsx                    ← SDK 동적 로드 진입점
```

## 🎮 유저 플로우

```
방장: / → /create → /room/:id (링크 공유)
                                    ↓
참여자: 링크 클릭 → /join/:id → /room/:id
                                    ↓
            카운트다운 만료 → /roulette/:id
```

## ⚙️ 실시간 위치 (프로덕션 고려사항)

MVP는 데모 모드(3초마다 위치 시뮬레이션)로 동작합니다.
실제 서비스화 시:

- **WebSocket** (Supabase Realtime / Firebase) 연동 권장
- Geolocation API → `watchPosition()`으로 실시간 위치 추적
- 배터리 절약: `maximumAge: 10000, timeout: 5000` 옵션 설정

## 📱 카카오톡 인앱 브라우저 주의사항

- `navigator.geolocation`은 카카오톡 인앱 브라우저에서 HTTPS 필수
- Vercel은 자동 HTTPS 제공 ✅
- iOS Safari에서 위치권한은 매 세션 재요청 필요
