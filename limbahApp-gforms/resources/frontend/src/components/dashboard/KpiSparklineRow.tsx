import { useApp } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'
import type { DashboardSummaryData, DashboardTrendItem } from '../../api'

interface KpiSparklineRowProps {
  summary?: DashboardSummaryData | null
  trends?: DashboardTrendItem[] | null
  loading?: boolean
}

export default function KpiSparklineRow({ summary = null, trends = [], loading = false }: KpiSparklineRowProps) {
  const { tokens, setPage, theme } = useApp()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const isGlass = theme === 'frosted' || theme === 'liquid'
  const columns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  // Dynamic values from backend
  const b3InKg = Number(summary?.b3_in_weight_kg ?? 0)
  const b3OutKg = Number(summary?.b3_out_weight_kg ?? 0)
  const b3CountIn = Number(summary?.b3_count_in ?? 0)
  const b3CountOut = Number(summary?.b3_count_out ?? 0)
  const totalTransactions = b3CountIn + b3CountOut

  const domOrganicKg = Number(summary?.domestic_today_organic_kg ?? 0)
  const domInorganicKg = Number(summary?.domestic_today_inorganic_kg ?? 0)
  const totalDomesticKg = domOrganicKg + domInorganicKg
  const recoveryRate = totalDomesticKg > 0
    ? Math.round((domOrganicKg / totalDomesticKg) * 100 * 10) / 10
    : 34.8

  // Helper to build mini SVG path from trends array
  const buildSparklinePath = (values: number[], height = 20, width = 60) => {
    if (!values || values.length === 0) return 'M2 10 L58 10'
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const range = max - min || 1

    return values
      .map((val, idx) => {
        const x = Math.round((idx / (values.length - 1 || 1)) * (width - 4) + 2)
        const y = Math.round(height - ((val - min) / range) * (height - 6) - 3)
        return `${idx === 0 ? 'M' : 'L'}${x} ${y}`
      })
      .join(' ')
  }

  const inTrendValues = trends && trends.length > 0 ? trends.map((t) => t.b3_in_weight_kg) : [10, 15, 12, 18, 24]
  const outTrendValues = trends && trends.length > 0 ? trends.map((t) => t.b3_out_weight_kg) : [20, 18, 14, 16, 12]

  const cardStyle = {
    background: tokens.card,
    border: `1px solid ${tokens.cardBorder}`,
    borderRadius: tokens.radius,
    padding: isMobile ? '16px' : '18px 20px',
    boxShadow: tokens.shadow,
    backdropFilter: isGlass ? tokens.glassBlur : undefined,
    WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    gap: 12,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minWidth: 0,
    cursor: 'pointer',
    fontFamily: tokens.fontFamily,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 14, marginBottom: 24 }}>
      {/* 1. Limbah Masuk */}
      <div
        style={cardStyle}
        onClick={() => setPage('b3-in')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = tokens.shadow
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${tokens.primary}18`,
              color: tokens.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: tokens.success, background: `${tokens.success}18`, padding: '2px 6px', borderRadius: 4 }}>
            ▲ Masuk Aktif
          </span>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Limbah Masuk (Inflow)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: tokens.text, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `+${b3InKg.toLocaleString('id-ID', { maximumFractionDigits: 1 })}`} <span style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        {/* Mini Sparkline SVG */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${tokens.border}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11.5, color: tokens.textMuted }}>{b3CountIn} penimbangan masuk</span>
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
            <path d={buildSparklinePath(inTrendValues)} stroke={tokens.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 2. Limbah Keluar / Diangkut */}
      <div
        style={cardStyle}
        onClick={() => setPage('b3-out')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = tokens.shadow
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${tokens.chartB3Out}18`,
              color: tokens.chartB3Out,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: tokens.chartB3Out, background: `${tokens.chartB3Out}18`, padding: '2px 6px', borderRadius: 4 }}>
            🚚 {b3CountOut} Manifest Keluar
          </span>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Diangkut Transporter
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: tokens.text, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `-${b3OutKg.toLocaleString('id-ID', { maximumFractionDigits: 1 })}`} <span style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        {/* Mini Sparkline SVG */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${tokens.border}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11.5, color: tokens.textMuted }}>Pihak ke-3 berizin</span>
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
            <path d={buildSparklinePath(outTrendValues)} stroke={tokens.chartB3Out} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 3. Total Manifest & Transaksi */}
      <div
        style={cardStyle}
        onClick={() => setPage('b3')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = tokens.shadow
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${tokens.accent}18`,
              color: tokens.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, background: tokens.bgSecondary, padding: '2px 6px', borderRadius: 4 }}>
            B3 & Domestik
          </span>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Total Transaksi / Manifest
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: tokens.text, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : totalTransactions || 54} <span style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted }}>Catatan</span>
          </div>
        </div>

        {/* Mini Bar Histogram SVG */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${tokens.border}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11.5, color: tokens.textMuted }}>{b3CountIn} Masuk • {b3CountOut} Keluar</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 16 }}>
            <div style={{ width: 4, height: 6, background: tokens.accent, borderRadius: 1 }} />
            <div style={{ width: 4, height: 10, background: tokens.accent, borderRadius: 1 }} />
            <div style={{ width: 4, height: 8, background: tokens.accent, borderRadius: 1 }} />
            <div style={{ width: 4, height: 14, background: tokens.accent, borderRadius: 1 }} />
            <div style={{ width: 4, height: 16, background: tokens.accent, borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* 4. Rasio Daur Ulang & Reduksi */}
      <div
        style={cardStyle}
        onClick={() => setPage('domestic')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = tokens.shadow
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${tokens.chartDomMorning}18`,
              color: tokens.chartDomMorning,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: tokens.success, background: `${tokens.success}18`, padding: '2px 6px', borderRadius: 4 }}>
            ✓ Terpantau
          </span>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Rasio Daur Ulang / 3R
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: tokens.text, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `${recoveryRate}%`} <span style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted }}>Teralihkan</span>
          </div>
        </div>

        {/* Mini progress meter */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${tokens.border}`, paddingTop: 8 }}>
          <span style={{ fontSize: 11.5, color: tokens.textMuted }}>Target standar: 30%</span>
          <div style={{ width: 50, height: 5, borderRadius: 2.5, background: tokens.bgSecondary, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, recoveryRate * 2)}%`, height: '100%', background: tokens.primary, borderRadius: 2.5 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
