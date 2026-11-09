import { useApp } from '../context'

interface SkeletonLoaderProps {
  rows?: number
  height?: number
}

export default function SkeletonLoader({ rows = 5, height = 36 }: SkeletonLoaderProps) {
  const { tokens } = useApp()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', padding: '8px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: '100%',
            borderRadius: tokens.radius,
            background: `linear-gradient(90deg, ${tokens.border}40 25%, ${tokens.border}80 50%, ${tokens.border}40 75%)`,
            backgroundSize: '200% 100%',
            animation: 'skeleton-pulse 1.5s infinite ease-in-out',
            opacity: 0.7,
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
