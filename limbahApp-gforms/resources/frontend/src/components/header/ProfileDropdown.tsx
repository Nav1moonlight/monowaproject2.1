import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context'

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export default function ProfileDropdown({ isMobile }: { isMobile: boolean }) {
  const { tokens, setPage, user, logout } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <div ref={userMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          title={`Akun: ${user?.name || 'User'} (${user?.email || ''})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: showUserMenu ? `${tokens.primary}20` : `${tokens.primary}12`,
            border: `1px solid ${tokens.border}`,
            padding: '3px 8px 3px 4px',
            borderRadius: 99,
            cursor: 'pointer',
            color: tokens.text,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: tokens.fontFamily,
            transition: 'all 0.15s',
          }}
        >
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 700,
            }}
          >
            {getInitials(user?.name)}
          </div>
          {!isMobile && (
            <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6, transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              width: 240,
              background: tokens.card,
              border: `1px solid ${tokens.cardBorder}`,
              borderRadius: tokens.radius,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              backdropFilter: tokens.glassBlur,
              WebkitBackdropFilter: tokens.glassBlur,
              padding: '6px',
              zIndex: 100,
              fontFamily: tokens.fontFamily,
            }}
          >
            {/* User Info Header */}
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${tokens.border}`, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@ehs.com'}
              </div>
              <div style={{ marginTop: 6, display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${tokens.primary}18`, color: tokens.primary }}>
                EHS Staff / Operator
              </div>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setShowUserMenu(false)
                setPage('settings')
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                textAlign: 'left',
                color: tokens.text,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: tokens.fontFamily,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}12` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Pengaturan Akun
            </button>

            <div style={{ height: 1, background: tokens.border, margin: '4px 0' }} />

            <button
              onClick={() => {
                setShowUserMenu(false)
                setShowLogoutConfirm(true)
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                textAlign: 'left',
                color: tokens.danger,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: tokens.fontFamily,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.danger}15` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Keluar Akun
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: tokens.card,
              border: `1px solid ${tokens.cardBorder}`,
              borderRadius: tokens.radius,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              padding: '24px',
              fontFamily: tokens.fontFamily,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: `${tokens.danger}15`,
                color: tokens.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: tokens.text, margin: '0 0 8px', textAlign: 'center' }}>
              Konfirmasi Keluar
            </h3>
            <p style={{ fontSize: '13px', color: tokens.textMuted, margin: '0 0 24px', lineHeight: 1.5, textAlign: 'center' }}>
              Apakah Anda yakin ingin keluar dari akun <strong style={{ color: tokens.text }}>{user?.name || 'User'}</strong>? Anda perlu login kembali untuk mengakses sistem.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: tokens.radius,
                  border: `1px solid ${tokens.border}`,
                  background: tokens.inputBg,
                  color: tokens.text,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: tokens.fontFamily,
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true)
                  try {
                    await logout()
                  } finally {
                    setIsLoggingOut(false)
                    setShowLogoutConfirm(false)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: tokens.radius,
                  border: 'none',
                  background: `linear-gradient(135deg, ${tokens.danger}, #dc2626)`,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  opacity: isLoggingOut ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  fontFamily: tokens.fontFamily,
                }}
              >
                {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
