import { useApp } from '../../context'

interface DomesticEditModalProps {
  editingTx: any
  editForm: {
    domestic_residue_kg: string
    status: string
    pic_name: string
    notes: string
  }
  setEditForm: React.Dispatch<React.SetStateAction<{
    domestic_residue_kg: string
    status: string
    pic_name: string
    notes: string
  }>>
  onClose: () => void
  onSave: () => void
  saving: boolean
}

export default function DomesticEditModal({
  editingTx,
  editForm,
  setEditForm,
  onClose,
  onSave,
  saving,
}: DomesticEditModalProps) {
  const { tokens } = useApp()

  if (!editingTx) return null

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
          width: '100%', maxWidth: 460, background: tokens.card, border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius, padding: 20, boxShadow: tokens.shadow, display: 'flex', flexDirection: 'column', gap: 14,
          fontFamily: tokens.fontFamily,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text }}>Edit Transaksi Domestik {editingTx.id}</div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: tokens.textMuted }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, display: 'block', marginBottom: 4 }}>Jumlah Berat Residu/Sampah (kg)</label>
            <input
              type="number" step="0.1" min="0"
              value={editForm.domestic_residue_kg}
              onChange={(e) => setEditForm({ ...editForm, domestic_residue_kg: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 13, color: tokens.text }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, display: 'block', marginBottom: 4 }}>Petugas Penanggung Jawab (PIC)</label>
            <input
              type="text"
              value={editForm.pic_name}
              onChange={(e) => setEditForm({ ...editForm, pic_name: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 13, color: tokens.text }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, display: 'block', marginBottom: 4 }}>Status Transaksi</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 13, color: tokens.text }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, display: 'block', marginBottom: 4 }}>Catatan</label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: '7px 10px', background: tokens.inputBg, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, fontSize: 13, color: tokens.text, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Audit Metadata Box */}
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
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>👤 Dibuat oleh: <strong style={{ color: tokens.text }}>{editingTx.creator?.name || editingTx.picName || 'Petugas EHS'}</strong></span>
            <span>{editingTx.created_at ? new Date(editingTx.created_at).toLocaleString('id-ID') : '-'}</span>
          </div>
          {editingTx.updater && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${tokens.border}`, paddingTop: 3 }}>
              <span>✏️ Terakhir diubah: <strong style={{ color: tokens.text }}>{editingTx.updater.name}</strong></span>
              <span>{editingTx.updated_at ? new Date(editingTx.updated_at).toLocaleString('id-ID') : '-'}</span>
            </div>
          )}
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
            onClick={onSave}
            disabled={saving}
            style={{ padding: '7px 14px', background: tokens.primary, border: 'none', borderRadius: tokens.radius, fontSize: 12, color: tokens.textInverse, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
