import { useApp } from '../context'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: 'search' | 'empty' | 'filter'
}

export default function EmptyState({
  title = 'Tidak Ada Data',
  message = 'Belum ada transaksi limbah yang tercatat atau cocok dengan pencarian Anda.',
  icon = 'search',
}: EmptyStateProps) {
  const { tokens } = useApp()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: tokens.fontFamily,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: `${tokens.primary}12`,
          color: tokens.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        {icon === 'search' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: tokens.textMuted, maxWidth: 300, lineHeight: 1.5 }}>
        {message}
      </div>
    </div>
  )
}
