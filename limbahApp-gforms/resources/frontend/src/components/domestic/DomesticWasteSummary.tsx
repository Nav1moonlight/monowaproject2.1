import { useState, useMemo } from 'react'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'

interface DomesticWasteSummaryProps {
  transactions: any[]
}

export default function DomesticWasteSummary({ transactions }: DomesticWasteSummaryProps) {
  const { tokens } = useApp()
  const isMobile = useIsMobile()

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Aggregation per Domestic Category: Organik, Anorganik, Residu
  const summary = useMemo(() => {
    let orgIn = 0, orgOut = 0
    let inorgIn = 0, inorgOut = 0
    let resIn = 0, resOut = 0

    let morningCount = 0, afternoonCount = 0

    transactions.forEach((tx) => {
      const isOut = tx.movementType === 'OUT'
      const org = Number(tx.organicKg ?? tx.organic_weight_kg ?? 0)
      const inorg = Number(tx.inorganicKg ?? tx.inorganic_weight_kg ?? 0)
      const res = Number(tx.domestic_residue_kg ?? 0)

      if (tx.session === 'morning' || tx.session === 'MORNING') morningCount++
      if (tx.session === 'afternoon' || tx.session === 'AFTERNOON') afternoonCount++

      if (isOut) {
        orgOut += org
        inorgOut += inorg
        resOut += res
      } else {
        orgIn += org
        inorgIn += inorg
        resIn += res
      }
    })

    const categories = [
      {
        id: 'organic',
        code: 'DOM-ORG',
        name: 'Limbah Organik (Sisa Makanan & Dapur)',
        icon: '🥬',
        color: '#22c55e',
        totalInKg: Number(orgIn.toFixed(1)),
        totalOutKg: Number(orgOut.toFixed(1)),
        balanceKg: Math.max(0, Number((orgIn - orgOut).toFixed(1))),
        capacityKg: 1000,
        treatment: 'Pengomposan / Biopori / Pakan Ternak',
      },
      {
        id: 'inorganic',
        code: 'DOM-INORG',
        name: 'Limbah Anorganik (Plastik, Kertas, Logam)',
        icon: '📦',
        color: '#3b82f6',
        totalInKg: Number(inorgIn.toFixed(1)),
        totalOutKg: Number(inorgOut.toFixed(1)),
        balanceKg: Math.max(0, Number((inorgIn - inorgOut).toFixed(1))),
        capacityKg: 1500,
        treatment: 'Bank Sampah / Daur Ulang Pihak 3',
      },
      {
        id: 'residue',
        code: 'DOM-RES',
        name: 'Limbah Residu Domestik',
        icon: '🗑️',
        color: '#8b5cf6',
        totalInKg: Number(resIn.toFixed(1)),
        totalOutKg: Number(resOut.toFixed(1)),
        balanceKg: Math.max(0, Number((resIn - resOut).toFixed(1))),
        capacityKg: 500,
        treatment: 'Pengangkutan TPA Resmi Kota/Kab',
      },
    ]

    const totalIn = orgIn + inorgIn + resIn
    const totalOut = orgOut + inorgOut + resOut
    const totalBal = (orgIn - orgOut) + (inorgIn - inorgOut) + (resIn - resOut)

    return {
      categories,
      totalIn: Number(totalIn.toFixed(1)),
      totalOut: Number(totalOut.toFixed(1)),
      totalBal: Math.max(0, Number(totalBal.toFixed(1))),
      morningCount,
      afternoonCount,
    }
  }, [transactions])

  const kpiChipStyle = {
    background: tokens.bgSecondary,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius,
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    flex: 1,
    minWidth: isMobile ? '130px' : '160px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Header Overview Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Kategori Domestik
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>
            3 <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>Kategori</span>
          </div>
        </div>

        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Akumulasi Masuk
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.chartDomMorning }}>
            {summary.totalIn.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Terkirim ke TPA/Daur Ulang
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.chartDomAfternoon }}>
            {summary.totalOut.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        <div style={{ ...kpiChipStyle, borderLeft: `3px solid ${tokens.primary}` }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Sisa Fisik di TPS Domestik
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.primary }}>
            {summary.totalBal.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: tokens.bgSecondary,
          padding: '8px 14px',
          borderRadius: tokens.radius,
          border: `1px solid ${tokens.border}`,
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, color: tokens.text }}>
          📊 Rekapitulasi Neraca Sampah Domestik ({transactions.length} Pencatatan)
        </span>

        <div
          style={{
            display: 'flex',
            background: tokens.card,
            border: `1px solid ${tokens.border}`,
            borderRadius: '6px',
            padding: 2,
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'table' ? tokens.primary : 'transparent',
              color: viewMode === 'table' ? tokens.textInverse : tokens.textMuted,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📋 Tabel
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'cards' ? tokens.primary : 'transparent',
              color: viewMode === 'cards' ? tokens.textInverse : tokens.textMuted,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔲 Kartu
          </button>
        </div>
      </div>

      {/* 3. Table or Cards */}
      {viewMode === 'table' ? (
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
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>KATEGORI SAMPAH</th>
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>PENGELOLAAN / TUJUAN</th>
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>TOTAL MASUK</th>
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>TOTAL KELUAR</th>
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700, textAlign: 'right' }}>SISA DI TPS</th>
                <th style={{ padding: '10px 14px', color: tokens.textMuted, fontWeight: 700 }}>KAPASITAS TPS</th>
              </tr>
            </thead>
            <tbody>
              {summary.categories.map((c, idx) => {
                const utilPct = c.capacityKg > 0 ? Math.min(100, Math.round((c.balanceKg / c.capacityKg) * 100)) : 0
                return (
                  <tr key={idx} style={{ borderBottom: `1px solid ${tokens.border}` }}>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          background: `${c.color}20`,
                          color: c.color,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: tokens.text }}>
                      {c.icon} {c.name}
                    </td>
                    <td style={{ padding: '10px 14px', color: tokens.textMuted }}>
                      {c.treatment}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: tokens.chartDomMorning }}>
                      {c.totalInKg.toLocaleString('id-ID')} kg
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: tokens.chartDomAfternoon }}>
                      {c.totalOutKg.toLocaleString('id-ID')} kg
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: tokens.text }}>
                      {c.balanceKg.toLocaleString('id-ID')} kg
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: tokens.bgSecondary, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${utilPct}%`, height: '100%', background: c.color }} />
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: tokens.textMuted }}>{utilPct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: tokens.bgSecondary, borderTop: `2px solid ${tokens.border}`, fontWeight: 800 }}>
                <td colSpan={3} style={{ padding: '10px 14px', color: tokens.text }}>
                  TOTAL KESELURUHAN
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.chartDomMorning }}>
                  {summary.totalIn.toLocaleString('id-ID')} kg
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.chartDomAfternoon }}>
                  {summary.totalOut.toLocaleString('id-ID')} kg
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: tokens.primary }}>
                  {summary.totalBal.toLocaleString('id-ID')} kg
                </td>
                <td style={{ padding: '10px 14px', color: tokens.textMuted, fontSize: 11 }}>
                  TPS Domestik
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          {summary.categories.map((c, idx) => {
            const utilPct = c.capacityKg > 0 ? Math.min(100, Math.round((c.balanceKg / c.capacityKg) * 100)) : 0
            return (
              <div
                key={idx}
                style={{
                  background: tokens.card,
                  border: `1px solid ${tokens.cardBorder}`,
                  borderTop: `4px solid ${c.color}`,
                  borderRadius: tokens.radius,
                  padding: '16px',
                  boxShadow: tokens.shadow,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: `${c.color}20`, color: c.color, fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                    {c.code}
                  </span>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                </div>

                <div style={{ fontSize: 14, fontWeight: 800, color: tokens.text }}>
                  {c.name}
                </div>

                <div style={{ background: tokens.bgSecondary, padding: '10px', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: tokens.textMuted }}>Sisa Saldo TPS:</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: tokens.text }}>{c.balanceKg.toLocaleString('id-ID')} kg</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: tokens.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${utilPct}%`, height: '100%', background: c.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: tokens.textMuted }}>
                    <span>Masuk: {c.totalInKg} kg</span>
                    <span>Keluar: {c.totalOutKg} kg</span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: tokens.textMuted }}>
                  Tujuan: {c.treatment}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
