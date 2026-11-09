import { useState, useRef, useEffect } from 'react'
import { useApp, type PageId } from '../context'
import { getNotifications, triggerGoogleSheetsSync } from '../api'
import { useIsMobile } from '../hooks/useMediaQuery'
import NotificationPanel, { type DisplayNotification } from './header/NotificationPanel'
import ExportControls from './header/ExportControls'
import PeriodFilterPicker from './header/PeriodFilterPicker'

const PAGE_TITLES: Record<PageId, string> = {
  home: 'home',
  dashboard: 'home',
  analytics: 'dashboardAnalytics',
  b3: 'b3Waste',
  domestic: 'domesticWaste',
  'b3-in': 'menuB3In',
  'b3-out': 'menuB3Out',
  'waste-in': 'menuWasteIn',
  'waste-out': 'menuWasteOut',
  settings: 'settings',
}

export default function Header() {
  const {
    tokens,
    page,
    t,
    theme,
    sidebarOpen,
    setSidebarOpen,
    search,
    setSearch,
  } = useApp()

  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const [notes, setNotes] = useState<DisplayNotification[]>([])

  const fetchLatestNotifications = () => {
    getNotifications({ include_read: true, per_page: 20 })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(
            data.map((n) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              read: Boolean(n.is_read ?? n.read),
              timestamp: n.created_at ?? n.timestamp ?? new Date().toISOString(),
            }))
          )
        }
      })
      .catch(() => {
        // Safe fallback
      })
  }

  useEffect(() => {
    fetchLatestNotifications()
    const interval = setInterval(fetchLatestNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatusText, setSyncStatusText] = useState<string>('Live GSheets')

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncStatusText('Sinkronisasi...')
    try {
      const res = await triggerGoogleSheetsSync()
      const b3 = res.summary?.b3_synced ?? 0
      const dom = res.summary?.domestic_synced ?? 0
      setSyncStatusText(`Sync Berhasil (+${b3 + dom})`)
      setTimeout(() => setSyncStatusText('Live GSheets'), 4000)
    } catch {
      setSyncStatusText('Sync Gagal')
      setTimeout(() => setSyncStatusText('Live GSheets'), 3000)
    } finally {
      setIsSyncing(false)
    }
  }

  const unreadCount = notes.filter((n) => !n.read).length
  const isGlass = theme === 'frosted' || theme === 'liquid'

  const syncButton = (
    <button
      onClick={handleManualSync}
      disabled={isSyncing}
      title="Sinkronkan data terbaru dari Google Sheets"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: isMobile ? '6px 10px' : '6px 12px',
        borderRadius: 20,
        border: `1px solid ${isSyncing ? tokens.primary : tokens.border}`,
        background: isSyncing ? `${tokens.primary}18` : tokens.inputBg,
        color: isSyncing ? tokens.primary : tokens.text,
        fontSize: isMobile ? 11 : 12,
        fontWeight: 600,
        cursor: isSyncing ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isSyncing ? '#f59e0b' : '#10b981',
          boxShadow: isSyncing ? '0 0 8px #f59e0b' : '0 0 6px #10b981',
          display: 'inline-block',
        }}
      />
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isSyncing ? 'rotate(360deg)' : 'none',
          transition: isSyncing ? 'transform 1s linear infinite' : 'none',
        }}
      >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
      </svg>
      <span>{syncStatusText}</span>
    </button>
  )

  const notifBell = (
    <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setShowNotif((v) => !v)}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: `1px solid ${tokens.border}`,
          background: showNotif ? `${tokens.primary}18` : tokens.inputBg,
          color: tokens.text,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.15s',
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 15,
              height: 15,
              background: tokens.danger,
              color: '#fff',
              borderRadius: '50%',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${tokens.card}`,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotif && (
        <NotificationPanel
          tokens={tokens}
          isMobile={isMobile}
          notes={notes}
          setNotes={setNotes}
        />
      )}
    </div>
  )

  const searchInput = (
    <>
      <svg
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={tokens.text}
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus={isMobile}
        style={{
          width: '100%',
          padding: search ? '6px 28px 6px 32px' : '6px 12px 6px 32px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          fontSize: 13,
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          outline: 'none',
        }}
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: tokens.textMuted,
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: 1,
            padding: '2px 4px',
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </>
  )

  if (isMobile) {
    return (
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 12px 10px',
          gap: 8,
          background: isGlass ? (tokens.glassBg ?? tokens.headerBg) : tokens.headerBg,
          backdropFilter: isGlass ? tokens.glassBlur : undefined,
          WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
          borderBottom: `1px solid ${tokens.headerBorder}`,
          zIndex: 10,
          flexShrink: 0,
          fontFamily: tokens.fontFamily,
        }}
      >
        {/* Row 1: Nav button + Title + Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open menu"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: `1px solid ${tokens.border}`,
                background: tokens.inputBg,
                color: tokens.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: tokens.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t(PAGE_TITLES[page])}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {syncButton}
            <ExportControls isMobile={isMobile} />
            {notifBell}
          </div>
        </div>

        {/* Row 2: Search Input + Period Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            {searchInput}
          </div>
          <PeriodFilterPicker isMobile={isMobile} />
        </div>
      </header>
    )
  }

  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        background: isGlass ? (tokens.glassBg ?? tokens.headerBg) : tokens.headerBg,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        borderBottom: `1px solid ${tokens.headerBorder}`,
        zIndex: 10,
        flexShrink: 0,
        fontFamily: tokens.fontFamily,
        position: 'relative',
      }}
    >
      {/* Page title */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: tokens.text,
          flex: '0 0 auto',
          whiteSpace: 'nowrap',
        }}
      >
        {t(PAGE_TITLES[page])}
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div
        style={{
          marginLeft: 'auto',
          flex: 1,
          maxWidth: 320,
          position: 'relative',
          minWidth: 120,
        }}
      >
        {searchInput}
      </div>

      {/* Year & Period filters */}
      <PeriodFilterPicker isMobile={isMobile} />

      {/* Quick Export button */}
      <ExportControls isMobile={isMobile} />

      {/* Manual Sync GSheets button */}
      {syncButton}

      {/* Notification bell */}
      {notifBell}
    </header>
  )
}