import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useApp, getPeriodDateRange } from '../context'
import { useToast } from '../context/ToastContext'
import { getB3Transactions, updateB3Transaction, deleteB3Transaction, getDashboardYearlyTrends, type DashboardYearlyTrendItem } from '../api'
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery'
import { useDebounce } from '../hooks/useDebounce'
import EmptyState from './EmptyState'
import SkeletonLoader from './SkeletonLoader'
import B3StorageAlerts from './b3/B3StorageAlerts'
import B3FilterBar from './b3/B3FilterBar'
import B3Table from './b3/B3Table'
import B3WasteSummary from './b3/B3WasteSummary'
import B3EditModal from './b3/B3EditModal'
import B3DeleteModal from './b3/B3DeleteModal'

type TrendPeriod = 'weekly' | 'monthly' | 'yearly'

function mapB3Item(item: any) {
  const rawUrl = item.scale_photo_url || null
  const cleanPhotoUrl = rawUrl && rawUrl.includes('/storage/')
    ? '/storage/' + rawUrl.split('/storage/')[1]
    : rawUrl

  return {
    id: `B3-${item.id}`,
    rawId: item.id,
    date: item.date,
    category: item.transaction_type === 'IN' ? 'b3in' : 'b3out',
    transaction_type: item.transaction_type,
    type: item.waste_name,
    waste_name: item.waste_name,
    wasteCode: item.waste_code,
    waste_code: item.waste_code,
    weightKg: Number(item.weight_kg ?? 0),
    amountKg: Number(item.weight_kg ?? 0),
    status: (item.status || 'pending').toLowerCase(),
    source: item.source || '-',
    destination: item.destination || '-',
    transporter: item.transporter || '-',
    manifest: item.manifest_number || '-',
    scalePhotoUrl: cleanPhotoUrl,
    notes: item.notes || '',
    storage_deadline_at: item.storage_deadline_at,
    created_by: item.created_by,
    updated_by: item.updated_by,
    creator: item.creator || null,
    updater: item.updater || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}

export default function B3Page() {
  const { tokens, t, theme, search, setSearch, year, periodFilter } = useApp()
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions'>('summary')
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('monthly')
  const [filterCat, setFilterCat] = useState<'all' | 'b3in' | 'b3out'>('all')
  const [filterStatus, setFilterStatus] = useState<import('./b3/B3FilterBar').B3FilterStatus>('all')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [tableList, setTableList] = useState<any[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const [yearlyData, setYearlyData] = useState<DashboardYearlyTrendItem[]>([])
  const [apiData, setApiData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<any | null>(null)
  const [deletingTx, setDeletingTx] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    weight_kg: '',
    status: 'PENDING',
    source: '',
    destination: '',
    manifest_number: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState(false)

  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const PAGE_SIZE = 10
  const { toast } = useToast()
  const debouncedSearch = useDebounce(search, 350)

  // Fetch yearly trends when yearly trend period is selected
  useEffect(() => {
    if (trendPeriod === 'yearly') {
      getDashboardYearlyTrends(5)
        .then((data) => setYearlyData(data))
        .catch((err) => console.error('Failed to load yearly trends:', err))
    }
  }, [trendPeriod])

  const recentActivities = useMemo(() => {
    if (apiData && apiData.length > 0) {
      return apiData.slice(0, 5).map((tx) => {
        const isIn = tx.category === 'b3in'
        const type = isIn ? 'b3in' : 'b3out'
        const title = isIn ? 'Transaksi B3 Masuk' : 'Transaksi B3 Keluar'
        const message = `Pencatatan ${tx.type || 'Limbah B3'} (${tx.weightKg} kg)`
        const timestamp = tx.date || new Date().toISOString()
        return { id: tx.id, type, title, message, timestamp }
      })
    }
    return []
  }, [apiData])

  const computedStorageAlerts = useMemo(() => {
    if (!apiData || apiData.length === 0) return []
    const now = new Date()
    return apiData
      .filter((tx) => (tx.category === 'b3in' || tx.transaction_type === 'IN') && tx.storage_deadline_at)
      .map((tx) => {
        const deadline = new Date(tx.storage_deadline_at)
        const diffTime = deadline.getTime() - now.getTime()
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const urgency: 'exceeded' | 'warning' | 'ok' =
          daysRemaining < 0 ? 'exceeded' : daysRemaining <= 30 ? 'warning' : 'ok'
        return {
          ...tx,
          storageDeadlineDays: daysRemaining,
          urgency,
          daysRemaining,
        }
      })
      .filter((item) => item.urgency !== 'ok')
      .slice(0, 6)
  }, [apiData])

  // Summary data fetch for charts and overview
  const fetchSummaryData = () => {
    setLoading(true)
    setApiError(false)
    const periodRange = getPeriodDateRange(year, periodFilter)
    getB3Transactions({
      page: 1,
      per_page: 100,
      search: debouncedSearch || undefined,
      from: filterFrom || periodRange.from,
      to: filterTo || periodRange.to,
    })
      .then((res) => {
        if (res?.data) {
          const mapped = res.data.map(mapB3Item)
          setApiData(mapped)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load B3 transactions:', err)
        setApiError(true)
        setLoading(false)
      })
  }

  // Server-side paginated data fetch for raw transaction table
  const fetchTableData = () => {
    setTableLoading(true)
    const periodRange = getPeriodDateRange(year, periodFilter)
    getB3Transactions({
      page,
      per_page: PAGE_SIZE,
      type: filterCat === 'all' ? undefined : (filterCat === 'b3in' ? 'IN' : 'OUT'),
      status: filterStatus === 'all' ? undefined : (filterStatus.toUpperCase() as any),
      search: debouncedSearch || undefined,
      from: filterFrom || periodRange.from,
      to: filterTo || periodRange.to,
    })
      .then((res) => {
        if (res?.data) {
          const mapped = res.data.map(mapB3Item)
          setTableList(mapped)
          const total = res.meta?.total ?? res.total ?? mapped.length
          const lastPage = res.meta?.last_page ?? res.last_page ?? Math.max(1, Math.ceil(total / PAGE_SIZE))
          setTotalPages(lastPage)
          setTotalRecords(total)
        }
        setTableLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load paginated B3 transactions:', err)
        setTableLoading(false)
      })
  }

  useEffect(() => {
    fetchSummaryData()
  }, [filterFrom, filterTo, debouncedSearch, year, periodFilter])

  useEffect(() => {
    fetchTableData()
  }, [page, filterCat, filterStatus, filterFrom, filterTo, debouncedSearch, year, periodFilter])

  const handleOpenEdit = (tx: any) => {
    setEditingTx(tx)
    setEditForm({
      weight_kg: String(tx.amountKg ?? tx.weightKg ?? ''),
      status: String(tx.status).toUpperCase(),
      source: tx.source === '-' ? '' : tx.source,
      destination: tx.destination === '-' ? '' : tx.destination,
      manifest_number: tx.manifest === '-' ? '' : tx.manifest,
      notes: tx.notes || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTx) return
    try {
      setSaving(true)
      await updateB3Transaction(editingTx.rawId, {
        weight_kg: Number(editForm.weight_kg),
        status: editForm.status,
        source: editForm.source || null,
        destination: editForm.destination || null,
        manifest_number: editForm.manifest_number || null,
        notes: editForm.notes || null,
      })
      setEditingTx(null)
      toast.success('Data transaksi B3 berhasil diperbarui')
      fetchSummaryData()
      fetchTableData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah transaksi')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTx) return
    try {
      setSaving(true)
      await deleteB3Transaction(deletingTx.rawId)
      setDeletingTx(null)
      toast.success('Data transaksi B3 berhasil dihapus')
      fetchSummaryData()
      fetchTableData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus transaksi')
    } finally {
      setSaving(false)
    }
  }

  const transactionsList = apiData ?? []
  const isGlass = theme === 'frosted' || theme === 'liquid'

  // Transactions within the active period/search (complete IN & OUT for charts & summary)
  const periodTransactions = useMemo(() => {
    const periodRange = getPeriodDateRange(year, periodFilter)
    return transactionsList.filter((tx) => {
      if (filterFrom ? tx.date < filterFrom : tx.date < periodRange.from) return false
      if (filterTo ? tx.date > filterTo : tx.date > periodRange.to) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          String(tx.id).toLowerCase().includes(s) ||
          String(tx.type || tx.waste_name || '').toLowerCase().includes(s) ||
          String(tx.source || '').toLowerCase().includes(s) ||
          String(tx.destination || '').toLowerCase().includes(s) ||
          String(tx.manifest || '').toLowerCase().includes(s) ||
          String(tx.wasteCode || tx.waste_code || '').toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [transactionsList, filterFrom, filterTo, search, year, periodFilter])

  const trendData = useMemo(() => {
    if (trendPeriod === 'yearly' && yearlyData.length > 0) {
      return yearlyData.map((y) => ({
        name: y.year || y.name,
        b3in: Number(Number(y.b3in ?? y.b3_in_weight_kg ?? 0).toFixed(1)),
        b3out: Number(Number(y.b3out ?? y.b3_out_weight_kg ?? 0).toFixed(1)),
      }))
    }

    const monthMap: Record<string, { b3in: number; b3out: number }> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    monthNames.forEach((m) => { monthMap[m] = { b3in: 0, b3out: 0 } })

    periodTransactions.forEach((tx) => {
      if (!tx.date) return
      const monthIdx = new Date(tx.date).getMonth()
      const monthName = monthNames[monthIdx] || 'Jan'
      const weight = Number(tx.amountKg ?? tx.weightKg ?? 0)
      if (tx.category === 'b3in' || tx.transaction_type === 'IN') {
        monthMap[monthName].b3in += weight
      } else {
        monthMap[monthName].b3out += weight
      }
    })

    return monthNames.map((m) => ({
      name: m,
      b3in: Number(monthMap[m].b3in.toFixed(1)),
      b3out: Number(monthMap[m].b3out.toFixed(1)),
    }))
  }, [periodTransactions, trendPeriod, yearlyData])

  const dynamicPieIn = useMemo(() => {
    const catMap: Record<string, number> = {}
    periodTransactions.filter((tx) => tx.category === 'b3in' || tx.transaction_type === 'IN').forEach((tx) => {
      const name = tx.type || tx.waste_name || 'Limbah B3'
      catMap[name] = (catMap[name] || 0) + Number(tx.amountKg ?? tx.weightKg ?? 0)
    })
    const entries = Object.entries(catMap).map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
    if (entries.length > 0) return entries
    return [{ name: 'Belum ada data', value: 0 }]
  }, [periodTransactions])

  const dynamicPieOut = useMemo(() => {
    const destMap: Record<string, number> = {}
    periodTransactions.filter((tx) => tx.category === 'b3out' || tx.transaction_type === 'OUT').forEach((tx) => {
      const name = tx.destination || 'Pihak Ke-3'
      destMap[name] = (destMap[name] || 0) + Number(tx.amountKg ?? tx.weightKg ?? 0)
    })
    const entries = Object.entries(destMap).map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
    if (entries.length > 0) return entries
    return [{ name: 'Belum ada data', value: 0 }]
  }, [periodTransactions])

  const tooltipStyle = {
    contentStyle: {
      background: tokens.tooltipBg, border: `1px solid ${tokens.border}`,
      borderRadius: '6px', color: tokens.tooltipText, fontSize: 12, fontFamily: tokens.fontFamily,
    },
    itemStyle: { color: tokens.tooltipText },
    labelStyle: { color: tokens.tooltipText, fontWeight: 600 },
  }

  const cardStyle = {
    background: tokens.card,
    border: `1px solid ${tokens.cardBorder}`,
    borderRadius: tokens.radius,
    padding: '16px 18px',
    boxShadow: tokens.shadow,
    backdropFilter: isGlass ? tokens.glassBlur : undefined,
    WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
    fontFamily: tokens.fontFamily,
    minWidth: 0,
  }

  const chartColumns = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 220px 1fr'

  return (
    <div style={{ padding: isMobile ? '16px' : '20px 24px', overflowY: 'auto', flex: 1, fontFamily: tokens.fontFamily }}>

      {/* Storage alerts */}
      <B3StorageAlerts alerts={computedStorageAlerts} />

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
            <span>Gagal memuat transaksi limbah B3 dari server. Periksa koneksi API Anda.</span>
          </div>
          <button
            onClick={() => fetchSummaryData()}
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

      {/* Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: chartColumns, gap: 16, marginBottom: 20 }}>
        {/* Main Bar Chart */}
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>
            {t('b3MonthlyTrend')}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(val) => [`${Number(val).toLocaleString('id-ID')} kg`, '']} />
              <Bar dataKey="b3in" fill={tokens.chartB3In} radius={[3, 3, 0, 0]} name="B3 Masuk (kg)" />
              <Bar dataKey="b3out" fill={tokens.chartB3Out} radius={[3, 3, 0, 0]} name="B3 Keluar (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Komposisi B3 Masuk
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={dynamicPieIn} cx="50%" cy="50%" outerRadius={34} dataKey="value" paddingAngle={2}>
                  {dynamicPieIn.map((_, i) => (
                    <Cell key={i} fill={[tokens.chartB3In, tokens.chartB3Out, tokens.accent, tokens.warning, tokens.success, '#a78bfa'][i % 6]!} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} kg`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tujuan B3 Keluar
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={dynamicPieOut} cx="50%" cy="50%" outerRadius={34} dataKey="value" paddingAngle={2}>
                  {dynamicPieOut.map((_, i) => (
                    <Cell key={i} fill={[tokens.chartB3Out, tokens.accent, tokens.chartDomMorning, tokens.warning, '#a78bfa'][i % 5]!} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} kg`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tren</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['weekly', 'monthly', 'yearly'] as TrendPeriod[]).map((p) => (
                <button key={p} onClick={() => setTrendPeriod(p)} style={{
                  padding: '2px 7px', borderRadius: 3, border: `1px solid ${tokens.border}`,
                  background: trendPeriod === p ? tokens.primary : 'transparent',
                  color: trendPeriod === p ? tokens.textInverse : tokens.textMuted,
                  fontSize: 10, cursor: 'pointer', fontFamily: tokens.fontFamily,
                }}>
                  {p === 'weekly' ? 'Minggu' : p === 'monthly' ? 'Bulan' : 'Tahun'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(val) => [`${Number(val).toLocaleString('id-ID')} kg`, '']} />
              <Line type="monotone" dataKey="b3in" stroke={tokens.chartB3In} strokeWidth={2} dot={false} name="B3 Masuk" />
              <Line type="monotone" dataKey="b3out" stroke={tokens.chartB3Out} strokeWidth={2} dot={false} name="B3 Keluar" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table / Summary Section */}
      <div style={cardStyle}>
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: `1px solid ${tokens.border}`,
            paddingBottom: 12,
          }}
        >
          {/* Left: Tab Switcher */}
          <div style={{ display: 'flex', gap: 6, background: tokens.bgSecondary, padding: 3, borderRadius: '8px', border: `1px solid ${tokens.border}` }}>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'summary' ? tokens.primary : 'transparent',
                color: activeTab === 'summary' ? tokens.textInverse : tokens.textMuted,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: tokens.fontFamily,
                transition: 'all 0.15s ease',
              }}
            >
              <span>📋</span> Ringkasan per Jenis (Neraca)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'transactions' ? tokens.primary : 'transparent',
                color: activeTab === 'transactions' ? tokens.textInverse : tokens.textMuted,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: tokens.fontFamily,
                transition: 'all 0.15s ease',
              }}
            >
              <span>📄</span> Riwayat Semua Log ({totalRecords})
            </button>
          </div>

          {/* Right: Only show transaction filter bar when in transactions tab */}
          {activeTab === 'transactions' && (
            <B3FilterBar
              filterCat={filterCat}
              setFilterCat={(val) => { setFilterCat(val); setPage(1) }}
              filterStatus={filterStatus}
              setFilterStatus={(val) => { setFilterStatus(val); setPage(1) }}
              filterFrom={filterFrom}
              setFilterFrom={(val) => { setFilterFrom(val); setPage(1) }}
              filterTo={filterTo}
              setFilterTo={(val) => { setFilterTo(val); setPage(1) }}
              onReset={() => { setSearch(''); setFilterCat('all'); setFilterStatus('all'); setFilterFrom(''); setFilterTo(''); setPage(1) }}
            />
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' ? (
          loading && !apiData ? (
            <SkeletonLoader rows={6} />
          ) : (
            <B3WasteSummary
              transactions={periodTransactions}
              searchQuery={search}
            />
          )
        ) : tableLoading ? (
          <SkeletonLoader rows={6} />
        ) : tableList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Transaksi B3"
            message={search ? `Tidak ada data transaksi B3 yang cocok dengan kata kunci "${search}".` : 'Belum ada transaksi Limbah B3 yang tersimpan untuk filter saat ini.'}
            icon={search ? 'search' : 'empty'}
          />
        ) : (
          <B3Table
            paginated={tableList}
            filteredCount={totalRecords}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            onEdit={handleOpenEdit}
            onDelete={(tx) => setDeletingTx(tx)}
            onPreviewImage={(url) => setPreviewImage(url)}
          />
        )}
      </div>

      {/* Recent Activity */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 14 }}>{t('recentActivity')}</div>
        {recentActivities.map((n) => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${tokens.border}` }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: n.type === 'alert' ? `${tokens.danger}20` : n.type === 'b3in' ? `${tokens.chartB3In}20` : `${tokens.chartB3Out}20`,
              color: n.type === 'alert' ? tokens.danger : n.type === 'b3in' ? tokens.chartB3In : tokens.chartB3Out,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              {n.type === 'alert' ? '⚠' : n.type === 'b3in' ? '↓' : '↑'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{n.title}</div>
              <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>
                {(() => {
                  try {
                    const d = new Date(n.timestamp)
                    if (isNaN(d.getTime())) return n.timestamp
                    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  } catch {
                    return n.timestamp
                  }
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative', background: tokens.card, border: `1px solid ${tokens.cardBorder}`,
              borderRadius: tokens.radius, padding: 18, maxWidth: '90vw', maxHeight: '90vh',
              boxShadow: tokens.shadow, display: 'flex', flexDirection: 'column', gap: 12,
              fontFamily: tokens.fontFamily,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tokens.border}`, paddingBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📷</span>
                <span>Foto Bukti Timbangan</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: tokens.textMuted, padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 260, minHeight: 200, background: tokens.bgSecondary, borderRadius: tokens.radius, overflow: 'hidden' }}>
              <img
                src={previewImage}
                alt="Foto Timbangan Presisi"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.innerHTML = '<div style="padding: 24px; text-align: center; color: #ef4444; font-size: 13px; font-weight: 600;">⚠️ Gambar tidak dapat dimuat atau file tidak ditemukan di server.</div>'
                  }
                }}
                style={{ maxWidth: '100%', maxHeight: '72vh', borderRadius: tokens.radius, objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => window.open(previewImage, '_blank')}
                style={{
                  padding: '6px 14px', background: tokens.inputBg, border: `1px solid ${tokens.border}`,
                  color: tokens.text, borderRadius: tokens.radius, cursor: 'pointer', fontSize: 12,
                  fontWeight: 600, fontFamily: tokens.fontFamily,
                }}
              >
                Buka Tab Baru ↗
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{
                  padding: '6px 16px', background: tokens.primary, color: tokens.textInverse,
                  border: 'none', borderRadius: tokens.radius, cursor: 'pointer', fontSize: 12,
                  fontWeight: 600, fontFamily: tokens.fontFamily,
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <B3EditModal
        editingTx={editingTx}
        editForm={editForm}
        setEditForm={setEditForm}
        onClose={() => setEditingTx(null)}
        onSave={handleSaveEdit}
        saving={saving}
      />

      {/* Delete Confirmation Modal */}
      <B3DeleteModal
        deletingTx={deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleConfirmDelete}
        saving={saving}
      />
    </div>
  )
}