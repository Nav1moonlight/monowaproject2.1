import { useState, type FormEvent } from 'react'
import { useApp } from '../../context'
import { createWasteSource, type WasteSourceItem } from '../../api'

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newSource: WasteSourceItem) => void
  initialName?: string
}

export default function AddSourceModal({
  isOpen,
  onClose,
  onSuccess,
  initialName = '',
}: AddSourceModalProps) {
  const { tokens, theme } = useApp()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  const [name, setName] = useState(initialName)
  const [entity, setEntity] = useState<'UT' | 'UTPE' | 'OTHER'>('UT')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama lokasi sumber limbah wajib diisi.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await createWasteSource({
        name: name.trim(),
        entity,
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        is_active: true,
      })
      onSuccess(res)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan lokasi sumber limbah.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: tokens.inputBg,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius,
    fontSize: 13,
    color: tokens.text,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: tokens.fontFamily,
    transition: 'border-color 0.15s',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tokens.card,
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: Math.max(12, tokens.radius || 12),
          width: '100%',
          maxWidth: '460px',
          boxShadow: tokens.shadow,
          backdropFilter: isGlass ? tokens.glassBlur : undefined,
          WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
          fontFamily: tokens.fontFamily,
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: tokens.text }}>
              Tambah Lokasi Sumber Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: tokens.textMuted,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: tokens.radius,
                background: '#ef444415',
                border: '1px solid #ef444450',
                color: '#ef4444',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Entity / Group */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.textMuted,
                  marginBottom: 6,
                }}
              >
                Entitas / Unit Perusahaan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {(['UT', 'UTPE', 'OTHER'] as const).map((ent) => {
                  const isSelected = entity === ent
                  return (
                    <button
                      type="button"
                      key={ent}
                      onClick={() => setEntity(ent)}
                      style={{
                        padding: '8px 10px',
                        border: `1.5px solid ${isSelected ? tokens.primary : tokens.border}`,
                        borderRadius: tokens.radius,
                        background: isSelected ? `${tokens.primary}18` : tokens.inputBg,
                        color: isSelected ? tokens.primary : tokens.text,
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: tokens.fontFamily,
                      }}
                    >
                      {ent === 'UT' ? '🏭 UT' : ent === 'UTPE' ? '🏗️ UTPE' : '🏢 Lainnya'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Location Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.textMuted,
                  marginBottom: 6,
                }}
              >
                Nama Lokasi / Tempat <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Workshop UT / Fabrikasi UTPE"
                required
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Location Code (Optional) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.textMuted,
                  marginBottom: 6,
                }}
              >
                Kode Singkat (Opsional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: WS-UT / FAB-UTPE"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.textMuted,
                  marginBottom: 6,
                }}
              >
                Keterangan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Misal: Gedung A Lt. 1 / Area Belakang"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${tokens.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: tokens.radius,
                border: `1px solid ${tokens.border}`,
                background: tokens.card,
                color: tokens.textMuted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 18px',
                borderRadius: tokens.radius,
                border: 'none',
                background: tokens.primary,
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {loading ? 'Menyimpan...' : '✓ Simpan Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
