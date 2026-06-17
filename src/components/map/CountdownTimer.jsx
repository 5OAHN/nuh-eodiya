import { useState, useEffect } from 'react'

function pad(n) { return String(n).padStart(2, '0') }

export default function CountdownTimer({ meetingTime }) {
  const [remaining, setRemaining] = useState(0)
  const [phase, setPhase]         = useState('normal')

  useEffect(() => {
    const calc = () => {
      const diff = meetingTime - Date.now()
      setRemaining(diff)
      if (diff > 5 * 60 * 1000)  setPhase('normal')
      else if (diff > 60 * 1000) setPhase('warning')
      else if (diff > 0)         setPhase('critical')
      else                       setPhase('overtime')
    }
    calc()
    const id = setInterval(calc, 500)
    return () => clearInterval(id)
  }, [meetingTime])

  const isOvertime = remaining <= 0
  const totalSec   = Math.floor(Math.abs(remaining) / 1000)
  const mins       = Math.floor(totalSec / 60)
  const secs       = totalSec % 60

  const phaseConfig = {
    normal:   { bg: 'bg-white border-b border-neutral-200',  numColor: 'text-mcm-charcoal', label: '약속까지',    labelColor: 'text-mcm-stone',    bar: 'bg-mcm-pistachio' },
    warning:  { bg: 'bg-amber-50 border-b border-amber-100', numColor: 'text-mcm-mustard',  label: '⚠️ 서둘러!',  labelColor: 'text-mcm-mustard',  bar: 'bg-mcm-mustard'   },
    critical: { bg: 'bg-red-50 border-b border-red-100',     numColor: 'text-mcm-clay',     label: '🚨 지금 당장!',labelColor: 'text-mcm-clay',    bar: 'bg-mcm-clay'      },
    overtime: { bg: 'bg-red-50 border-b border-red-200',     numColor: 'text-red-500',       label: '💀 지각 확정', labelColor: 'text-red-400',     bar: 'bg-red-400'       },
  }
  const cfg = phaseConfig[phase]
  const total30 = 30 * 60 * 1000
  const pct = Math.max(0, Math.min(100, (remaining / total30) * 100))

  return (
    <div className={`${cfg.bg} transition-colors duration-700`}>
      <div className={`px-5 pt-4 pb-3 ${phase === 'critical' || phase === 'overtime' ? 'heartbeat-critical' : ''}`}>
        <p className={`text-center text-xs font-semibold uppercase tracking-widest ${cfg.labelColor} mb-1`}>
          {cfg.label}
        </p>
        <div className="flex items-baseline justify-center gap-0.5">
          {isOvertime && <span className={`font-display text-2xl ${cfg.numColor} mr-0.5`}>+</span>}
          <span className={`font-display text-6xl font-black leading-none tabular-nums ${cfg.numColor} transition-colors duration-500`}>
            {pad(mins)}
          </span>
          <span className={`font-display text-4xl font-black ${cfg.numColor} mx-1 ${phase === 'critical' || phase === 'overtime' ? 'animate-pulse' : ''}`}>:</span>
          <span className={`font-display text-6xl font-black leading-none tabular-nums ${cfg.numColor} transition-colors duration-500`}>
            {pad(secs)}
          </span>
        </div>
        <div className="mt-3 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div className={`h-full ${cfg.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
