import { useEffect, useState } from 'react'
import { useApp } from '../context'
import {
  getDashboardSummary, getDashboardTrends, getDashboardCategoryBreakdown,
  type DashboardSummaryData, type DashboardTrendItem, type CategoryBreakdownItem,
} from '../api'
import { useIsMobile } from '../hooks/useMediaQuery'
import DashboardCategoryCards, { type CategoryCardItem } from './dashboard/DashboardCategoryCards'
import DashboardChartsSection, { type CategoryConfig, type ChartDataItem } from './dashboard/DashboardChartsSection'

interface QuickPreviewProps {
  category: CategoryConfig | null
  onClose: () => void
  onOpenFull: () => void
}

function QuickPreview({ category, onClose, onOpenFull }: QuickPreviewProps) {
  const { tokens, t, theme } = useApp()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  if (!category) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          height: '100%',
          background: isGlass ? tokens.glassBg ?? tokens.card : tokens.card,
          backdropFilter: isGlass ? tokens.glassBlur : undefined,
          WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
          borderLeft: `1px solid ${tokens.cardBorder}`,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          fontFamily: tokens.fontFamily,
          overflowY: 'auto',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.text }}>
            {t('quickPreview', 'Pratinjau Cepat')}: {category.labelKey}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.textMuted, fontSize: 18 }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Berat', value: `${category.stats.total.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg` },
            { label: 'Total Entri', value: String(category.stats.entries) },
            { label: 'Perubahan', value: `${category.stats.change >= 0 ? '+' : ''}${category.stats.change}%` },
            { label: 'Satuan', value: 'kg' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: tokens.bgSecondary, borderRadius: tokens.radius, padding: 12 }}>
              <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text }}>{value}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenFull}
          style={{
            padding: '10px 20px',
            background: tokens.primary,
            color: tokens.textInverse,
            border: 'none',
            borderRadius: tokens.radius,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: tokens.fontFamily,
          }}
        >
          {t('openFullPage', 'Buka Halaman Lengkap')} →
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { tokens, setPage, t, year } = useApp()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null)
  const [trendsData, setTrendsData] = useState<DashboardTrendItem[] | null>(null)
  const [breakdownData, setBreakdownData] = useState<CategoryBreakdownItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const isMobile = useIsMobile()

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setApiError(false)
      const [summaryRes, trendsRes, breakdownRes] = await Promise.allSettled([
        getDashboardSummary(),
        getDashboardTrends(12, year),
        getDashboardCategoryBreakdown(),
      ])

      let hasSuccess = false

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummaryData(summaryRes.value)
        hasSuccess = true
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value) {
        setTrendsData(trendsRes.value)
        hasSuccess = true
      }
      if (breakdownRes.status === 'fulfilled' && breakdownRes.value) {
        setBreakdownData(breakdownRes.value)
        hasSuccess = true
      }

      if (!hasSuccess && (summaryRes.status === 'rejected' || trendsRes.status === 'rejected' || breakdownRes.status === 'rejected')) {
        setApiError(true)
      }
    } catch (error) {
      console.error('Failed to load dashboard summary:', error)
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [year])

  const b3InWeight = Number(summaryData?.b3_in_weight_kg ?? 0)
  const b3OutWeight = Number(summaryData?.b3_out_weight_kg ?? 0)
  const domesticOrganicWeight = Number(summaryData?.domestic_today_organic_kg ?? 0)
  const domesticInorganicWeight = Number(summaryData?.domestic_today_inorganic_kg ?? 0)

  const defaultMonths: ChartDataItem[] = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    .map((name) => ({ name, value: 0 }))

  const monthlyB3In: ChartDataItem[] = trendsData && trendsData.length > 0
    ? trendsData.map((item) => ({ name: item.month_name, value: item.b3_in_weight_kg }))
    : defaultMonths

  const monthlyB3Out: ChartDataItem[] = trendsData && trendsData.length > 0
    ? trendsData.map((item) => ({ name: item.month_name, value: item.b3_out_weight_kg }))
    : defaultMonths

  const monthlyDomOrganic: ChartDataItem[] = trendsData && trendsData.length > 0
    ? trendsData.map((item) => ({ name: item.month_name, value: item.domestic_organic_kg }))
    : defaultMonths

  const monthlyDomInorganic: ChartDataItem[] = trendsData && trendsData.length > 0
    ? trendsData.map((item) => ({ name: item.month_name, value: item.domestic_inorganic_kg }))
    : defaultMonths

  const b3InPieData: ChartDataItem[] = breakdownData && breakdownData.length > 0
    ? breakdownData
        .filter((b) => (b.in_weight_kg !== undefined ? Number(b.in_weight_kg) > 0 : Number(b.total_weight_kg) > 0))
        .map((b) => ({ name: b.category_name, value: Number(b.in_weight_kg !== undefined ? b.in_weight_kg : b.total_weight_kg) }))
    : b3InWeight > 0 ? [{ name: 'Limbah B3 Masuk', value: b3InWeight }] : []

  const b3OutPieData: ChartDataItem[] = breakdownData && breakdownData.length > 0
    ? breakdownData
        .filter((b) => (b.out_weight_kg !== undefined ? Number(b.out_weight_kg) > 0 : Number(b.total_weight_kg) > 0))
        .map((b) => ({ name: b.category_name, value: Number(b.out_weight_kg !== undefined ? b.out_weight_kg : b.total_weight_kg) }))
    : b3OutWeight > 0 ? [{ name: 'Limbah B3 Keluar', value: b3OutWeight }] : []

  const categories: CategoryConfig[] = [
    {
      id: 'b3in',
      labelKey: t('b3InTitle', 'Limbah B3 Masuk'),
      color: tokens.chartB3In,
      barData: monthlyB3In,
      weeklyData: monthlyB3In.slice(-4),
      monthlyData: monthlyB3In,
      pieData: b3InPieData,
      stats: {
        total: b3InWeight,
        change: 0,
        entries: summaryData?.b3_count_in ?? 0,
      },
      unit: 'kg',
    },
    {
      id: 'b3out',
      labelKey: t('b3OutTitle', 'Limbah B3 Keluar'),
      color: tokens.chartB3Out,
      barData: monthlyB3Out,
      weeklyData: monthlyB3Out.slice(-4),
      monthlyData: monthlyB3Out,
      pieData: b3OutPieData,
      stats: {
        total: b3OutWeight,
        change: 0,
        entries: summaryData?.b3_count_out ?? 0,
      },
      unit: 'kg',
    },
    {
      id: 'domMorning',
      labelKey: t('domesticOrganicTitle', 'Limbah Domestik Organik (Pagi)'),
      color: tokens.chartDomMorning,
      barData: monthlyDomOrganic,
      weeklyData: monthlyDomOrganic.slice(-4),
      monthlyData: monthlyDomOrganic,
      pieData: domesticOrganicWeight > 0 ? [{ name: 'Organik', value: domesticOrganicWeight }] : [],
      stats: {
        total: domesticOrganicWeight,
        change: 0,
        entries: summaryData?.domestic_today_organic_kg ? 1 : 0,
      },
      unit: 'kg',
    },
    {
      id: 'domAfternoon',
      labelKey: t('domesticInorganicTitle', 'Limbah Domestik Anorganik (Sore)'),
      color: tokens.chartDomAfternoon,
      barData: monthlyDomInorganic,
      weeklyData: monthlyDomInorganic.slice(-4),
      monthlyData: monthlyDomInorganic,
      pieData: domesticInorganicWeight > 0 ? [{ name: 'Anorganik', value: domesticInorganicWeight }] : [],
      stats: {
        total: domesticInorganicWeight,
        change: 0,
        entries: summaryData?.domestic_today_inorganic_kg ? 1 : 0,
      },
      unit: 'kg',
    },
  ]

  const categoryCardItems: CategoryCardItem[] = [
    { id: 'b3in', label: t('b3In', 'B3 Masuk'), value: b3InWeight, change: 0, color: tokens.chartB3In },
    { id: 'b3out', label: t('b3Out', 'B3 Keluar'), value: b3OutWeight, change: 0, color: tokens.chartB3Out },
    { id: 'domMorning', label: t('domesticOrganic', 'Domestik Organik'), value: domesticOrganicWeight, change: 0, color: tokens.chartDomMorning },
    { id: 'domAfternoon', label: t('domesticInorganic', 'Domestik Anorganik'), value: domesticInorganicWeight, change: 0, color: tokens.chartDomAfternoon },
  ]

  const connectionColor = loading ? '#f59e0b' : apiError ? '#ef4444' : '#22c55e'
  const connectionText = loading
    ? t('connectingDatabase', 'Memuat data...')
    : apiError
      ? 'Gagal terhubung ke API'
      : t('databaseConnected', 'Terhubung ke Database')

  const activePreviewCategory = categories.find((c) => c.id === previewId) ?? null

  return (
    <div style={{ padding: isMobile ? '16px' : '20px 24px', overflowY: 'auto', flex: 1, fontFamily: tokens.fontFamily }}>
      {/* Analytics Page Top Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
          background: tokens.card,
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius,
          padding: '16px 20px',
          boxShadow: tokens.shadow,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setPage('home')}
            style={{
              padding: '6px 12px',
              background: tokens.bgSecondary,
              color: tokens.text,
              border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radius,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>←</span> {t('home', 'Beranda')}
          </button>

          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 800, color: tokens.text }}>
              {t('dashboardAnalytics', 'Dasbor Analitik & Grafik Pemantauan')}
            </h1>
            <span style={{ fontSize: 12, color: tokens.textMuted }}>
              Rekapitulasi visualisasi neraca limbah B3 & Domestik periode tahun {year}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: connectionColor,
              display: 'inline-block',
              boxShadow: `0 0 6px ${connectionColor}`,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: apiError ? '#ef4444' : tokens.textMuted }}>
            {connectionText}
          </span>
        </div>
      </div>

      {/* Error Alert Banner with Retry */}
      {apiError && (
        <div
          style={{
            background: `${tokens.danger}15`,
            border: `1px solid ${tokens.danger}40`,
            borderRadius: tokens.radius,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontFamily: tokens.fontFamily,
          }}
        >
          <div style={{ color: tokens.danger, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <span>⚠️</span>
            <span>Gagal memuat data analitik terbaru dari server. Periksa koneksi API Anda.</span>
          </div>
          <button
            onClick={() => loadDashboard()}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: tokens.radius,
              background: tokens.danger,
              color: '#ffffff',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: tokens.fontFamily,
            }}
          >
            {loading ? 'Memuat...' : 'Coba Lagi'}
          </button>
        </div>
      )}

      {/* Top 4 KPI Summary Cards */}
      <DashboardCategoryCards
        items={categoryCardItems}
        onSelectCategory={setPreviewId}
      />

      {/* Detailed Charts per Category */}
      {categories.map((category) => (
        <DashboardChartsSection
          key={category.id}
          config={category}
          onCardClick={setPreviewId}
        />
      ))}

      {/* Quick Preview Drawer Modal */}
      {previewId && (
        <QuickPreview
          category={activePreviewCategory}
          onClose={() => setPreviewId(null)}
          onOpenFull={() => {
            const destination = previewId.startsWith('b3') ? 'b3' : 'domestic'
            setPreviewId(null)
            setPage(destination)
          }}
        />
      )}
    </div>
  )
}