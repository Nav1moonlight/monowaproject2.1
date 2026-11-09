import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { B3Transaction, DomesticTransaction } from '../../api'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processed: '#3b82f6',
  disposed: '#22c55e',
  received: '#0ea5e9',
  completed: '#22c55e',
  draft: '#6b7280',
  verified: '#10b981',
  rejected: '#ef4444',
  submitted: '#3b82f6',
}

interface RecentActivitySectionProps {
  b3List: B3Transaction[]
  domesticList: DomesticTransaction[]
}

export default function RecentActivitySection({ b3List, domesticList }: RecentActivitySectionProps) {
  const { tokens, t, setPage, theme } = useApp()
  const isMobile = useIsMobile()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  // Combine top 4 B3 and top 4 Domestic
  const activities = [
    ...b3List.slice(0, 4).map((item) => ({
      id: `B3-${item.id}`,
      type: 'b3',
      isIn: item.transaction_type === 'IN',
      title: item.waste_name || 'Limbah B3',
      code: item.waste_code,
      weight: Number(item.weight_kg || 0),
      date: item.date,
      status: (item.status || 'pending').toLowerCase(),
      subtitle: item.transaction_type === 'IN' ? `Dari: ${item.source || '-'}` : `Ke: ${item.destination || '-'}`
    })),
    ...domesticList.slice(0, 4).map((item) => ({
      id: `DOM-${item.id}`,
      type: 'domestic',
      isIn: item.movement_type === 'IN',
      title: item.session === 'MORNING' ? 'Sampah Domestik Pagi' : 'Sampah Domestik Sore',
      code: item.movement_type,
      weight: Number(item.total_weight_kg || item.domestic_residue_kg || 0),
      date: item.date,
      status: (item.status || 'submitted').toLowerCase(),
      subtitle: `PIC: ${item.pic_name || 'Petugas'}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)

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
          <span style={{ fontSize: 16 }}>📋</span>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: tokens.text }}>
            {t('recentActivity', 'Aktivitas Terkini & Log Masuk-Keluar')}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setPage('b3')}
            style={{
              background: 'transparent',
              border: 'none',
              color: tokens.primary,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: tokens.fontFamily,
              padding: 0,
            }}
          >
            Lihat B3 →
          </button>
          <span style={{ color: tokens.border }}>|</span>
          <button
            type="button"
            onClick={() => setPage('domestic')}
            style={{
              background: 'transparent',
              border: 'none',
              color: tokens.primary,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: tokens.fontFamily,
              padding: 0,
            }}
          >
            Lihat Domestik →
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>
          Belum ada catatan aktivitas transaksi terbaru.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map((act) => {
            const statusColor = STATUS_COLORS[act.status] || tokens.primary
            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: tokens.radius,
                  background: tokens.inputBg,
                  border: `1px solid ${tokens.border}`,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: act.type === 'b3'
                        ? (act.isIn ? `${tokens.chartB3In}20` : `${tokens.chartB3Out}20`)
                        : `${tokens.chartDomMorning}20`,
                      color: act.type === 'b3'
                        ? (act.isIn ? tokens.chartB3In : tokens.chartB3Out)
                        : tokens.chartDomMorning,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {act.type === 'b3' ? (act.isIn ? '↓' : '↑') : '🏠'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: tokens.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{act.title}</span>
                      {act.code && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 5px',
                            borderRadius: 3,
                            background: tokens.bgSecondary,
                            color: tokens.textMuted,
                            border: `1px solid ${tokens.border}`,
                          }}
                        >
                          {act.code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 1 }}>
                      {act.date} • {act.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ fontWeight: 700, color: tokens.text, fontVariantNumeric: 'tabular-nums' }}>
                    {act.weight.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 3,
                      background: `${statusColor}18`,
                      color: statusColor,
                    }}
                  >
                    {t(act.status, act.status)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
