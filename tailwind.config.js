/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kitsch-orange': '#FF4D00',
        'kitsch-blue': '#0047FF',
        'kitsch-green': '#00FF88',
        'kitsch-yellow': '#FFE600',
        'kitsch-pink': '#FF0080',
        'kitsch-dark': '#0A0A0A',
        'kitsch-gray': '#1A1A1A',
      },
      fontFamily: {
        'display': ['Gmarket Sans', 'Pretendard', 'sans-serif'],
        'body': ['Pretendard', 'sans-serif'],
      },
      animation: {
        'bouncy': 'bouncy 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pop-in': 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        bouncy: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 77, 0, 0.6)',
        'neon-blue': '0 0 20px rgba(0, 71, 255, 0.6)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.6)',
        'kitsch': '4px 4px 0px #000',
        'kitsch-lg': '6px 6px 0px #000',
      }
    },
  },
  plugins: [],
}
