import { useState } from 'react'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { DashboardSummaryData } from '../../api'

interface TpsCapacityCardProps {
  summary?: DashboardSummaryData | null
  loading?: boolean
}

export default function TpsCapacityCard({ summary = null, loading = false }: TpsCapacityCardProps) {
  const { tokens, theme } = useApp()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'b3' | 'dom'>('b3')
  const isNight = theme === 'nightcity'

  const isB3 = activeTab === 'b3'

  // Calculate live current weight from database summary
  const b3In = Number(summary?.b3_in_weight_kg ?? 0)
  const b3Out = Number(summary?.b3_out_weight_kg ?? 0)
  const b3StockVal = Math.max(0, b3In - b3Out)

  const domOrganic = Number(summary?.domestic_today_organic_kg ?? 0)
  const domInorganic = Number(summary?.domestic_today_inorganic_kg ?? 0)
  const domStockVal = domOrganic + domInorganic

  const currentWeightNum = isB3 ? b3StockVal : domStockVal
  const maxCapacityNum = isB3 ? 2500 : 1500

  const currentWeight = currentWeightNum.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  const maxCapacity = isB3 ? '2.500 kg' : '1.500 kg'
  const percentage = Math.min(100, Math.max(0, Math.round((currentWeightNum / maxCapacityNum) * 100)))

  const statusLabel = percentage > 85 ? 'Kritis' : percentage > 70 ? 'Penuh' : 'Aman'
  const statusColor = percentage > 85 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#4ade80'

  const tpsName = isB3 ? 'TPS B3 Utama (Blok A)' : 'TPS Domestik 3R'
  const tpsCode = isB3 ? 'TPS-B3-UTAMA-01' : 'TPS-DOM-01'
  const streamInfo = isB3
    ? `${summary?.b3_count_in ?? 0} Transaksi Masuk Aktif`
    : 'Pemilahan Organik & Anorganik'

  return (
    <div
      style={{
        background: isNight
          ? 'linear-gradient(135deg, #091224 0%, #030712 100%)'
          : `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
        border: `1px solid ${tokens.primary}40`,
        borderRadius: tokens.radius,
        padding: isMobile ? '18px' : '20px 22px',
        boxShadow: isNight
          ? `0 8px 24px ${tokens.primary}30`
          : '0 8px 24px rgba(15, 23, 42, 0.35)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
        fontFamily: tokens.fontFamily,
      }}
    >
      {/* Decorative Card Background Circles */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `${tokens.primary}18`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: `${tokens.accent}12`,
          pointerEvents: 'none',
        }}
      />

      {/* Top Card Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Card IC Chip icon */}
          <div
            style={{
              width: 32,
              height: 24,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: 14, height: 10, border: '1px solid rgba(0,0,0,0.3)', borderRadius: 2 }} />
          </div>

          {/* Contactless / NFC icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 6a6 6 0 0 1 6 6" />
            <path d="M12 10a2 2 0 0 1 2 2" />
          </svg>
        </div>

        {/* Brand Badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '1px', color: '#ffffff' }}>
            MONOWA PASS
          </div>
          <div style={{ fontSize: 10, color: tokens.primary, fontWeight: 700, textTransform: 'uppercase' }}>
            ● TPS MONITORING
          </div>
        </div>
      </div>

      {/* Center Value */}
      <div style={{ margin: '14px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
          Total Stok Tersimpan di {isB3 ? 'TPS B3' : 'TPS Domestik'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {loading ? '...' : currentWeight}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
            kg
          </span>
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontWeight: 600 }}>
            <span>Kapasitas: <strong style={{ color: statusColor }}>{percentage}% ({statusLabel})</strong></span>
            <span>Maks: {maxCapacity}</span>
          </div>
          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${tokens.primary}, ${statusColor})`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Carousel Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: 10,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
            {tpsName}
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>
            {tpsCode} • {loading ? 'Memuat...' : streamInfo}
          </div>
        </div>

        {/* Switcher Buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setActiveTab('b3')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: isB3 ? tokens.primary : 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            B3
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dom')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: !isB3 ? tokens.primary : 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Domestik
          </button>
        </div>
      </div>
    </div>
  )
}
