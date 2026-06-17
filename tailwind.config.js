/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 미드센추리 모던 팔레트
        'mcm-cream':      '#F5F0E8',   // 메인 배경
        'mcm-warm':       '#EDE8DF',   // 카드 배경
        'mcm-blue':       '#4A7C9E',   // 더스티 블루 (주요 액션)
        'mcm-blue-light': '#D4E4EF',   // 블루 틴트
        'mcm-mustard':    '#C9982A',   // 머스터드 옐로우 (재촉/강조)
        'mcm-mustard-light': '#F5E6C0',// 머스터드 틴트
        'mcm-pistachio':  '#6B9E6E',   // 피스타치오 그린 (도착/완료)
        'mcm-pistachio-light': '#D4E9D5',
        'mcm-clay':       '#C27B5A',   // 클레이 오렌지 (경고/긴박)
        'mcm-clay-light': '#F0DDD4',
        'mcm-charcoal':   '#2C2C2C',   // 텍스트
        'mcm-stone':      '#7A7268',   // 서브 텍스트
        'mcm-border':     '#E0D9CF',   // 구분선
      },
      fontFamily: {
        'display': ['Black Han Sans', 'sans-serif'],
        'body':    ['Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        'mcm': '16px',
        'mcm-lg': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'mcm-sm':  '0 2px 8px rgba(0,0,0,0.07)',
        'mcm':     '0 4px 16px rgba(0,0,0,0.10)',
        'mcm-lg':  '0 8px 32px rgba(0,0,0,0.13)',
        'mcm-xl':  '0 16px 48px rgba(0,0,0,0.16)',
        'mcm-colored': '0 8px 24px rgba(74,124,158,0.25)',
      },
      animation: {
        'bouncy':      'bouncy 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'heartbeat':   'heartbeat 0.8s ease-in-out infinite',
        'shake':       'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'float':       'float 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pop-in':      'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in':     'fadeIn 0.3s ease-out',
        'scale-in':    'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        bouncy: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.08)' },
          '70%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.05)' },
        },
        shake: {
          '10%, 90%':      { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%':      { transform: 'translate3d(3px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-5px, 0, 0)' },
          '40%, 60%':      { transform: 'translate3d(5px, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(60px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.5) rotate(-6deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.06) rotate(1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
