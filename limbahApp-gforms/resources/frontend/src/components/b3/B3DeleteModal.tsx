import { useApp } from '../../context'

interface B3DeleteModalProps {
  deletingTx: any
  onClose: () => void
  onConfirm: () => void
  saving: boolean
}

export default function B3DeleteModal({
  deletingTx,
  onClose,
  onConfirm,
  saving,
}: B3DeleteModalProps) {
  const { tokens } = useApp()

  if (!deletingTx) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, background: tokens.card, border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius, padding: 20, boxShadow: tokens.shadow, display: 'flex', flexDirection: 'column', gap: 14,
          fontFamily: tokens.fontFamily,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: tokens.danger }}>Konfirmasi Hapus Transaksi</div>
        <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.45 }}>
          Apakah Anda yakin ingin menghapus data transaksi <strong>{deletingTx.id}</strong> ({deletingTx.type} - {Number(deletingTx.amountKg ?? deletingTx.weightKg ?? 0).toFixed(1)} kg)?
        </div>

        {/* Audit info box */}
        <div
          style={{
            background: tokens.bgSecondary,
            border: `1px solid ${tokens.border}`,
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            color: tokens.textMuted,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div>👤 Dibuat oleh: <strong style={{ color: tokens.text }}>{deletingTx.creator?.name || 'Petugas EHS'}</strong> ({deletingTx.date})</div>
          {deletingTx.manifest && deletingTx.manifest !== '-' && (
            <div>📄 No. Manifest: {deletingTx.manifest}</div>
          )}
        </div>

        <div style={{ fontSize: 11, color: tokens.textMuted }}>
          Data ini akan diarsipkan (soft delete) dan tetap tersimpan di riwayat audit database.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '7px 14px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 12, color: tokens.text, cursor: 'pointer' }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            style={{ padding: '7px 14px', background: tokens.danger, border: 'none', borderRadius: tokens.radius, fontSize: 12, color: '#fff', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Menghapus...' : 'Ya, Hapus Transaksi'}
          </button>
        </div>
      </div>
    </div>
  )
}
