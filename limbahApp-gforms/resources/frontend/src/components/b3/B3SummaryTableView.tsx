import { useApp } from '../../context'
import type { WasteSummaryItem } from './WasteTypeDetailModal'

interface B3SummaryTableViewProps {
  items: WasteSummaryItem[]
  totals: {
    totalIn: number
    totalOut: number
    totalBal: number
  }
  onSelectWaste: (item: WasteSummaryItem) => void
}

export default function B3SummaryTableView({
  items,
  totals,
  onSelectWaste,
}: B3SummaryTableViewProps) {
  const { tokens } = useApp()

  return (
    <div
      style={{
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radius,
        overflowX: 'auto',
        background: tokens.card,
        boxShadow: tokens.shadow,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
        <thead>
          <tr style={{ background: tokens.bgSecondary, borderBottom: `1px solid ${tokens.border}` }}>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>KODE</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>JENIS LIMBAH</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>SUMBER TERBANYAK</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>TOTAL MASUK</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>TOTAL KELUAR</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>SISA DI TPS</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>UTILISASI TPS</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>STATUS MASA SIMPAN</th>
            <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'center' }}>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const utilPct = item.capacityKg > 0 ? Math.min(100, Math.round((item.balanceKg / item.capacityKg) * 100)) : 0
            const topSource = item.sources[0]?.name || '-'

            return (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${tokens.border}`,
                  transition: 'background 0.12s ease',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectWaste(item)}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}08` }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Kode */}
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      background: `${tokens.primary}18`,
                      color: tokens.primary,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.wasteCode}
                  </span>
                </td>

                {/* Jenis Limbah */}
                <td style={{ padding: '10px 14px', fontWeight: 700, color: tokens.text, whiteSpace: 'nowrap' }}>
                  {item.wasteName}
                </td>

                {/* Sumber */}
                <td style={{ padding: '10px 14px', color: tokens.textMuted, fontSize: 11.5 }}>
                  {topSource}
                </td>

                {/* Masuk */}
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: tokens.chartB3In }}>
                  {item.totalInKg.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
                </td>

                {/* Keluar */}
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: tokens.chartB3Out }}>
                  {item.totalOutKg.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
                </td>

                {/* Sisa Saldo di TPS */}
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: item.balanceKg > 0 ? tokens.text : tokens.textMuted }}>
                  {item.balanceKg.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
                </td>

                {/* Utilisasi Progress Bar */}
                <td style={{ padding: '10px 14px', minWidth: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: tokens.bgSecondary, borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${utilPct}%`,
                          height: '100%',
                          background: utilPct > 80 ? tokens.danger : utilPct > 50 ? tokens.warning : tokens.primary,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: tokens.textMuted, minWidth: '28px', textAlign: 'right' }}>
                      {utilPct}%
                    </span>
                  </div>
                </td>

                {/* Status Masa Simpan */}
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {item.balanceKg <= 0 ? (
                    <span style={{ fontSize: 11, color: tokens.textMuted, background: `${tokens.textMuted}15`, padding: '2px 8px', borderRadius: '4px' }}>
                      ⚪ Nihil / Kosong
                    </span>
                  ) : item.status === 'expired' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#ef444420', padding: '3px 8px', borderRadius: '4px' }}>
                      🔴 {item.daysInStorage}/{item.maxStorageDays} Hari (Lewat)
                    </span>
                  ) : item.status === 'warning' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: '#f59e0b20', padding: '3px 8px', borderRadius: '4px' }}>
                      🟡 {item.daysInStorage}/{item.maxStorageDays} Hari (Warning)
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', background: '#22c55e18', padding: '3px 8px', borderRadius: '4px' }}>
                      🟢 {item.daysInStorage}/{item.maxStorageDays} Hari (Aman)
                    </span>
                  )}
                </td>

                {/* Aksi */}
                <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectWaste(item)
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: `1px solid ${tokens.border}`,
                      background: `${tokens.primary}12`,
                      color: tokens.primary,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: tokens.fontFamily,
                    }}
                  >
                    Detail ↗
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>

        {/* Total Row */}
        <tfoot>
          <tr style={{ background: tokens.bgSecondary, borderTop: `2px solid ${tokens.border}`, fontWeight: 800 }}>
            <td colSpan={3} style={{ padding: '10px 14px', color: tokens.text }}>
              TOTAL ({items.length} Jenis Limbah)
            </td>
            <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.chartB3In }}>
              {totals.totalIn.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
            </td>
            <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.chartB3Out }}>
              {totals.totalOut.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
            </td>
            <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.primary }}>
              {totals.totalBal.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
            </td>
            <td colSpan={3} style={{ padding: '10px 14px', color: tokens.textMuted, fontSize: 11 }}>
              Format Rekapitulasi Neraca TPS B3
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
