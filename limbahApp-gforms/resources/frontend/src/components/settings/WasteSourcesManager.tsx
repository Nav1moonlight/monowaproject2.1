import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { useApp } from '../../context'
import {
  getWasteSources,
  updateWasteSource,
  deleteWasteSource,
  type WasteSourceItem,
} from '../../api'
import AddSourceModal from '../common/AddSourceModal'

export default function WasteSourcesManager() {
  const { tokens, theme } = useApp()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  const [sources, setSources] = useState<WasteSourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('ALL')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<WasteSourceItem | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadSources = async () => {
    try {
      setLoading(true)
      const data = await getWasteSources({ all: true })
      setSources(data)
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat data sumber limbah.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
      const matchEntity = entityFilter === 'ALL' || s.entity === entityFilter
      return matchSearch && matchEntity
    })
  }, [sources, search, entityFilter])

  const handleToggleActive = async (source: WasteSourceItem) => {
    try {
      const nextActive = !source.is_active
      const updated = await updateWasteSource(source.id, { is_active: nextActive })
      setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)))
      showToast(`Lokasi "${source.name}" kini ${nextActive ? 'Aktif' : 'Non-aktif'}.`)
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengubah status lokasi.', 'error')
    }
  }

  const handleDelete = async (source: WasteSourceItem) => {
    if (!window.confirm(`Yakin ingin menghapus lokasi "${source.name}"?`)) return
    try {
      await deleteWasteSource(source.id)
      setSources((prev) => prev.filter((s) => s.id !== source.id))
      showToast(`Lokasi "${source.name}" berhasil dihapus.`)
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus lokasi.', 'error')
    }
  }

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingSource) return
    if (!editingSource.name.trim()) {
      setEditError('Nama lokasi wajib diisi.')
      return
    }

    try {
      setSavingEdit(true)
      setEditError(null)
      const updated = await updateWasteSource(editingSource.id, {
        name: editingSource.name.trim(),
        code: editingSource.code?.trim() || null,
        entity: editingSource.entity || 'UT',
        description: editingSource.description?.trim() || null,
      })
      setSources((prev) => prev.map((s) => (s.id === editingSource.id ? updated : s)))
      setEditingSource(null)
      showToast(`Lokasi "${updated.name}" berhasil diperbarui.`)
    } catch (err: any) {
      setEditError(err?.message || 'Gagal menyimpan perubahan lokasi.')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div
      style={{
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        padding: '20px 24px',
        boxShadow: tokens.shadow,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        fontFamily: tokens.fontFamily,
        gridColumn: '1 / -1',
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            marginBottom: 14,
            padding: '8px 14px',
            borderRadius: tokens.radius,
            background: toast.type === 'success' ? '#22c55e18' : '#ef444418',
            border: `1px solid ${toast.type === 'success' ? '#22c55e50' : '#ef444450'}`,
            color: toast.type === 'success' ? '#16a34a' : '#ef4444',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.text}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: tokens.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            📍 Master Data Sumber Limbah (Lokasi Asal)
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: tokens.textMuted }}>
            Kelola daftar lokasi/tempat asal limbah B3 untuk standardisasi pengisian formulir dan analitik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          style={{
            padding: '8px 16px',
            background: tokens.primary,
            color: tokens.textInverse,
            border: 'none',
            borderRadius: tokens.radius,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          ➕ Tambah Lokasi Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari nama lokasi atau kode..."
            style={{
              width: '100%',
              padding: '8px 12px',
              background: tokens.inputBg,
              border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radius,
              fontSize: 12,
              color: tokens.text,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: tokens.fontFamily,
            }}
          />
        </div>

        {/* Entity Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'UT', label: '🏭 UT' },
            { id: 'UTPE', label: '🏗️ UTPE' },
            { id: 'OTHER', label: '🏢 Lainnya' },
          ].map((tab) => {
            const active = entityFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEntityFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: tokens.radius,
                  border: `1px solid ${active ? tokens.primary : tokens.border}`,
                  background: active ? `${tokens.primary}18` : tokens.inputBg,
                  color: active ? tokens.primary : tokens.textMuted,
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: tokens.fontFamily,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Locations Table / Cards */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>
          Memuat daftar lokasi sumber limbah...
        </div>
      ) : filteredSources.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            background: tokens.bgSecondary,
            borderRadius: tokens.radius,
            border: `1px dashed ${tokens.border}`,
            color: tokens.textMuted,
            fontSize: 13,
          }}
        >
          Tidak ada data lokasi yang sesuai filter.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {filteredSources.map((s) => {
            const isUt = s.entity === 'UT'
            const isUtpe = s.entity === 'UTPE'
            const badgeBg = isUt ? '#0284c718' : isUtpe ? '#8b5cf618' : '#64748b18'
            const badgeColor = isUt ? '#0284c7' : isUtpe ? '#8b5cf6' : '#64748b'

            return (
              <div
                key={s.id}
                style={{
                  background: tokens.bgSecondary,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radius,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  opacity: s.is_active ? 1 : 0.65,
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: badgeBg,
                        color: badgeColor,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {s.entity || 'UMUM'}
                    </span>

                    {s.code && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: tokens.textMuted,
                          background: tokens.inputBg,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: `1px solid ${tokens.border}`,
                        }}
                      >
                        {s.code}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
                    {s.name}
                  </div>

                  {s.description && (
                    <div style={{ fontSize: 11, color: tokens.textMuted, lineHeight: 1.4 }}>
                      {s.description}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${tokens.border}`,
                    paddingTop: 8,
                    marginTop: 2,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleActive(s)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.is_active ? tokens.success || '#16a34a' : tokens.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: s.is_active ? tokens.success || '#16a34a' : '#94a3b8',
                        display: 'inline-block',
                      }}
                    />
                    {s.is_active ? 'Aktif' : 'Non-aktif'}
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setEditingSource({ ...s })}
                      title="Edit lokasi"
                      style={{
                        background: tokens.inputBg,
                        border: `1px solid ${tokens.border}`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: tokens.text,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      title="Hapus lokasi"
                      style={{
                        background: '#ef444412',
                        border: '1px solid #ef444440',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Add Modal */}
      <AddSourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newSource) => {
          setSources((prev) => [...prev, newSource])
          showToast(`Lokasi baru "${newSource.name}" berhasil ditambahkan!`)
        }}
      />

      {/* Edit Modal */}
      {editingSource && (
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
          onClick={() => setEditingSource(null)}
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                <span style={{ fontSize: 18 }}>✏️</span>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: tokens.text }}>
                  Edit Lokasi Sumber Limbah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: tokens.textMuted,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '20px' }}>
              {editError && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: '10px 14px',
                    borderRadius: tokens.radius,
                    background: '#ef444415',
                    border: '1px solid #ef444450',
                    color: '#ef4444',
                    fontSize: 12,
                  }}
                >
                  ⚠️ {editError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6 }}>
                    Entitas / Unit
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {(['UT', 'UTPE', 'OTHER'] as const).map((ent) => {
                      const isSelected = (editingSource.entity || 'UT') === ent
                      return (
                        <button
                          type="button"
                          key={ent}
                          onClick={() => setEditingSource({ ...editingSource, entity: ent })}
                          style={{
                            padding: '8px 10px',
                            border: `1.5px solid ${isSelected ? tokens.primary : tokens.border}`,
                            borderRadius: tokens.radius,
                            background: isSelected ? `${tokens.primary}18` : tokens.inputBg,
                            color: isSelected ? tokens.primary : tokens.text,
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: 12,
                            cursor: 'pointer',
                            fontFamily: tokens.fontFamily,
                          }}
                        >
                          {ent === 'UT' ? '🏭 UT' : ent === 'UTPE' ? '🏗️ UTPE' : '🏢 Lainnya'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6 }}>
                    Nama Lokasi <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSource.name}
                    onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                    required
                    style={{
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
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6 }}>
                    Kode Singkat
                  </label>
                  <input
                    type="text"
                    value={editingSource.code || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, code: e.target.value })}
                    style={{
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
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6 }}>
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={editingSource.description || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, description: e.target.value })}
                    style={{
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
                    }}
                  />
                </div>
              </div>

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
                  onClick={() => setEditingSource(null)}
                  disabled={savingEdit}
                  style={{
                    padding: '8px 16px',
                    borderRadius: tokens.radius,
                    border: `1px solid ${tokens.border}`,
                    background: tokens.card,
                    color: tokens.textMuted,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: '8px 18px',
                    borderRadius: tokens.radius,
                    border: 'none',
                    background: tokens.primary,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: savingEdit ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingEdit ? 'Menyimpan...' : '✓ Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
