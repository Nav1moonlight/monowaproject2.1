import { useState } from 'react'
import { useApp, getPeriodDateRange } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'
import { getB3Transactions, getDomesticTransactions } from '../../api'
import { exportToCSV, exportToPrintPDF } from '../../utils/exportUtils'

export default function FeatureLaunchpad() {
  const { tokens, setPage, theme, t, year, periodFilter } = useApp()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const [isExporting, setIsExporting] = useState(false)

  const isGlass = theme === 'frosted' || theme === 'liquid'
  const isNight = theme === 'nightcity'

  const gridColumns = isMobile
    ? '1fr'
    : isTablet
      ? 'repeat(2, 1fr)'
      : 'repeat(4, 1fr)'

  const cardStyle = {
    background: tokens.card,
    border: `1px solid ${tokens.cardBorder}`,
    borderRadius: tokens.radius,
    padding: '16px 18px',
    boxShadow: tokens.shadow,
    backdropFilter: isGlass ? tokens.glassBlur : undefined,
    WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    gap: 14,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minWidth: 0,
  }

  const handleExportAll = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true)
      const periodRange = getPeriodDateRange(year, periodFilter)
      const [b3Res, domRes] = await Promise.all([
        getB3Transactions({ per_page: 500, from: periodRange.from, to: periodRange.to }).catch(() => null),
        getDomesticTransactions({ per_page: 500, from: periodRange.from, to: periodRange.to }).catch(() => null),
      ])

      const b3List = b3Res?.data || []
      const domList = domRes?.data || []

      const headers = ['Kategori', 'ID / Ref', 'Tanggal', 'Jenis Limbah', 'Jumlah/Berat (kg)', 'Status / Sesi', 'Keterangan']
      const rows: (string | number)[][] = []

      b3List.forEach((tx: any) => {
        rows.push([
          tx.transaction_type === 'IN' || tx.category === 'b3in' ? 'B3 Masuk' : 'B3 Keluar',
          tx.id ? `B3-${tx.id}` : '-',
          tx.date || '-',
          tx.waste_name || tx.type || 'Limbah B3',
          Number(tx.weight_kg ?? tx.weightKg ?? 0).toFixed(1),
          tx.status || 'Tercatat',
          tx.source || tx.destination || tx.manifest_number || '-',
        ])
      })

      domList.forEach((tx: any) => {
        const total = (Number(tx.weight_organic_kg ?? 0) + Number(tx.weight_inorganic_kg ?? 0)) || Number(tx.totalKg ?? 0)
        rows.push([
          'Domestik',
          tx.id ? `DOM-${tx.id}` : '-',
          tx.date || '-',
          'Limbah Organik & Anorganik',
          total.toFixed(1),
          tx.session === 'morning' ? 'Pagi' : 'Sore',
          tx.notes || tx.pic_name || '-',
        ])
      })

      const filename = `Rekap_Neraca_Limbah_${year}`
      const title = `Laporan Rekapitulasi Neraca Pengelolaan Limbah Terpadu (${year})`
      const periodLabel = `Periode: ${year} (Seluruh Data)`

      if (format === 'csv') {
        exportToCSV(filename, headers, rows)
      } else {
        exportToPrintPDF(title, periodLabel, headers, rows)
      }
    } catch (e) {
      console.error('Export failed:', e)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div style={{ marginBottom: 24, fontFamily: tokens.fontFamily }}>
      {/* Launchpad Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: tokens.primary, borderRadius: 2 }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: tokens.text, margin: 0, letterSpacing: '-0.2px' }}>
            {t('quickAccessTitle')}
          </h2>
          <span style={{ fontSize: 12, color: tokens.textMuted }}>
            — {t('quickAccessSubtitle')}
          </span>
        </div>
      </div>

      {/* 4 Feature Launch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 14 }}>
        {/* CARD 1: Limbah B3 */}
        <div
          style={{ ...cardStyle, borderTop: `3px solid ${tokens.chartB3In}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = isNight ? `0 8px 24px ${tokens.chartB3In}30` : '0 8px 24px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = tokens.shadow
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${tokens.chartB3In}18`,
                  color: tokens.chartB3In,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: tokens.chartB3In, background: `${tokens.chartB3In}15`, padding: '2px 7px', borderRadius: 4 }}>
                TPS B3 Masuk/Keluar
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
              {t('b3Waste')}
            </div>
            <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.45 }}>
              {t('b3ModuleDesc')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setPage('b3')}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: tokens.primary,
                color: tokens.textInverse,
                border: 'none',
                borderRadius: tokens.radius,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'opacity 0.15s',
              }}
            >
              <span>{t('openB3Monitoring')}</span>
              <span>→</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                onClick={() => setPage('b3-in')}
                style={{
                  padding: '6px 8px',
                  background: `${tokens.chartB3In}15`,
                  color: tokens.chartB3In,
                  border: `1px solid ${tokens.chartB3In}35`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t('inputB3In')}
              </button>
              <button
                type="button"
                onClick={() => setPage('b3-out')}
                style={{
                  padding: '6px 8px',
                  background: `${tokens.chartB3Out}15`,
                  color: tokens.chartB3Out,
                  border: `1px solid ${tokens.chartB3Out}35`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t('inputB3Out')}
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Limbah Domestik */}
        <div
          style={{ ...cardStyle, borderTop: `3px solid ${tokens.chartDomMorning}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = isNight ? `0 8px 24px ${tokens.chartDomMorning}30` : '0 8px 24px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = tokens.shadow
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${tokens.chartDomMorning}18`,
                  color: tokens.chartDomMorning,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: tokens.chartDomMorning, background: `${tokens.chartDomMorning}15`, padding: '2px 7px', borderRadius: 4 }}>
                Organik & Anorganik
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
              {t('domesticWaste')}
            </div>
            <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.45 }}>
              {t('domesticModuleDesc')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setPage('domestic')}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: tokens.primary,
                color: tokens.textInverse,
                border: 'none',
                borderRadius: tokens.radius,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'opacity 0.15s',
              }}
            >
              <span>{t('openDomesticMonitoring')}</span>
              <span>→</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                onClick={() => setPage('waste-in')}
                style={{
                  padding: '6px 8px',
                  background: `${tokens.chartDomMorning}15`,
                  color: tokens.chartDomMorning,
                  border: `1px solid ${tokens.chartDomMorning}35`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t('inputDomIn')}
              </button>
              <button
                type="button"
                onClick={() => setPage('waste-out')}
                style={{
                  padding: '6px 8px',
                  background: `${tokens.chartDomAfternoon}15`,
                  color: tokens.chartDomAfternoon,
                  border: `1px solid ${tokens.chartDomAfternoon}35`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t('inputDomOut')}
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Pusat Pencatatan Cepat */}
        <div
          style={{ ...cardStyle, borderTop: `3px solid ${tokens.accent}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = isNight ? `0 8px 24px ${tokens.accent}30` : '0 8px 24px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = tokens.shadow
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
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
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: tokens.accent, background: `${tokens.accent}15`, padding: '2px 7px', borderRadius: 4 }}>
                4 Form Transaksi
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
              {t('inputDataGroup')}
            </div>
            <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.45 }}>
              {t('quickInputModuleDesc')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setPage('b3-in')}
              style={{
                padding: '8px 6px',
                background: tokens.bgSecondary,
                color: tokens.text,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: tokens.chartB3In }}>●</span> B3 Masuk
            </button>

            <button
              type="button"
              onClick={() => setPage('b3-out')}
              style={{
                padding: '8px 6px',
                background: tokens.bgSecondary,
                color: tokens.text,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: tokens.chartB3Out }}>●</span> B3 Keluar
            </button>

            <button
              type="button"
              onClick={() => setPage('waste-in')}
              style={{
                padding: '8px 6px',
                background: tokens.bgSecondary,
                color: tokens.text,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: tokens.chartDomMorning }}>●</span> Dom Masuk
            </button>

            <button
              type="button"
              onClick={() => setPage('waste-out')}
              style={{
                padding: '8px 6px',
                background: tokens.bgSecondary,
                color: tokens.text,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: tokens.chartDomAfternoon }}>●</span> Dom Keluar
            </button>
          </div>
        </div>

        {/* CARD 4: Laporan & Pengaturan */}
        <div
          style={{ ...cardStyle, borderTop: `3px solid #10b981` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = isNight ? `0 8px 24px #10b98130` : '0 8px 24px rgba(0,0,0,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = tokens.shadow
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `#10b98118`,
                  color: '#10b981',
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
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: `#10b98115`, padding: '2px 7px', borderRadius: 4 }}>
                Audit & Ekspor
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
              Laporan & Ekspor
            </div>
            <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.45 }}>
              {t('exportModuleDesc')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportAll('pdf')}
                style={{
                  padding: '7px 8px',
                  background: tokens.bgSecondary,
                  color: tokens.text,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                📄 Cetak PDF
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportAll('csv')}
                style={{
                  padding: '7px 8px',
                  background: tokens.bgSecondary,
                  color: tokens.text,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radius,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                📊 Ekspor CSV
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPage('settings')}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'transparent',
                color: tokens.textMuted,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                fontSize: 11.5,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>{t('openSettings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
