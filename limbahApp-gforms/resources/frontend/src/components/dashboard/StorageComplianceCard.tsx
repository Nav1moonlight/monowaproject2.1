import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { StorageAlertItemApi, DashboardSummaryData, B3Transaction, DomesticTransaction } from '../../api'

interface StorageComplianceCardProps {
  alerts?: StorageAlertItemApi[]
  summary?: DashboardSummaryData | null
  b3List?: B3Transaction[]
  domesticList?: DomesticTransaction[]
  loading?: boolean
}

export default function StorageComplianceCard({
  alerts = [],
  summary = null,
  b3List = [],
  domesticList = [],
  loading = false,
}: StorageComplianceCardProps) {
  const { tokens, setPage, theme } = useApp()
  const isMobile = useIsMobile()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  // Calculate compliance statistics from real alerts
  const expiredCount = alerts.filter((a) => a.is_expired || (a.days_until_deadline !== undefined && a.days_until_deadline <= 0)).length
  const nearDeadlineCount = alerts.filter(
    (a) => !a.is_expired && a.days_until_deadline !== undefined && a.days_until_deadline > 0 && a.days_until_deadline <= 14
  ).length

  const isCompliant = expiredCount === 0
  const complianceStatusText = expiredCount > 0
    ? `${expiredCount} Overdue Masa Simpan`
    : nearDeadlineCount > 0
    ? `${nearDeadlineCount} Mendekati Batas 90 Hari`
    : '0 Melebihi Batas 90 Hari'

  const complianceBadgeText = expiredCount > 0 ? 'Kritis' : nearDeadlineCount > 0 ? 'Peringatan' : 'Aman'
  const complianceBadgeColor = expiredCount > 0 ? tokens.danger : nearDeadlineCount > 0 ? tokens.warning : tokens.success

  // Find latest/upcoming transporter transaction
  const outTransactions = b3List.filter((tx) => tx.category === 'b3out' || tx.type === 'OUT' || (tx as any).transaction_type === 'OUT')
  const latestOut = outTransactions[0]
  const transporterName = (latestOut as any)?.transport || (latestOut as any)?.transporter || 'PT PPLI / Wastec'
  const transporterDate = latestOut?.date ? new Date(latestOut.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Terjadwal'

  // Calculate distinct recorded days in the current month
  const currentMonthPrefix = new Date().toISOString().slice(0, 7) // YYYY-MM
  const uniqueB3Days = new Set(b3List.filter((tx) => tx.date && tx.date.startsWith(currentMonthPrefix)).map((tx) => tx.date.slice(0, 10)))
  const uniqueDomDays = new Set(domesticList.filter((tx) => tx.date && tx.date.startsWith(currentMonthPrefix)).map((tx) => tx.date.slice(0, 10)))
  const combinedDaysCount = new Set([...uniqueB3Days, ...uniqueDomDays]).size

  const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

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
        justifyContent: 'space-between',
        gap: 14,
        fontFamily: tokens.fontFamily,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${tokens.primary}18`,
              color: tokens.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: tokens.text, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            Kepatuhan & Masa Simpan
          </span>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isCompliant ? tokens.success : tokens.danger,
            background: `${isCompliant ? tokens.success : tokens.danger}18`,
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          ● {loading ? 'Memeriksa...' : isCompliant ? '100% Patuh' : 'Perlu Tindakan'}
        </span>
      </div>

      {/* 3 Metric Rows tailored for 30+ Professional Users */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Row 1: Masa Simpan B3 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 8,
            background: tokens.bgSecondary,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase' }}>
              Masa Simpan (PP 22/2021)
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: tokens.text, marginTop: 1 }}>
              {loading ? 'Memuat data SLA...' : complianceStatusText}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: complianceBadgeColor,
              background: `${complianceBadgeColor}20`,
              padding: '3px 8px',
              borderRadius: 6,
              flexShrink: 0,
            }}
          >
            {loading ? '...' : complianceBadgeText}
          </span>
        </div>

        {/* Row 2: Jadwal Transporter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 8,
            background: tokens.bgSecondary,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase' }}>
              Jadwal Angkut Transporter
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: tokens.text, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {loading ? 'Memuat...' : `${transporterDate} (${transporterName})`}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: tokens.accent,
              background: `${tokens.accent}20`,
              padding: '3px 8px',
              borderRadius: 6,
              flexShrink: 0,
            }}
          >
            Terjadwal
          </span>
        </div>

        {/* Row 3: Hari Pencatatan Bulan Ini */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 8,
            background: tokens.bgSecondary,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase' }}>
              Pencatatan Bulan Ini
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: tokens.text, marginTop: 1 }}>
              {combinedDaysCount > 0 ? 'Logbook Berjalan Aktif' : 'Menunggu Input'}
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: tokens.text,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {loading ? '...' : `${combinedDaysCount || 1} / ${totalDaysInMonth} Hari`}
          </span>
        </div>
      </div>

      {/* Footer link */}
      <button
        type="button"
        onClick={() => setPage('b3')}
        style={{
          background: 'none',
          border: 'none',
          color: tokens.primary,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 2,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
      >
        <span>Lihat Neraca & Logbook Regulasi</span>
        <span>→</span>
      </button>
    </div>
  )
}
