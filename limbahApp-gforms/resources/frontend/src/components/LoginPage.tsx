import { useState } from 'react'
import { useApp } from '../context'
import { apiLogin, apiRegister } from '../api'

export default function LoginPage() {
  const { tokens, login } = useApp()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email dan password wajib diisi.')
      return
    }

    if (activeTab === 'register') {
      if (!name.trim()) {
        setErrorMsg('Nama lengkap wajib diisi.')
        return
      }
      if (password.length < 8) {
        setErrorMsg('Password minimal harus 8 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (activeTab === 'login') {
        const res = await apiLogin({ email: email.trim(), password })
        setSuccessMsg('Login berhasil! Mengalihkan...')
        setTimeout(() => {
          login(res.access_token, res.user)
        }, 400)
      } else {
        const res = await apiRegister({ name: name.trim(), email: email.trim(), password })
        setSuccessMsg('Registrasi akun berhasil!')
        setTimeout(() => {
          login(res.access_token, res.user)
        }, 400)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isGrad = tokens.bg.includes('gradient') || tokens.bg.includes('linear')

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: isGrad ? tokens.bg : undefined,
        backgroundColor: isGrad ? undefined : tokens.bg,
        color: tokens.text,
        fontFamily: tokens.fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Circles */}
      <div
        style={{
          position: 'absolute',
          top: '-160px',
          left: '-160px',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          filter: 'blur(64px)',
          opacity: 0.2,
          pointerEvents: 'none',
          backgroundColor: tokens.primary,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-160px',
          right: '-160px',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          filter: 'blur(64px)',
          opacity: 0.2,
          pointerEvents: 'none',
          backgroundColor: tokens.accent,
        }}
      />

      {/* Main Glassmorphic Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: tokens.radius,
          border: `1px solid ${tokens.cardBorder}`,
          padding: '32px 28px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 10,
          backgroundColor: tokens.card,
          boxShadow: tokens.shadow,
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
              marginBottom: '12px',
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
              color: '#ffffff',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: tokens.text }}>
            Monowa Portal
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px', color: tokens.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Environmental Health & Safety (EHS) Portal
          </p>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${tokens.border}`,
            backgroundColor: tokens.inputBg,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'login' ? tokens.primary : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : tokens.text,
              boxShadow: activeTab === 'login' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              fontFamily: tokens.fontFamily,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'register' ? tokens.primary : 'transparent',
              color: activeTab === 'register' ? '#ffffff' : tokens.text,
              boxShadow: activeTab === 'register' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              fontFamily: tokens.fontFamily,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Daftar Akun
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: `1px solid ${tokens.danger}40`,
              backgroundColor: `${tokens.danger}15`,
              color: tokens.danger,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={{ flex: 1, fontWeight: 500 }}>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: `1px solid ${tokens.success}40`,
              backgroundColor: `${tokens.success}15`,
              color: tokens.success,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div style={{ flex: 1, fontWeight: 500 }}>{successMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: tokens.text }}>
                Nama Lengkap
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Operator"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: `1px solid ${tokens.border}`,
                    backgroundColor: tokens.inputBg,
                    color: tokens.text,
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: tokens.fontFamily,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: tokens.text }}>
              Alamat Email
            </label>
            <div style={{ position: 'relative' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: `1px solid ${tokens.border}`,
                  backgroundColor: tokens.inputBg,
                  color: tokens.text,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: tokens.fontFamily,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: tokens.text }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeTab === 'register' ? 'Minimal 8 karakter' : '••••••••'}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 36px',
                  borderRadius: '10px',
                  border: `1px solid ${tokens.border}`,
                  backgroundColor: tokens.inputBg,
                  color: tokens.text,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: tokens.fontFamily,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.7,
                  color: tokens.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: tokens.text }}>
                Konfirmasi Password
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan ulang password"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: `1px solid ${tokens.border}`,
                    backgroundColor: tokens.inputBg,
                    color: tokens.text,
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: tokens.fontFamily,
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
              opacity: isSubmitting ? 0.7 : 1,
              fontFamily: tokens.fontFamily,
            }}
          >
            {isSubmitting ? (
              <span>Memproses...</span>
            ) : activeTab === 'login' ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Masuk ke Aplikasi
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Buat Akun Baru
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: tokens.textMuted }}>
          Hak Cipta &copy; {new Date().getFullYear()} EHS Limbah Monitoring App.
        </div>
      </div>
    </div>
  )
}
