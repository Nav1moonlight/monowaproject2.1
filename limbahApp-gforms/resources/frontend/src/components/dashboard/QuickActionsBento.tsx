import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'

interface QuickActionItem {
  key: string
  title: string
  subtitle: string
  icon: string
  targetPage: string
  color: string
  bgColor: string
  badge?: string
}

export default function QuickActionsBento() {
  const { tokens, setPage, t, theme } = useApp()
  const isMobile = useIsMobile()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  const actions: QuickActionItem[] = [
    {
      key: 'b3-in',
      title: t('menuB3In', 'Input B3 Masuk'),
      subtitle: 'Catat limbah B3 baru masuk ke TPS',
      icon: '↓',
      targetPage: 'b3-in',
      color: tokens.chartB3In,
      bgColor: `${tokens.chartB3In}18`,
    },
    {
      key: 'b3-out',
      title: t('menuB3Out', 'Input B3 Keluar'),
      subtitle: 'Disposisi limbah B3 ke pihak ke-3',
      icon: '↑',
      targetPage: 'b3-out',
      color: tokens.chartB3Out,
      bgColor: `${tokens.chartB3Out}18`,
    },
    {
      key: 'waste-in',
      title: t('menuWasteIn', 'Input Domestik Masuk'),
      subtitle: 'Pencatatan sampah organik & anorganik',
      icon: '🏠',
      targetPage: 'waste-in',
      color: tokens.chartDomMorning,
      bgColor: `${tokens.chartDomMorning}18`,
    },
    {
      key: 'waste-out',
      title: t('menuWasteOut', 'Input Domestik Keluar'),
      subtitle: 'Penyaluran residu ke TPA / Daur ulang',
      icon: '🚚',
      targetPage: 'waste-out',
      color: tokens.chartDomAfternoon,
      bgColor: `${tokens.chartDomAfternoon}18`,
    },
  ]

  return (
    <div
      style={{
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        padding: isMobile ? '16px' : '20px 22px',
        boxShadow: tokens.shadow,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: tokens.text }}>
            {t('quickActions', 'Aksi Cepat & Pencatatan Logbook')}
          </h3>
        </div>
        <span style={{ fontSize: 11, color: tokens.textMuted, fontWeight: 500 }}>
          Pilih jenis transaksi
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {actions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPage(item.targetPage as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: tokens.radius,
              border: `1px solid ${tokens.border}`,
              background: tokens.inputBg,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: tokens.fontFamily,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = item.color
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}22`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.border
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: item.bgColor,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, lineHeight: 1.2 }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: tokens.textMuted,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.subtitle}
              </div>
            </div>
            <span style={{ color: tokens.textMuted, fontSize: 14 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
