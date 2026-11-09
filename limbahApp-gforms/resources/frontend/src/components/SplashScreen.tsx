import { useEffect, useState, useRef } from 'react'
import { useApp } from '../context'
import logo from '../imports/ehs_logo.png'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const { tokens } = useApp()
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const [progress, setProgress] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => {
      onDoneRef.current()
    }, 2200)

    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 12 + 6
      if (p >= 100) {
        p = 100
        clearInterval(interval)
      }
      setProgress(Math.min(100, Math.round(p)))
    }, 70)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearInterval(interval)
    }
  }, [])

  const isGrad = tokens.bg.includes('gradient') || tokens.bg.includes('linear')
  const bg = isGrad ? tokens.bg : tokens.bg

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isGrad ? bg : tokens.bg,
        backgroundColor: isGrad ? undefined : tokens.bg,
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.5s ease',
        zIndex: 9999,
        fontFamily: tokens.fontFamily,
      }}
    >
      {/* Logo container */}
      <div
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'scale(0.8) translateY(20px)' : 'scale(1) translateY(0)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Logo ring */}
        <div style={{ position: 'relative', width: 96, height: 96 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tokens.primary}22 0%, transparent 70%)`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <img
            src={logo}
            alt="EHS Logo"
            style={{ width: 96, height: 96, objectFit: 'contain', position: 'relative', zIndex: 1 }}
          />
        </div>

        {/* App name */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: tokens.text,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            {tokens.neonGlow ? (
              <span style={{ color: tokens.primary, textShadow: tokens.neonGlow }}>
                MONOWA
              </span>
            ) : (
              'MONOWA'
            )}
          </div>
          <div
            style={{
              fontSize: 13,
              color: tokens.textMuted,
              marginTop: 6,
              letterSpacing: '0.3px',
            }}
          >
            Sistem Pemantauan & Pengelolaan Limbah
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 11,
              color: tokens.primary,
              background: `${tokens.primary}18`,
              padding: '2px 10px',
              borderRadius: 99,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            EHS DIVISION
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 200,
            height: 3,
            background: `${tokens.primary}20`,
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: tokens.neonGlow
                ? `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`
                : tokens.primary,
              borderRadius: 99,
              transition: 'width 0.1s ease',
              boxShadow: tokens.neonGlow ? tokens.neonGlow : undefined,
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: tokens.textMuted }}>
          Memuat sistem...
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
