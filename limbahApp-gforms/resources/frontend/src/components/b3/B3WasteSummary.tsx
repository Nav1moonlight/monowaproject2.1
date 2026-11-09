import { useState, useMemo } from 'react'
import { useApp } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'
import WasteTypeDetailModal, { WasteSummaryItem } from './WasteTypeDetailModal'
import B3SummaryTableView from './B3SummaryTableView'
import B3SummaryCardsView from './B3SummaryCardsView'

interface B3WasteSummaryProps {
  transactions: any[]
  searchQuery?: string
}

export default function B3WasteSummary({ transactions, searchQuery = '' }: B3WasteSummaryProps) {
  const { tokens } = useApp()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [localSearch, setLocalSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_balance' | 'critical' | 'empty'>('all')
  const [selectedWaste, setSelectedWaste] = useState<WasteSummaryItem | null>(null)

  // Code mapping helper for standard waste names if code is missing
  const getStandardCode = (name: string, fallbackCode?: string): string => {
    if (fallbackCode && fallbackCode !== '-' && fallbackCode.trim() !== '') return fallbackCode
    const lower = name.toLowerCase()
    if (lower.includes('terkontaminasi')) return 'A108d'
    if (lower.includes('oil treatment') || lower.includes('sludge oil')) return 'A331-2'
    if (lower.includes('toner')) return 'B353-1'
    if (lower.includes('ipal')) return 'B337-2'
    if (lower.includes('asbes')) return 'B102d'
    if (lower.includes('kadaluwarsa') || lower.includes('kedaluwarsa') || (lower.includes('kimia') && !lower.includes('lab'))) return 'A337-3'
    if (lower.includes('lampu') || lower.includes('tl') || lower.includes('elektronik') || lower.includes('crt') || lower.includes('pcb') || lower.includes('kawat')) return 'B107d'
    if (lower.includes('majun') || lower.includes('kain') || lower.includes('rags')) return 'B110d'
    if (lower.includes('filter') || lower.includes('pencemaran udara')) return 'B109d'
    if (lower.includes('oli') || lower.includes('pelumas') || lower.includes('hidrolik') || lower.includes('gear')) return 'B105d'
    if (lower.includes('kemasan') || lower.includes('drum') || lower.includes('wadah')) return 'B104d'
    if (lower.includes('aki') || lower.includes('baterai') || lower.includes('battery')) return 'A102d'
    if (lower.includes('sludge') || lower.includes('lumpur')) return 'B337-2'
    if (lower.includes('debu')) return 'B102d'
    return 'B3-GEN'
  }

  // Aggregate raw transactions into Summary per Waste Type
  const summaryList: WasteSummaryItem[] = useMemo(() => {
    const map: Record<string, {
      wasteName: string
      wasteCode: string
      totalInKg: number
      totalOutKg: number
      capacityKg: number
      oldestInDate: string | null
      maxStorageDays: number
      txCount: number
      latestTxDate: string | null
      sourcesMap: Record<string, { count: number; totalKg: number }>
      destinationsMap: Record<string, { count: number; totalKg: number }>
      transactions: any[]
    }> = {}

    const now = new Date()

    transactions.forEach((tx) => {
      const name = (tx.type || tx.waste_name || 'Limbah B3 Tidak Teridentifikasi').trim()
      const code = getStandardCode(name, tx.wasteCode || tx.waste_code)
      const weight = Number(tx.weightKg ?? tx.amountKg ?? tx.weight_kg ?? 0)
      const isIn = tx.category === 'b3in' || tx.transaction_type === 'IN'
      const txDate = tx.date || null

      if (!map[name]) {
        map[name] = {
          wasteName: name,
          wasteCode: code,
          totalInKg: 0,
          totalOutKg: 0,
          capacityKg: Number(tx.storageCapacityKg ?? 2500),
          oldestInDate: null,
          maxStorageDays: 90, // Regulasi PP 22/2021 default 90 hari untuk kat 1/2
          txCount: 0,
          latestTxDate: null,
          sourcesMap: {},
          destinationsMap: {},
          transactions: [],
        }
      }

      const item = map[name]
      item.txCount += 1
      item.transactions.push(tx)

      if (isIn) {
        item.totalInKg += weight
        if (txDate) {
          if (!item.oldestInDate || txDate < item.oldestInDate) {
            item.oldestInDate = txDate
          }
        }
        if (tx.source && tx.source !== '-') {
          if (!item.sourcesMap[tx.source]) item.sourcesMap[tx.source] = { count: 0, totalKg: 0 }
          item.sourcesMap[tx.source].count += 1
          item.sourcesMap[tx.source].totalKg += weight
        }
      } else {
        item.totalOutKg += weight
        if (tx.destination && tx.destination !== '-') {
          if (!item.destinationsMap[tx.destination]) item.destinationsMap[tx.destination] = { count: 0, totalKg: 0 }
          item.destinationsMap[tx.destination].count += 1
          item.destinationsMap[tx.destination].totalKg += weight
        }
      }

      if (txDate) {
        if (!item.latestTxDate || txDate > item.latestTxDate) {
          item.latestTxDate = txDate
        }
      }
    })

    return Object.values(map).map((entry) => {
      const balanceKg = Math.max(0, Number((entry.totalInKg - entry.totalOutKg).toFixed(1)))
      
      let daysInStorage = 0
      if (balanceKg > 0 && entry.oldestInDate) {
        try {
          const oldest = new Date(entry.oldestInDate)
          if (!isNaN(oldest.getTime())) {
            const diffTime = Math.abs(now.getTime() - oldest.getTime())
            daysInStorage = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          }
        } catch {
          daysInStorage = 0
        }
      }

      let status: 'safe' | 'warning' | 'expired' | 'empty' = 'safe'
      if (balanceKg <= 0) {
        status = 'empty'
      } else if (daysInStorage > entry.maxStorageDays) {
        status = 'expired'
      } else if (daysInStorage >= entry.maxStorageDays * 0.8) {
        status = 'warning'
      }

      const sources = Object.entries(entry.sourcesMap).map(([name, val]) => ({
        name,
        count: val.count,
        totalKg: Number(val.totalKg.toFixed(1)),
      })).sort((a, b) => b.totalKg - a.totalKg)

      const destinations = Object.entries(entry.destinationsMap).map(([name, val]) => ({
        name,
        count: val.count,
        totalKg: Number(val.totalKg.toFixed(1)),
      })).sort((a, b) => b.totalKg - a.totalKg)

      entry.transactions.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

      return {
        wasteName: entry.wasteName,
        wasteCode: entry.wasteCode,
        category: 'B3' as const,
        totalInKg: Number(entry.totalInKg.toFixed(1)),
        totalOutKg: Number(entry.totalOutKg.toFixed(1)),
        balanceKg,
        capacityKg: entry.capacityKg,
        oldestInDate: entry.oldestInDate,
        daysInStorage,
        maxStorageDays: entry.maxStorageDays,
        status,
        txCount: entry.txCount,
        latestTxDate: entry.latestTxDate,
        sources,
        destinations,
        transactions: entry.transactions,
      }
    })
  }, [transactions])

  // Filtered summary
  const filteredSummary = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim()
    return summaryList.filter((item) => {
      if (q) {
        const matchName = item.wasteName.toLowerCase().includes(q)
        const matchCode = item.wasteCode.toLowerCase().includes(q)
        if (!matchName && !matchCode) return false
      }

      if (statusFilter === 'has_balance') return item.balanceKg > 0
      if (statusFilter === 'critical') return item.status === 'expired' || item.status === 'warning'
      if (statusFilter === 'empty') return item.balanceKg === 0

      return true
    }).sort((a, b) => {
      if (a.status === 'expired' && b.status !== 'expired') return -1
      if (b.status === 'expired' && a.status !== 'expired') return 1
      if (a.status === 'warning' && b.status === 'safe') return -1
      if (b.status === 'warning' && a.status === 'safe') return 1
      return b.balanceKg - a.balanceKg
    })
  }, [summaryList, localSearch, searchQuery, statusFilter])

  // Global KPIs for the summary
  const totals = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let totalBal = 0
    let expiredCount = 0
    let warningCount = 0

    summaryList.forEach((item) => {
      totalIn += item.totalInKg
      totalOut += item.totalOutKg
      totalBal += item.balanceKg
      if (item.status === 'expired') expiredCount++
      if (item.status === 'warning') warningCount++
    })

    return {
      typesCount: summaryList.length,
      totalIn: Number(totalIn.toFixed(1)),
      totalOut: Number(totalOut.toFixed(1)),
      totalBal: Number(totalBal.toFixed(1)),
      expiredCount,
      warningCount,
    }
  }, [summaryList])

  // Export neraca to CSV
  const handleExportCSV = () => {
    if (summaryList.length === 0) return
    const headers = ['Kode Limbah', 'Jenis Limbah', 'Total Masuk (kg)', 'Total Keluar (kg)', 'Sisa Saldo di TPS (kg)', 'Lama Simpan (Hari)', 'Batas Simpan (Hari)', 'Status Kepatuhan']
    const rows = summaryList.map((item) => [
      `"${item.wasteCode}"`,
      `"${item.wasteName}"`,
      item.totalInKg,
      item.totalOutKg,
      item.balanceKg,
      item.daysInStorage,
      item.maxStorageDays,
      `"${item.status === 'expired' ? 'LEWAT BATAS' : item.status === 'warning' ? 'MENDEKATI BATAS' : item.balanceKg === 0 ? 'KOSONG' : 'AMAN'}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Neraca_Limbah_B3_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      {/* 1. Header Metrics Strip (Neraca Overview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
          gap: 10,
        }}
      >
        {/* KPI 1: Total Jenis */}
        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Jenis Limbah
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>
            {totals.typesCount} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>Kategori</span>
          </div>
        </div>

        {/* KPI 2: Total Masuk */}
        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Akumulasi Masuk
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.chartB3In }}>
            {totals.totalIn.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        {/* KPI 3: Total Keluar */}
        <div style={kpiChipStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Terkirim ke Pihak 3
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.chartB3Out }}>
            {totals.totalOut.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        {/* KPI 4: Sisa Saldo di TPS */}
        <div style={{ ...kpiChipStyle, borderLeft: `3px solid ${tokens.primary}` }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Sisa Fisik di TPS
          </span>
          <div style={{ fontSize: 20, fontWeight: 800, color: tokens.primary }}>
            {totals.totalBal.toLocaleString('id-ID')} <span style={{ fontSize: 11, fontWeight: 500, color: tokens.textMuted }}>kg</span>
          </div>
        </div>

        {/* KPI 5: Alert Kepatuhan */}
        <div style={{ ...kpiChipStyle, borderLeft: totals.expiredCount > 0 ? `3px solid ${tokens.danger}` : undefined }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase' }}>
            Status Kepatuhan
          </span>
          <div style={{ fontSize: 14, fontWeight: 800, color: totals.expiredCount > 0 ? tokens.danger : totals.warningCount > 0 ? tokens.warning : tokens.success, marginTop: 4 }}>
            {totals.expiredCount > 0
              ? `🔴 ${totals.expiredCount} Lewat Batas`
              : totals.warningCount > 0
                ? `🟡 ${totals.warningCount} Perlu Diangkut`
                : '🟢 Semua Sesuai Baku'}
          </div>
        </div>
      </div>

      {/* 2. Filter & View Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: tokens.bgSecondary,
          padding: '10px 14px',
          borderRadius: tokens.radius,
          border: `1px solid ${tokens.border}`,
        }}
      >
        {/* Left: Search & Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
            <input
              type="text"
              placeholder="Cari jenis atau kode limbah..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                borderRadius: '6px',
                border: `1px solid ${tokens.border}`,
                background: tokens.inputBg,
                color: tokens.text,
                fontSize: 12,
                outline: 'none',
                fontFamily: tokens.fontFamily,
              }}
            />
            <span style={{ position: 'absolute', left: 9, top: 7, fontSize: 13, color: tokens.textMuted }}>
              🔍
            </span>
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                style={{
                  position: 'absolute', right: 8, top: 6, background: 'transparent',
                  border: 'none', color: tokens.textMuted, cursor: 'pointer', fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick status filters */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'has_balance', label: 'Ada Stok di TPS' },
              { id: 'critical', label: 'Perhatian Masa Simpan' },
              { id: 'empty', label: 'Nihil / Kosong' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${statusFilter === f.id ? tokens.primary : tokens.border}`,
                  background: statusFilter === f.id ? `${tokens.primary}18` : 'transparent',
                  color: statusFilter === f.id ? tokens.primary : tokens.textMuted,
                  fontSize: 11.5,
                  fontWeight: statusFilter === f.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: tokens.fontFamily,
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle & Export Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle View: Table vs Cards */}
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
              title="Tampilan Tabel Neraca"
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'table' ? tokens.primary : 'transparent',
                color: viewMode === 'table' ? tokens.textInverse : tokens.textMuted,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: tokens.fontFamily,
              }}
            >
              <span>📋</span> Tabel Neraca
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Tampilan Kartu Grid"
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'cards' ? tokens.primary : 'transparent',
                color: viewMode === 'cards' ? tokens.textInverse : tokens.textMuted,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: tokens.fontFamily,
              }}
            >
              <span>🔲</span> Kartu
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${tokens.border}`,
              background: tokens.card,
              color: tokens.text,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: tokens.fontFamily,
              transition: 'all 0.15s ease',
            }}
          >
            <span>📥</span> Ekspor CSV
          </button>
        </div>
      </div>

      {/* 3. Main Content: Table or Bento Cards */}
      {filteredSummary.length === 0 ? (
        <div
          style={{
            padding: '36px',
            textAlign: 'center',
            background: tokens.bgSecondary,
            borderRadius: tokens.radius,
            border: `1px dashed ${tokens.border}`,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Tidak Ada Jenis Limbah Ditemukan</div>
          <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 4 }}>
            Coba sesuaikan kata kunci pencarian atau filter status kepatuhan.
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <B3SummaryTableView
          items={filteredSummary}
          totals={totals}
          onSelectWaste={setSelectedWaste}
        />
      ) : (
        <B3SummaryCardsView
          items={filteredSummary}
          onSelectWaste={setSelectedWaste}
        />
      )}

      {/* 4. Drill-Down Detail Modal */}
      <WasteTypeDetailModal
        item={selectedWaste}
        onClose={() => setSelectedWaste(null)}
      />
    </div>
  )
}
