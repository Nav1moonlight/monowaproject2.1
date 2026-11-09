import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'

export type B3FilterStatus = 'all' | 'pending' | 'received' | 'processed' | 'completed' | 'disposed' | 'rejected'

interface B3FilterBarProps {
  filterCat: 'all' | 'b3in' | 'b3out'
  setFilterCat: (val: 'all' | 'b3in' | 'b3out') => void
  filterStatus: B3FilterStatus
  setFilterStatus: (val: B3FilterStatus) => void
  filterFrom: string
  setFilterFrom: (val: string) => void
  filterTo: string
  setFilterTo: (val: string) => void
  onReset: () => void
}

export default function B3FilterBar({
  filterCat,
  setFilterCat,
  filterStatus,
  setFilterStatus,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  onReset,
}: B3FilterBarProps) {
  const { tokens, t, search, setSearch } = useApp()
  const isMobile = useIsMobile()

  const hasFilter = search || filterCat !== 'all' || filterStatus !== 'all' || filterFrom || filterTo

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '5px 10px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 12,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          width: isMobile ? '100%' : 180,
          outline: 'none',
        }}
      />
      <select
        value={filterCat}
        onChange={(e) => setFilterCat(e.target.value as typeof filterCat)}
        style={{
          padding: '5px 8px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 12,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          cursor: 'pointer',
        }}
      >
        <option value="all">Semua Jenis Log</option>
        <option value="b3in">B3 Masuk</option>
        <option value="b3out">B3 Keluar</option>
      </select>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as B3FilterStatus)}
        style={{
          padding: '5px 8px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 12,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          cursor: 'pointer',
        }}
      >
        <option value="all">{t('allStatuses')}</option>
        <option value="pending">{t('pending')}</option>
        <option value="received">{t('received')}</option>
        <option value="processed">{t('processed')}</option>
        <option value="completed">{t('completed')}</option>
        <option value="disposed">{t('disposed')}</option>
        <option value="rejected">{t('rejected')}</option>
      </select>
      <input
        type="date"
        value={filterFrom}
        onChange={(e) => setFilterFrom(e.target.value)}
        style={{
          padding: '5px 8px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 12,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
        }}
      />
      <input
        type="date"
        value={filterTo}
        onChange={(e) => setFilterTo(e.target.value)}
        style={{
          padding: '5px 8px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 12,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
        }}
      />
      {hasFilter && (
        <button
          onClick={onReset}
          style={{
            padding: '5px 10px',
            background: `${tokens.danger}15`,
            border: `1px solid ${tokens.danger}40`,
            borderRadius: tokens.radius,
            fontSize: 12,
            color: tokens.danger,
            cursor: 'pointer',
            fontFamily: tokens.fontFamily,
          }}
        >
          {t('reset')}
        </button>
      )}
    </div>
  )
}
