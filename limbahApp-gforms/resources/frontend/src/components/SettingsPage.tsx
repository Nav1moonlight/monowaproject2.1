import { useState, useEffect } from 'react'
import { useApp } from '../context'
import { THEMES, type ThemeId, type ModeId } from '../theme'
import { LANGUAGES, type LangId } from '../i18n'
import { useIsMobile } from '../hooks/useMediaQuery'
import { getSystemSettings, updateSystemSettings } from '../api'
import WasteSourcesManager from './settings/WasteSourcesManager'

function Section({ title, children, tokens }: { title: string; children: React.ReactNode; tokens: ReturnType<typeof useApp>['tokens'] }) {
  const { theme } = useApp()
  const isGlass = theme === 'frosted' || theme === 'liquid'
  return (
    <div style={{
      background: tokens.card,
      border: `1px solid ${tokens.cardBorder}`,
      borderRadius: tokens.radius,
      padding: '20px 24px',
      boxShadow: tokens.shadow,
      backdropFilter: isGlass ? tokens.glassBlur : undefined,
      WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
      fontFamily: tokens.fontFamily,
      minWidth: 0,
    }}>
      <h3 style={{ margin: '0 0 18px 0', fontSize: 14, fontWeight: 700, color: tokens.text }}>{title}</h3>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, tokens }: { checked: boolean; onChange: (v: boolean) => void; tokens: ReturnType<typeof useApp>['tokens'] }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? tokens.primary : tokens.border,
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: checked ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )
}

const THEME_PREVIEWS: Record<ThemeId, { bg: string; text: string; accent: string }> = {
  corporate: { bg: '#1a2332', text: '#f1f5f9', accent: '#16a34a' },
  frosted: { bg: 'rgba(255,255,255,0.3)', text: '#1e293b', accent: '#16a34a' },
  liquid: { bg: 'linear-gradient(135deg,#c7d2fe,#a7f3d0)', text: '#1e293b', accent: '#6366f1' },
  flat: { bg: '#111827', text: '#f9fafb', accent: '#16a34a' },
  highcontrast: { bg: '#000000', text: '#ffffff', accent: '#facc15' },
  nightcity: { bg: '#020408', text: '#e0f4ff', accent: '#00ffff' },
}

export default function SettingsPage() {
  const { tokens, theme, mode, lang, setTheme, setMode, setLang, t, setHasUnsavedChanges, registerUnsavedHandlers } = useApp()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [notifB3, setNotifB3] = useState(true)
  const [notifDomestic, setNotifDomestic] = useState(true)
  const [saved, setSaved] = useState(false)
  const isMobile = useIsMobile()

  // Track initial/saved settings
  const [savedRef, setSavedRef] = useState({
    theme: theme,
    mode: mode,
    lang: lang,
    notifEnabled: true,
    notifB3: true,
    notifDomestic: true,
  })

  useEffect(() => {
    getSystemSettings()
      .then((data) => {
        const loadedNotif = data.notifEnabled !== undefined ? data.notifEnabled === 'true' : true
        const loadedB3 = data.notifB3 !== undefined ? data.notifB3 === 'true' : true
        const loadedDom = data.notifDomestic !== undefined ? data.notifDomestic === 'true' : true

        setNotifEnabled(loadedNotif)
        setNotifB3(loadedB3)
        setNotifDomestic(loadedDom)

        setSavedRef({
          theme: theme,
          mode: mode,
          lang: lang,
          notifEnabled: loadedNotif,
          notifB3: loadedB3,
          notifDomestic: loadedDom,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const isDirty =
      theme !== savedRef.theme ||
      mode !== savedRef.mode ||
      lang !== savedRef.lang ||
      notifEnabled !== savedRef.notifEnabled ||
      notifB3 !== savedRef.notifB3 ||
      notifDomestic !== savedRef.notifDomestic

    setHasUnsavedChanges(isDirty)
  }, [theme, mode, lang, notifEnabled, notifB3, notifDomestic, savedRef])

  const handleSave = async () => {
    try {
      await updateSystemSettings({
        notifEnabled: String(notifEnabled),
        notifB3: String(notifB3),
        notifDomestic: String(notifDomestic),
      })
    } catch {
      // Non-blocking fallback
    }
    setSavedRef({ theme, mode, lang, notifEnabled, notifB3, notifDomestic })
    setHasUnsavedChanges(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDiscard = () => {
    setTheme(savedRef.theme as any)
    setMode(savedRef.mode as any)
    setLang(savedRef.lang as any)
    setNotifEnabled(savedRef.notifEnabled)
    setNotifB3(savedRef.notifB3)
    setNotifDomestic(savedRef.notifDomestic)
    setHasUnsavedChanges(false)
  }

  useEffect(() => {
    registerUnsavedHandlers(handleSave, handleDiscard)
  }, [theme, mode, lang, notifEnabled, notifB3, notifDomestic, savedRef])

  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false)
    }
  }, [])

  const currentThemeDef = THEMES.find((th) => th.id === theme)
  const modesAvailable: { id: ModeId; label: string }[] = currentThemeDef?.alwaysDark
    ? [{ id: 'light', label: 'Default' }]
    : [
        { id: 'light', label: t('lightMode') },
        { id: 'dark', label: t('darkMode') },
        { id: 'amoled', label: t('amoledMode') },
      ]

  return (
    <div style={{ padding: isMobile ? '16px 16px 90px 16px' : '20px 24px 40px 24px', overflowY: 'auto', flex: 1, fontFamily: tokens.fontFamily }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, maxWidth: 1000 }}>

        {/* Theme */}
        <Section title={t('themeSettings')} tokens={tokens}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {THEMES.map((th) => {
              const prev = THEME_PREVIEWS[th.id]
              const active = theme === th.id
              return (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  style={{
                    border: `2px solid ${active ? tokens.primary : tokens.border}`,
                    borderRadius: tokens.radius,
                    padding: '10px',
                    cursor: 'pointer',
                    background: tokens.inputBg,
                    transition: 'all 0.15s',
                    outline: 'none',
                  }}
                >
                  {/* Mini preview */}
                  <div style={{
                    height: 40,
                    borderRadius: 4,
                    background: prev.bg,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{ width: 8, height: 24, background: '#00000040', borderRadius: 2 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ height: 4, background: prev.accent, borderRadius: 2, width: '70%' }} />
                      <div style={{ height: 3, background: prev.text + '60', borderRadius: 2, width: '90%' }} />
                      <div style={{ height: 3, background: prev.text + '40', borderRadius: 2, width: '60%' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? tokens.primary : tokens.text, fontFamily: tokens.fontFamily, textAlign: 'center' }}>
                    {t(th.labelKey)}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Mode selector */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textMuted, marginBottom: 8 }}>Mode Tampilan</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {modesAvailable.map(({ id, label }) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  flex: isMobile ? '1 1 45%' : 1, padding: '8px', border: `2px solid ${mode === id ? tokens.primary : tokens.border}`,
                  borderRadius: tokens.radius, background: mode === id ? `${tokens.primary}15` : tokens.inputBg,
                  color: mode === id ? tokens.primary : tokens.text, cursor: 'pointer',
                  fontSize: 12, fontWeight: mode === id ? 600 : 400, fontFamily: tokens.fontFamily,
                  transition: 'all 0.15s',
                }}>
                  {id === 'light' ? '☀ ' : id === 'dark' ? '🌙 ' : '⚫ '}{label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Language */}
        <Section title={t('languageSettings')} tokens={tokens}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
            {LANGUAGES.map((l) => {
              const active = lang === l.id
              return (
                <button key={l.id} onClick={() => setLang(l.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', border: `2px solid ${active ? tokens.primary : tokens.border}`,
                  borderRadius: tokens.radius, background: active ? `${tokens.primary}12` : tokens.inputBg,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: tokens.fontFamily,
                }}>
                  <span style={{ fontSize: 16 }}>{l.flag}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? tokens.primary : tokens.text }}>
                      {l.label}
                    </div>
                    {l.dir === 'rtl' && (
                      <div style={{ fontSize: 10, color: tokens.textMuted }}>RTL</div>
                    )}
                    {l.id === 'id_old' && (
                      <div style={{ fontSize: 10, color: tokens.accent }}>🥚 Easter Egg</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Notifications */}
        <Section title={t('notificationSettings')} tokens={tokens}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: t('enableNotifications'), sub: 'Aktifkan semua notifikasi sistem', value: notifEnabled, onChange: setNotifEnabled },
              { label: t('notifB3'), sub: 'Notifikasi untuk limbah B3 masuk & keluar', value: notifB3, onChange: setNotifB3 },
              { label: t('notifDomestic'), sub: 'Notifikasi untuk limbah domestik', value: notifDomestic, onChange: setNotifDomestic },
            ].map(({ label, sub, value, onChange }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: tokens.text }}>{label}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{sub}</div>
                </div>
                <Toggle checked={value} onChange={onChange} tokens={tokens} />
              </div>
            ))}
          </div>
        </Section>

        {/* Help */}
        <Section title={t('helpSupport')} tokens={tokens}>
          <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
            {t('helpText')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📧', label: 'Email Support', href: 'mailto:support@ehs.co.id' },
              { icon: '📖', label: 'Dokumentasi Sistem', href: '#' },
              { icon: '🐛', label: 'Laporkan Bug', href: '#' },
            ].map(({ icon, label, href }) => (
              <a key={label} href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: tokens.bgSecondary, border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radius, textDecoration: 'none', color: tokens.text,
                  fontSize: 13, transition: 'background 0.15s', fontFamily: tokens.fontFamily,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${tokens.primary}12` }}
                onMouseLeave={(e) => { e.currentTarget.style.background = tokens.bgSecondary }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
                <span style={{ marginLeft: 'auto', color: tokens.textMuted, fontSize: 12 }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', background: tokens.bgSecondary, borderRadius: tokens.radius, border: `1px solid ${tokens.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: tokens.textMuted }}>{t('version')}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: tokens.text, fontVariantNumeric: 'tabular-nums' }}>2.4.1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: tokens.textMuted }}>{t('by')}</span>
              <span style={{ fontSize: 12, color: tokens.text }}>EHS Division</span>
            </div>
          </div>
        </Section>

        {/* Master Data Sumber Limbah */}
        <WasteSourcesManager />
      </div>

      {/* Standard Save button at end of content */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', maxWidth: 1000 }}>
        <button
          onClick={handleSave}
          style={{
            padding: '12px 28px',
            width: isMobile ? '100%' : undefined,
            background: saved ? tokens.success : tokens.primary,
            color: tokens.textInverse,
            border: 'none',
            borderRadius: tokens.radius,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: tokens.fontFamily,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {saved ? '✓ Tersimpan' : t('saveSettings')}
        </button>
      </div>
    </div>
  )
}