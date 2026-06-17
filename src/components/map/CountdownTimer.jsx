import { useState, useEffect } from 'react'

function pad(n) { return String(n).padStart(2, '0') }

export default function CountdownTimer({ meetingTime }) {
  const [remaining, setRemaining] = useState(0)
  const [phase, setPhase] = useState('normal') // 'normal' | 'warning' | 'critical' | 'overtime'

  useEffect(() => {
    const calc = () => {
      const diff = meetingTime - Date.now()
      setRemaining(diff)
      if (diff > 5 * 60 * 1000) setPhase('normal')
      else if (diff > 60 * 1000) setPhase('warning')
      else if (diff > 0) setPhase('critical')
      else setPhase('overtime')
    }
    calc()
    const id = setInterval(calc, 500)
    return () => clearInterval(id)
  }, [meetingTime])

  const isOvertime = remaining <= 0
  const absMs = Math.abs(remaining)
  const totalSec = Math.floor(absMs / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60

  const phaseConfig = {
    normal:   { bg: 'bg-kitsch-blue',   text: 'text-white',        label: '약속까지', pulse: false },
    warning:  { bg: 'bg-kitsch-yellow', text: 'text-black',        label: '⚠️ 서둘러!', pulse: false },
    critical: { bg: 'bg-kitsch-orange', text: 'text-black',        label: '🚨 지금 당장!', pulse: true },
    overtime: { bg: 'bg-red-600',       text: 'text-white',        label: '💀 지각 확정', pulse: true },
  }
  const cfg = phaseConfig[phase]

  return (
    <div className={`${cfg.bg} border-b-4 border-black w-full transition-colors duration-1000`}>
      <div className={`px-4 py-3 ${cfg.pulse ? 'animate-heartbeat' : ''}`}>
        <p className={`text-center text-xs font-black uppercase tracking-widest ${cfg.text} opacity-70 mb-1`}>
          {cfg.label}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          {isOvertime && (
            <span className={`font-display text-3xl font-black ${cfg.text}`}>+</span>
          )}
          <span className={`font-display text-6xl font-black leading-none ${cfg.text} tabular-nums`}>
            {pad(mins)}
          </span>
          <span className={`font-display text-4xl font-black ${cfg.text} ${phase === 'critical' || phase === 'overtime' ? 'animate-pulse' : ''}`}>:</span>
          <span className={`font-display text-6xl font-black leading-none ${cfg.text} tabular-nums`}>
            {pad(secs)}
          </span>
        </div>
        {/* 프로그레스바 */}
        <TimerProgress meetingTime={meetingTime} remaining={remaining} phase={phase} />
      </div>
    </div>
  )
}

function TimerProgress({ meetingTime, remaining, phase }) {
  // 시작 30분 전 기준
  const total = 30 * 60 * 1000
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100))

  const barColor = {
    normal: 'bg-kitsch-green',
    warning: 'bg-kitsch-orange',
    critical: 'bg-red-400',
    overtime: 'bg-red-600',
  }[phase]

  return (
    <div className="mt-2 h-2 bg-black/20 w-full overflow-hidden">
      <div
        className={`h-full ${barColor} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
