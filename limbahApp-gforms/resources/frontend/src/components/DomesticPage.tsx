import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useApp, getPeriodDateRange } from '../context'
import { useToast } from '../context/ToastContext'
import { getDomesticTransactions, updateDomesticTransaction, deleteDomesticTransaction, getDashboardYearlyTrends, type DashboardYearlyTrendItem } from '../api'
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery'
import { useDebounce } from '../hooks/useDebounce'
import EmptyState from './EmptyState'
import SkeletonLoader from './SkeletonLoader'
import DomesticFilterBar from './domestic/DomesticFilterBar'
import DomesticTable from './domestic/DomesticTable'
import DomesticWasteSummary from './domestic/DomesticWasteSummary'
import DomesticEditModal from './domestic/DomesticEditModal'
import DomesticDeleteModal from './domestic/DomesticDeleteModal'

type TrendPeriod = 'weekly' | 'monthly' | 'yearly'

function mapDomesticItem(item: any) {
  return {
    id: `DOM-${item.id}`,
    rawId: item.id,
    date: item.date,
    movementType: item.movement_type || 'IN',
    session: item.session === 'MORNING' ? 'morning' : 'afternoon',
    organicKg: Number(item.organic_weight_kg ?? 0),
    inorganicKg: Number(item.inorganic_weight_kg ?? 0),
    totalKg: Number(item.total_weight_kg ?? 0),
    domestic_residue_kg: item.domestic_residue_kg,
    status: (item.status || 'SUBMITTED').toLowerCase(),
    picName: item.pic_name || 'Petugas',
    pic_name: item.pic_name || 'Petugas',
    pic_phone: item.pic_phone,
    notes: item.notes || '',
    created_by: item.created_by,
    updated_by: item.updated_by,
    creator: item.creator || null,
    updater: item.updater || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}

export default function DomesticPage() {
  const { tokens, t, theme, search, setSearch, year, periodFilter } = useApp()
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions'>('summary')
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('monthly')
  const [filterMovement, setFilterMovement] = useState<'all' | 'IN' | 'OUT'>('all')
  const [filterSession, setFilterSession] = useState<'all' | 'morning' | 'afternoon'>('all')
  const [filterStatus, setFilterStatus] = useState<import('./domestic/DomesticFilterBar').DomesticFilterStatus>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [tableList, setTableList] = useState<any[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const [yearlyData, setYearlyData] = useState<DashboardYearlyTrendItem[]>([])
  const [apiData, setApiData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTx, setEditingTx] = useState<any | null>(null)
  const [deletingTx, setDeletingTx] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    domestic_residue_kg: '',
    status: 'SUBMITTED',
    pic_name: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const PAGE_SIZE = 10
  const [apiError, setApiError] = useState(false)
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
        const isMorning = tx.session === 'MORNING' || tx.session === 'morning'
        const title = isMorning ? 'Sesi Pagi Selesai' : 'Sesi Sore Selesai'
        const message = `Pencatatan total ${Number(tx.totalKg ?? tx.total_weight_kg ?? 0).toFixed(1)} kg (${Number(tx.organicKg ?? tx.organic_weight_kg ?? 0).toFixed(1)} kg organik)`
        const timestamp = tx.date || new Date().toISOString()
        return { id: tx.id, type: 'domestic', title, message, timestamp }
      })
    }
    return []
  }, [apiData])

  // Summary data fetch for charts and overview
  const fetchSummaryData = () => {
    setLoading(true)
    setApiError(false)
    const periodRange = getPeriodDateRange(year, periodFilter)
    getDomesticTransactions({
      page: 1,
      per_page: 100,
      search: debouncedSearch || undefined,
      from: periodRange.from,
      to: periodRange.to,
    })
      .then((res) => {
        if (res?.data) {
          const mapped = res.data.map(mapDomesticItem)
          setApiData(mapped)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load Domestic summary transactions:', err)
        setApiError(true)
        setLoading(false)
      })
  }

  // Server-side paginated data fetch for raw transaction table
  const fetchTableData = () => {
    setTableLoading(true)
    const periodRange = getPeriodDateRange(year, periodFilter)
    getDomesticTransactions({
      page,
      per_page: PAGE_SIZE,
      movement_type: filterMovement === 'all' ? undefined : filterMovement,
      session: filterSession === 'all' ? undefined : (filterSession.toUpperCase() as 'MORNING' | 'AFTERNOON'),
      status: filterStatus === 'all' ? undefined : (filterStatus.toUpperCase() as any),
      search: debouncedSearch || undefined,
      from: periodRange.from,
      to: periodRange.to,
    })
      .then((res) => {
        if (res?.data) {
          const mapped = res.data.map(mapDomesticItem)
          setTableList(mapped)
          const total = res.meta?.total ?? res.total ?? mapped.length
          const lastPage = res.meta?.last_page ?? res.last_page ?? Math.max(1, Math.ceil(total / PAGE_SIZE))
          setTotalPages(lastPage)
          setTotalRecords(total)
        }
        setTableLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load paginated Domestic transactions:', err)
        setTableLoading(false)
      })
  }

  useEffect(() => {
    fetchSummaryData()
  }, [debouncedSearch, year, periodFilter])

  useEffect(() => {
    fetchTableData()
  }, [page, filterMovement, filterSession, filterStatus, debouncedSearch, year, periodFilter])

  const handleOpenEdit = (tx: any) => {
    setEditingTx(tx)
    setEditForm({
      domestic_residue_kg: String(tx.domestic_residue_kg ?? tx.organicKg ?? tx.organic_weight_kg ?? ''),
      status: String(tx.status).toUpperCase(),
      pic_name: tx.picName || tx.pic_name || '',
      notes: tx.notes || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTx) return
    try {
      setSaving(true)
      await updateDomesticTransaction(editingTx.rawId, {
        status: editForm.status,
        pic_name: editForm.pic_name,
        notes: editForm.notes || null,
      })
      setEditingTx(null)
      toast.success('Data transaksi domestik berhasil diperbarui')
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
      await deleteDomesticTransaction(deletingTx.rawId)
      setDeletingTx(null)
      toast.success('Data transaksi domestik berhasil dihapus')
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

  const periodTransactions = useMemo(() => {
    const periodRange = getPeriodDateRange(year, periodFilter)
    return transactionsList.filter((tx) => {
      if (tx.date < periodRange.from || tx.date > periodRange.to) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          String(tx.id).toLowerCase().includes(s) ||
          String(tx.picName || tx.pic_name || '').toLowerCase().includes(s) ||
          String(tx.notes || '').toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [transactionsList, search, year, periodFilter])

  const trendData = useMemo(() => {
    if (trendPeriod === 'yearly' && yearlyData.length > 0) {
      return yearlyData.map((y) => ({
        name: y.year || y.name,
        morning: Number(Number(y.morning ?? 0).toFixed(1)),
        afternoon: Number(Number(y.afternoon ?? 0).toFixed(1)),
      }))
    }

    const monthMap: Record<string, { morning: number; afternoon: number }> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    monthNames.forEach((m) => { monthMap[m] = { morning: 0, afternoon: 0 } })

    periodTransactions.forEach((tx) => {
      if (!tx.date) return
      const monthIdx = new Date(tx.date).getMonth()
      const monthName = monthNames[monthIdx] || 'Jan'
      const weight = Number(tx.totalKg ?? tx.total_weight_kg ?? 0)
      if (tx.session === 'morning' || tx.session === 'MORNING') {
        monthMap[monthName].morning += weight
      } else {
        monthMap[monthName].afternoon += weight
      }
    })

    return monthNames.map((m) => ({
      name: m,
      morning: Number(monthMap[m].morning.toFixed(1)),
      afternoon: Number(monthMap[m].afternoon.toFixed(1)),
    }))
  }, [periodTransactions, trendPeriod, yearlyData])

  const ratioPieData = useMemo(() => {
    let organic = 0
    let inorganic = 0
    periodTransactions.forEach((tx) => {
      organic += Number(tx.organicKg ?? tx.organic_weight_kg ?? 0)
      inorganic += Number(tx.inorganicKg ?? tx.inorganic_weight_kg ?? 0)
    })
    if (organic === 0 && inorganic === 0) {
      return [{ name: 'Belum ada data', value: 0 }]
    }
    return [
      { name: 'Organik', value: Number(organic.toFixed(1)) },
      { name: 'Anorganik', value: Number(inorganic.toFixed(1)) },
    ]
  }, [periodTransactions])

  const sessionPieData = useMemo(() => {
    let morning = 0
    let afternoon = 0
    periodTransactions.forEach((tx) => {
      const weight = Number(tx.totalKg ?? tx.total_weight_kg ?? 0)
      if (tx.session === 'morning' || tx.session === 'MORNING') {
        morning += weight
      } else {
        afternoon += weight
      }
    })
    if (morning === 0 && afternoon === 0) {
      return [{ name: 'Belum ada data', value: 0 }]
    }
    return [
      { name: 'Pagi', value: Number(morning.toFixed(1)) },
      { name: 'Sore', value: Number(afternoon.toFixed(1)) },
    ]
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
            <span>Gagal memuat transaksi limbah domestik dari server. Periksa koneksi API Anda.</span>
          </div>
          <button
            onClick={() => { fetchSummaryData(); fetchTableData(); }}
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
            {t('domesticMonthlyTrend')}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(val) => [`${Number(val).toLocaleString('id-ID')} kg`, '']} />
              <Bar dataKey="morning" fill={tokens.chartDomMorning} radius={[3, 3, 0, 0]} name="Sesi Pagi (kg)" />
              <Bar dataKey="afternoon" fill={tokens.chartDomAfternoon} radius={[3, 3, 0, 0]} name="Sesi Sore (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rasio Organik / Anorganik
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={ratioPieData} cx="50%" cy="50%" outerRadius={34} dataKey="value" paddingAngle={2}>
                  {ratioPieData.map((_, i) => (
                    <Cell key={i} fill={[tokens.chartDomMorning, tokens.chartDomAfternoon][i % 2]!} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} kg`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Distribusi per Sesi
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={sessionPieData} cx="50%" cy="50%" outerRadius={34} dataKey="value" paddingAngle={2}>
                  {sessionPieData.map((_, i) => (
                    <Cell key={i} fill={[tokens.chartDomMorning, tokens.chartDomAfternoon][i % 2]!} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} kg`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line */}
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
              <Line type="monotone" dataKey="morning" stroke={tokens.chartDomMorning} strokeWidth={2} dot={false} name="Pagi" />
              <Line type="monotone" dataKey="afternoon" stroke={tokens.chartDomAfternoon} strokeWidth={2} dot={false} name="Sore" />
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
              <span>📋</span> Ringkasan per Kategori (Neraca)
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

          {/* Right: Filter Bar only when in transactions tab */}
          {activeTab === 'transactions' && (
            <DomesticFilterBar
              filterMovement={filterMovement}
              setFilterMovement={(val) => { setFilterMovement(val); setPage(1) }}
              filterSession={filterSession}
              setFilterSession={(val) => { setFilterSession(val); setPage(1) }}
              filterStatus={filterStatus}
              setFilterStatus={(val) => { setFilterStatus(val); setPage(1) }}
              onReset={() => { setSearch(''); setFilterMovement('all'); setFilterSession('all'); setFilterStatus('all'); setPage(1) }}
            />
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' ? (
          loading && !apiData ? (
            <SkeletonLoader rows={6} />
          ) : (
            <DomesticWasteSummary
              transactions={periodTransactions}
            />
          )
        ) : tableLoading ? (
          <SkeletonLoader rows={6} />
        ) : tableList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Transaksi Domestik"
            message={search ? `Tidak ada data transaksi Domestik yang cocok dengan kata kunci "${search}".` : 'Belum ada transaksi Limbah Domestik yang tersimpan untuk filter saat ini.'}
            icon={search ? 'search' : 'empty'}
          />
        ) : (
          <DomesticTable
            paginated={tableList}
            filteredCount={totalRecords}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            onEdit={handleOpenEdit}
            onDelete={(tx) => setDeletingTx(tx)}
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
              background: `${tokens.chartDomMorning}20`,
              color: tokens.chartDomMorning,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              🏠
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

      {/* Edit Modal */}
      <DomesticEditModal
        editingTx={editingTx}
        editForm={editForm}
        setEditForm={setEditForm}
        onClose={() => setEditingTx(null)}
        onSave={handleSaveEdit}
        saving={saving}
      />

      {/* Delete Confirmation Modal */}
      <DomesticDeleteModal
        deletingTx={deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleConfirmDelete}
        saving={saving}
      />
    </div>
  )
}