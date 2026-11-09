import { useApp } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'
import type { WasteSummaryItem } from './WasteTypeDetailModal'

interface B3SummaryCardsViewProps {
  items: WasteSummaryItem[]
  onSelectWaste: (item: WasteSummaryItem) => void
}

export default function B3SummaryCardsView({
  items,
  onSelectWaste,
}: B3SummaryCardsViewProps) {
  const { tokens, theme } = useApp()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 14,
      }}
    >
      {items.map((item, idx) => {
        const utilPct = item.capacityKg > 0 ? Math.min(100, Math.round((item.balanceKg / item.capacityKg) * 100)) : 0

        return (
          <div
            key={idx}
            onClick={() => onSelectWaste(item)}
            style={{
              background: tokens.card,
              border: `1px solid ${tokens.cardBorder}`,
              borderRadius: tokens.radius,
              padding: '16px',
              boxShadow: tokens.shadow,
              backdropFilter: isGlass ? tokens.glassBlur : undefined,
              WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              borderTop: item.status === 'expired'
                ? `4px solid ${tokens.danger}`
                : item.status === 'warning'
                  ? `4px solid ${tokens.warning}`
                  : `4px solid ${tokens.primary}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = tokens.shadow
            }}
          >
            {/* Card Top */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span
                  style={{
                    background: `${tokens.primary}18`,
                    color: tokens.primary,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {item.wasteCode}
                </span>
                <span style={{ fontSize: 11, color: tokens.textMuted }}>
                  {item.txCount} Transaksi
                </span>
              </div>

              <div style={{ fontSize: 14.5, fontWeight: 800, color: tokens.text }}>
                {item.wasteName}
              </div>
            </div>

            {/* Card Body: Masuk, Keluar, Saldo */}
            <div style={{ background: tokens.bgSecondary, padding: '10px 12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: tokens.textMuted }}>Sisa Saldo di TPS:</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: tokens.text }}>
                  {item.balanceKg.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: tokens.textMuted, marginBottom: 3 }}>
                  <span>Kapasitas TPS</span>
                  <span>{utilPct}% ({item.balanceKg} / {item.capacityKg} kg)</span>
                </div>
                <div style={{ width: '100%', height: 5, background: tokens.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${utilPct}%`,
                      height: '100%',
                      background: utilPct > 80 ? tokens.danger : utilPct > 50 ? tokens.warning : tokens.primary,
                    }}
                  />
                </div>
              </div>

              {/* In and Out mini badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: `1px solid ${tokens.border}`, paddingTop: 6 }}>
                <div>
                  <span style={{ color: tokens.textMuted }}>Masuk: </span>
                  <span style={{ fontWeight: 700, color: tokens.chartB3In }}>{item.totalInKg.toLocaleString('id-ID')} kg</span>
                </div>
                <div>
                  <span style={{ color: tokens.textMuted }}>Keluar: </span>
                  <span style={{ fontWeight: 700, color: tokens.chartB3Out }}>{item.totalOutKg.toLocaleString('id-ID')} kg</span>
                </div>
              </div>
            </div>

            {/* Card Bottom: Status Masa Simpan & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
              {item.balanceKg <= 0 ? (
                <span style={{ color: tokens.textMuted }}>⚪ Nihil / Kosong</span>
              ) : item.status === 'expired' ? (
                <span style={{ fontWeight: 700, color: '#ef4444' }}>🔴 {item.daysInStorage} hr (Lewat Batas)</span>
              ) : item.status === 'warning' ? (
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>🟡 {item.daysInStorage} hr (Warning)</span>
              ) : (
                <span style={{ fontWeight: 600, color: '#22c55e' }}>🟢 {item.daysInStorage} hr (Aman)</span>
              )}

              <span style={{ fontWeight: 700, color: tokens.primary }}>
                Buka Logbook ↗
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
