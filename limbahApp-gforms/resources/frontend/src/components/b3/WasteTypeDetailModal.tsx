import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'

export interface WasteSummaryItem {
  wasteName: string
  wasteCode: string
  category: 'B3' | 'DOMESTIC'
  totalInKg: number
  totalOutKg: number
  balanceKg: number
  capacityKg: number
  oldestInDate: string | null
  daysInStorage: number
  maxStorageDays: number
  status: 'safe' | 'warning' | 'expired' | 'empty'
  txCount: number
  latestTxDate: string | null
  sources: { name: string; count: number; totalKg: number }[]
  destinations: { name: string; count: number; totalKg: number }[]
  transactions: any[]
}

interface WasteTypeDetailModalProps {
  item: WasteSummaryItem | null
  onClose: () => void
}

export default function WasteTypeDetailModal({ item, onClose }: WasteTypeDetailModalProps) {
  const { tokens, theme, t } = useApp()
  const isMobile = useIsMobile()
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')

  const isGlass = theme === 'frosted' || theme === 'liquid'

  // Monthly trend for this specific waste item
  const monthlyTrend = useMemo(() => {
    if (!item) return []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthMap: Record<string, { inKg: number; outKg: number }> = {}
    monthNames.forEach((m) => { monthMap[m] = { inKg: 0, outKg: 0 } })

    item.transactions.forEach((tx) => {
      if (!tx.date) return
      const d = new Date(tx.date)
      if (isNaN(d.getTime())) return
      const monthIdx = d.getMonth()
      const mName = monthNames[monthIdx] || 'Jan'
      const weight = Number(tx.weightKg ?? tx.amountKg ?? 0)
      if (tx.category === 'b3in' || tx.transaction_type === 'IN') {
        monthMap[mName].inKg += weight
      } else {
        monthMap[mName].outKg += weight
      }
    })

    return monthNames.map((m) => ({
      name: m,
      Masuk: Number(monthMap[m].inKg.toFixed(1)),
      Keluar: Number(monthMap[m].outKg.toFixed(1)),
    }))
  }, [item])

  const filteredTransactions = useMemo(() => {
    if (!item) return []
    if (filterType === 'all') return item.transactions
    if (filterType === 'in') return item.transactions.filter((tx) => tx.category === 'b3in' || tx.transaction_type === 'IN')
    return item.transactions.filter((tx) => tx.category === 'b3out' || tx.transaction_type === 'OUT')
  }, [item, filterType])

  if (!item) return null

  const capacityPct = item.capacityKg > 0 ? Math.min(100, Math.round((item.balanceKg / item.capacityKg) * 100)) : 0

  const getStatusBadge = () => {
    if (item.balanceKg <= 0) {
      return { label: 'Saldo Kosong / Nihil', bg: `${tokens.textMuted}20`, color: tokens.textMuted }
    }
    if (item.status === 'expired') {
      const daysOver = item.daysInStorage - item.maxStorageDays
      return { label: `🔴 Lewat Batas (${daysOver} Hari)`, bg: '#ef444425', color: '#ef4444' }
    }
    if (item.status === 'warning') {
      const daysLeft = item.maxStorageDays - item.daysInStorage
      return { label: `🟡 Warning (Sisa ${daysLeft} Hari)`, bg: '#f59e0b25', color: '#f59e0b' }
    }
    return { label: `🟢 Aman (${item.daysInStorage}/${item.maxStorageDays} Hari)`, bg: '#22c55e25', color: '#22c55e' }
  }

  const badge = getStatusBadge()

  const tooltipStyle = {
    contentStyle: {
      background: tokens.tooltipBg,
      border: `1px solid ${tokens.border}`,
      borderRadius: '6px',
      color: tokens.tooltipText,
      fontSize: 12,
      fontFamily: tokens.fontFamily,
    },
    itemStyle: { color: tokens.tooltipText },
    labelStyle: { color: tokens.tooltipText, fontWeight: 600 },
  }

  const kpiCardStyle = {
    background: tokens.bgSecondary,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    minWidth: 0,
  }

  const modalNode = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '12px' : '24px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.card,
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius,
          boxShadow: tokens.shadow,
          backdropFilter: isGlass ? tokens.glassBlur : undefined,
          WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: tokens.fontFamily,
          color: tokens.text,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: tokens.headerBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                background: tokens.primary,
                color: tokens.textInverse,
                fontSize: 12,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}
            >
              {item.wasteCode}
            </span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: tokens.text }}>
              {item.wasteName}
            </h3>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: badge.bg,
                color: badge.color,
              }}
            >
              {badge.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${tokens.border}`,
              color: tokens.textMuted,
              width: 32,
              height: 32,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              transition: 'all 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: isMobile ? '16px' : '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Top KPI Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            {/* KPI 1: Total Masuk */}
            <div style={kpiCardStyle}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
                Total Masuk
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: tokens.chartB3In }}>
                {item.totalInKg.toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
              </div>
              <span style={{ fontSize: 10.5, color: tokens.textMuted }}>Akumulasi periode</span>
            </div>

            {/* KPI 2: Total Keluar */}
            <div style={kpiCardStyle}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
                Total Keluar
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: tokens.chartB3Out }}>
                {item.totalOutKg.toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
              </div>
              <span style={{ fontSize: 10.5, color: tokens.textMuted }}>Diserahkan ke Pihak 3</span>
            </div>

            {/* KPI 3: Saldo Sisa di TPS */}
            <div style={{ ...kpiCardStyle, borderLeft: `3px solid ${tokens.primary}` }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
                Saldo di TPS
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: tokens.text }}>
                {item.balanceKg.toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
              </div>
              <div style={{ width: '100%', height: 4, background: `${tokens.border}`, borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                <div
                  style={{
                    width: `${capacityPct}%`,
                    height: '100%',
                    background: capacityPct > 80 ? tokens.danger : capacityPct > 50 ? tokens.warning : tokens.primary,
                  }}
                />
              </div>
            </div>

            {/* KPI 4: Masa Simpan */}
            <div style={kpiCardStyle}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
                Masa Simpan Tertua
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: badge.color }}>
                {item.daysInStorage}{' '}
                <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>/ {item.maxStorageDays} hr</span>
              </div>
              <span style={{ fontSize: 10.5, color: tokens.textMuted }}>
                {item.oldestInDate ? `Batch: ${item.oldestInDate}` : 'Tidak ada batch tersisa'}
              </span>
            </div>
          </div>

          {/* Middle Section: Mini Trend Chart & Origin/Destination */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
              gap: 16,
            }}
          >
            {/* Monthly Trend Chart */}
            <div
              style={{
                background: tokens.bgSecondary,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                padding: '14px',
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700, color: tokens.text, marginBottom: 10 }}>
                Tren Keluar - Masuk Bulanan (kg)
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyTrend} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9.5, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${Number(val).toLocaleString('id-ID')} kg`, '']} />
                  <Bar dataKey="Masuk" fill={tokens.chartB3In} radius={[3, 3, 0, 0]} name="Masuk (kg)" />
                  <Bar dataKey="Keluar" fill={tokens.chartB3Out} radius={[3, 3, 0, 0]} name="Keluar (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sumber & Transporter breakdown */}
            <div
              style={{
                background: tokens.bgSecondary,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>
                  📍 Sumber Penghasil Terbanyak
                </div>
                {item.sources.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: tokens.textMuted }}>Belum ada data sumber</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.sources.slice(0, 3).map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                        <span style={{ color: tokens.text }}>{s.name}</span>
                        <span style={{ fontWeight: 600, color: tokens.textMuted }}>{s.totalKg.toLocaleString('id-ID')} kg ({s.count}x)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${tokens.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>
                  🚚 Pihak Ke-3 / Tujuan Pengolah
                </div>
                {item.destinations.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: tokens.textMuted }}>Belum ada riwayat pengiriman</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.destinations.slice(0, 3).map((d, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                        <span style={{ color: tokens.text }}>{d.name}</span>
                        <span style={{ fontWeight: 600, color: tokens.textMuted }}>{d.totalKg.toLocaleString('id-ID')} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Specific Transactions Logbook Table */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>
                📄 Logbook Riwayat Transaksi ({filteredTransactions.length})
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'in', 'out'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterType(mode)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: '4px',
                      border: `1px solid ${tokens.border}`,
                      background: filterType === mode ? tokens.primary : 'transparent',
                      color: filterType === mode ? tokens.textInverse : tokens.textMuted,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: tokens.fontFamily,
                    }}
                  >
                    {mode === 'all' ? 'Semua' : mode === 'in' ? 'Masuk' : 'Keluar'}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                overflowX: 'auto',
                background: tokens.card,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: tokens.bgSecondary, borderBottom: `1px solid ${tokens.border}` }}>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>TANGGAL</th>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>TIPE</th>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>BERAT (KG)</th>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>SUMBER / TUJUAN</th>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>MANIFEST</th>
                    <th style={{ padding: '8px 12px', color: tokens.textMuted, fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: tokens.textMuted }}>
                        Tidak ada transaksi yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.slice(0, 15).map((tx, idx) => {
                      const isIn = tx.category === 'b3in' || tx.transaction_type === 'IN'
                      const weight = Number(tx.amountKg ?? tx.weightKg ?? 0)
                      return (
                        <tr key={idx} style={{ borderBottom: `1px solid ${tokens.border}` }}>
                          <td style={{ padding: '8px 12px', color: tokens.text, whiteSpace: 'nowrap' }}>
                            {tx.date || '-'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: isIn ? `${tokens.chartB3In}18` : `${tokens.chartB3Out}18`,
                                color: isIn ? tokens.chartB3In : tokens.chartB3Out,
                              }}
                            >
                              {isIn ? 'MASUK' : 'KELUAR'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: tokens.text }}>
                            {weight.toLocaleString('id-ID')} kg
                          </td>
                          <td style={{ padding: '8px 12px', color: tokens.text }}>
                            {isIn ? (tx.source || '-') : (tx.destination || '-')}
                          </td>
                          <td style={{ padding: '8px 12px', color: tokens.textMuted, fontFamily: 'monospace', fontSize: 11 }}>
                            {tx.manifest || '-'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {(() => {
                              const s = String(tx.status || 'pending').toLowerCase()
                              const statusColorMap: Record<string, string> = {
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
                              const col = statusColorMap[s] || tokens.primary
                              return (
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: `${col}18`,
                                    color: col,
                                  }}
                                >
                                  {t(s) || s}
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${tokens.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: tokens.headerBg,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: tokens.radius,
              border: `1px solid ${tokens.border}`,
              background: 'transparent',
              color: tokens.text,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: tokens.fontFamily,
            }}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )

  return createPortal(modalNode, document.body)
}
