import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processed: '#3b82f6',
  disposed: '#22c55e',
  received: '#0ea5e9',
  completed: '#22c55e',
  draft: '#6b7280',
  verified: '#10b981',
  rejected: '#ef4444',
  submitted: '#3b82f6',
}

interface B3TableProps {
  paginated: any[]
  filteredCount: number
  page: number
  totalPages: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  pageSize: number
  onEdit: (tx: any) => void
  onDelete: (tx: any) => void
  onPreviewImage: (url: string) => void
}

export default function B3Table({
  paginated,
  filteredCount,
  page,
  totalPages,
  setPage,
  pageSize,
  onEdit,
  onDelete,
  onPreviewImage,
}: B3TableProps) {
  const { tokens, t } = useApp()
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginated.map((tx) => (
            <div
              key={tx.id}
              style={{
                background: tokens.inputBg,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: tokens.primary, fontVariantNumeric: 'tabular-nums' }}>{tx.id}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3,
                  background: `${STATUS_COLORS[tx.status] || '#3b82f6'}22`,
                  color: STATUS_COLORS[tx.status] || '#3b82f6',
                }}>{t(tx.status) || tx.status}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: tokens.text }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tx.category === 'b3in' ? tokens.chartB3In : tokens.chartB3Out, flexShrink: 0 }} />
                  {tx.type}
                </div>
                <span style={{ fontWeight: 700, color: tokens.text, fontVariantNumeric: 'tabular-nums' }}>
                  {Number(tx.amountKg ?? tx.weightKg ?? 0).toFixed(1)} kg
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: tokens.textMuted }}>
                <div>📅 {tx.date}</div>
                <div>📄 Manifest: {tx.manifest}</div>
                <div>📍 {tx.category === 'b3in' ? `Dari: ${tx.source}` : `Ke: ${tx.destination}`}</div>
                <div>🚚 Transporter: {tx.transporter}</div>
              </div>

              {/* Audit trail indicator on mobile */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: tokens.textMuted, background: tokens.card, padding: '4px 8px', borderRadius: 4, border: `1px solid ${tokens.border}` }}>
                <span>👤 Diinput: <strong style={{ color: tokens.text }}>{tx.creator?.name || 'Petugas EHS'}</strong></span>
                {tx.updater && <span>✏️ Diedit: <strong style={{ color: tokens.text }}>{tx.updater.name.split(' ')[0]}</strong></span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTop: `1px solid ${tokens.border}` }}>
                {tx.scalePhotoUrl ? (
                  <img
                    src={tx.scalePhotoUrl}
                    alt="Foto Timbangan"
                    onClick={() => onPreviewImage(tx.scalePhotoUrl)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: `1px solid ${tokens.border}` }}
                  />
                ) : (
                  <span style={{ fontSize: 11, color: tokens.textMuted }}>-</span>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => onEdit(tx)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: tokens.primary, fontWeight: 600 }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tx)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: tokens.danger, fontWeight: 600 }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: tokens.fontFamily }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${tokens.border}` }}>
                {['ID', t('date'), t('type'), t('source'), t('destination'), t('amount'), t('status'), 'Manifest', 'Petugas (Audit)', 'Foto', 'Aksi'].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: tokens.textMuted, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((tx, i) => {
                const auditTooltip = `Dibuat oleh: ${tx.creator?.name || 'Petugas EHS'}${tx.created_at ? ` (${new Date(tx.created_at).toLocaleString('id-ID')})` : ''}${tx.updater ? `\nTerakhir diubah oleh: ${tx.updater.name}${tx.updated_at ? ` (${new Date(tx.updated_at).toLocaleString('id-ID')})` : ''}` : ''}`

                return (
                  <tr key={tx.id} style={{ borderBottom: `1px solid ${tokens.border}`, background: i % 2 === 0 ? 'transparent' : `${tokens.border}40`, transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}10` }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : `${tokens.border}40` }}>
                    <td style={{ padding: '8px 10px', color: tokens.primary, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{tx.id}</td>
                    <td style={{ padding: '8px 10px', color: tokens.text, whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td style={{ padding: '8px 10px', color: tokens.text }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: tx.category === 'b3in' ? tokens.chartB3In : tokens.chartB3Out, flexShrink: 0 }} />
                        {tx.type}
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', color: tokens.text }}>{tx.source}</td>
                    <td style={{ padding: '8px 10px', color: tokens.text }}>{tx.destination}</td>
                    <td style={{ padding: '8px 10px', color: tokens.text, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {Number(tx.amountKg ?? tx.weightKg ?? 0).toFixed(1)} kg
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3,
                        background: `${STATUS_COLORS[tx.status] || '#3b82f6'}22`,
                        color: STATUS_COLORS[tx.status] || '#3b82f6',
                      }}>{t(tx.status) || tx.status}</span>
                    </td>
                    <td style={{ padding: '8px 10px', color: tokens.textMuted, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{tx.manifest}</td>

                    {/* Petugas & Audit Column */}
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <div
                        title={auditTooltip}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: `${tokens.primary}20`,
                            color: tokens.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {(tx.creator?.name || 'P')[0]?.toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: tokens.text }}>
                            {tx.creator?.name || 'Petugas EHS'}
                          </span>
                          {tx.updater && (
                            <span style={{ fontSize: 9.5, color: tokens.textMuted }}>
                              ✏️ diedit: {tx.updater.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '8px 10px' }}>
                      {tx.scalePhotoUrl ? (
                        <img
                          src={tx.scalePhotoUrl}
                          alt="Foto Timbangan"
                          onClick={() => onPreviewImage(tx.scalePhotoUrl)}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                          style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: `1px solid ${tokens.border}` }}
                        />
                      ) : (
                        <span style={{ fontSize: 11, color: tokens.textMuted }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, marginRight: 8, color: tokens.primary, fontWeight: 600 }}
                        title="Edit Transaksi"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: tokens.danger, fontWeight: 600 }}
                        title="Hapus Transaksi"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${tokens.border}`, flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 12, color: tokens.textMuted }}>
          Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredCount)} dari {filteredCount} data
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '4px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 12, color: tokens.text, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontFamily: tokens.fontFamily }}>
            ‹ Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <button key={p} onClick={() => setPage(p)} style={{
                padding: '4px 8px', background: p === page ? tokens.primary : tokens.inputBg,
                border: `1px solid ${p === page ? tokens.primary : tokens.border}`,
                borderRadius: tokens.radius, fontSize: 12,
                color: p === page ? tokens.textInverse : tokens.text,
                cursor: 'pointer', fontFamily: tokens.fontFamily, minWidth: 30,
              }}>{p}</button>
            )
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '4px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 12, color: tokens.text, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontFamily: tokens.fontFamily }}>
            Next ›
          </button>
        </div>
      </div>
    </>
  )
}
