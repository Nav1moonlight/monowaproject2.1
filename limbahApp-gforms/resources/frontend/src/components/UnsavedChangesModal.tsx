import type { ThemeTokens } from '../theme'

interface UnsavedChangesModalProps {
  isOpen: boolean
  tokens: ThemeTokens
  isSaving?: boolean
  onSaveAndContinue: () => void
  onDiscardAndContinue: () => void
  onCancel: () => void
}

export default function UnsavedChangesModal({
  isOpen,
  tokens,
  isSaving = false,
  onSaveAndContinue,
  onDiscardAndContinue,
  onCancel,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: tokens.card,
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius,
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
          padding: '24px',
          maxWidth: 440,
          width: '100%',
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          animation: 'scaleUp 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.text }}>
              Perubahan Belum Disimpan
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: tokens.textMuted }}>
              Pengaturan sistem telah diubah
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.5, marginBottom: 24 }}>
          Anda belum menyimpan perubahan pada halaman Pengaturan. Apakah Anda ingin menyimpan perubahan tersebut sebelum berpindah ke halaman lain?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveAndContinue}
            style={{
              width: '100%',
              padding: '11px 16px',
              background: tokens.primary,
              color: tokens.textInverse,
              border: 'none',
              borderRadius: tokens.radius,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: tokens.fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: tokens.shadow,
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {isSaving ? 'Menyimpan...' : '✓ Simpan & Lanjutkan'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              disabled={isSaving}
              onClick={onDiscardAndContinue}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: tokens.radius,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: tokens.fontFamily,
                transition: 'all 0.15s',
              }}
            >
              Buang Perubahan
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: tokens.bgSecondary,
                color: tokens.text,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: tokens.fontFamily,
                transition: 'all 0.15s',
              }}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
