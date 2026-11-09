import { useState, useRef, useEffect } from 'react'
import { useApp, getPeriodDateRange } from '../../context'
import { useToast } from '../../context/ToastContext'
import { getB3Transactions, getDomesticTransactions } from '../../api'
import { exportToCSV, exportToPrintPDF } from '../../utils/exportUtils'

export default function ExportControls({ isMobile }: { isMobile: boolean }) {
  const { tokens, page, search, year, periodFilter } = useApp()
  const { toast } = useToast()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleExport = async (format: 'csv' | 'pdf') => {
    setShowExportMenu(false)
    const periodRange = getPeriodDateRange(year, periodFilter)
    const periodLabel = `${periodFilter === 'all' ? '1 Tahun' : periodFilter} ${year}`

    let title = 'Laporan Data Limbah'
    let headers: string[] = []
    let rows: (string | number)[][] = []

    if (page === 'b3' || page === 'b3-in' || page === 'b3-out') {
      title = 'Laporan Transaksi Limbah B3'
      headers = ['ID', 'Tanggal', 'Jenis Limbah', 'Kategori', 'Berat (kg)', 'Status', 'Sumber', 'Tujuan', 'Manifest', 'Transporter']
      try {
        const res = await getB3Transactions({
          per_page: 500,
          from: periodRange.from,
          to: periodRange.to,
        })
        const list = res?.data || []
        const filtered = list.filter((tx: any) => {
          if (search) {
            const s = search.toLowerCase()
            return (
              String(tx.id).toLowerCase().includes(s) ||
              String(tx.waste_name || tx.type || '').toLowerCase().includes(s) ||
              String(tx.source || '').toLowerCase().includes(s) ||
              String(tx.destination || '').toLowerCase().includes(s) ||
              String(tx.manifest_number || tx.manifest || '').toLowerCase().includes(s)
            )
          }
          return true
        })

        rows = filtered.map((tx: any) => [
          tx.id ? `B3-${tx.id}` : (tx.id || '-'),
          tx.date || '-',
          tx.waste_name || tx.type || '-',
          tx.transaction_type === 'IN' || tx.category === 'b3in' ? 'Masuk (IN)' : 'Keluar (OUT)',
          Number(tx.weight_kg ?? tx.weightKg ?? tx.amountKg ?? 0).toFixed(1),
          tx.status || 'pending',
          tx.source || '-',
          tx.destination || '-',
          tx.manifest_number || tx.manifest || '-',
          tx.transporter || '-',
        ])
      } catch {
        rows = []
      }
    } else {
      title = 'Laporan Transaksi Limbah Domestik'
      headers = ['ID', 'Tanggal', 'Sesi', 'Organik (kg)', 'Anorganik (kg)', 'Total (kg)', 'Status', 'PIC', 'Catatan']
      try {
        const res = await getDomesticTransactions({
          per_page: 500,
          from: periodRange.from,
          to: periodRange.to,
        })
        const list = res?.data || []
        const filtered = list.filter((tx: any) => {
          if (search) {
            const s = search.toLowerCase()
            return (
              String(tx.id).toLowerCase().includes(s) ||
              String(tx.pic_name || tx.picName || '').toLowerCase().includes(s) ||
              String(tx.notes || '').toLowerCase().includes(s)
            )
          }
          return true
        })

        rows = filtered.map((tx: any) => [
          tx.id ? `DOM-${tx.id}` : (tx.id || '-'),
          tx.date || '-',
          tx.session === 'MORNING' || tx.session === 'morning' ? 'Pagi' : 'Sore',
          Number(tx.organic_weight_kg ?? tx.organicKg ?? 0).toFixed(1),
          Number(tx.inorganic_weight_kg ?? tx.inorganicKg ?? 0).toFixed(1),
          Number(tx.total_weight_kg ?? tx.totalKg ?? 0).toFixed(1),
          tx.status || 'SUBMITTED',
          tx.pic_name || tx.picName || 'Petugas',
          tx.notes || '-',
        ])
      } catch {
        rows = []
      }
    }

    if (rows.length === 0) {
      toast.warning('Tidak ada data transaksi yang cocok dengan filter saat ini untuk diekspor.')
      return
    }

    if (format === 'csv') {
      const filename = `${title.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}`
      exportToCSV(filename, headers, rows)
      toast.success('Data transaksi berhasil diekspor ke CSV/Excel')
    } else {
      exportToPrintPDF(title, periodLabel, headers, rows)
      toast.success('Pratinjau cetak PDF siap')
    }
  }

  return (
    <div ref={exportRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setShowExportMenu((v) => !v)}
        title="Ekspor / Cetak Laporan"
        style={{
          padding: isMobile ? '5px 8px' : '5px 12px',
          background: `${tokens.primary}15`,
          border: `1px solid ${tokens.primary}40`,
          borderRadius: tokens.radius,
          color: tokens.primary,
          fontSize: isMobile ? 12 : 13,
          fontWeight: 600,
          fontFamily: tokens.fontFamily,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>📥 Ekspor</span>
      </button>
      {showExportMenu && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 6,
            background: tokens.card,
            border: `1px solid ${tokens.cardBorder}`,
            borderRadius: tokens.radius,
            boxShadow: tokens.shadow,
            padding: '6px 0',
            minWidth: 150,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={() => handleExport('csv')}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              color: tokens.text,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: tokens.fontFamily,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}12` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <span>📊 Excel / CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              color: tokens.text,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: tokens.fontFamily,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}12` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <span>📄 Cetak PDF</span>
          </button>
        </div>
      )}
    </div>
  )
}
