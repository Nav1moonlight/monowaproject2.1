import React from 'react'
import { useApp } from '../../context'
import { markNotificationAsRead } from '../../api'

export interface DisplayNotification {
  id: number | string
  type: string
  title: string
  message: string
  read: boolean
  timestamp: string
}

interface NotificationPanelProps {
  tokens: ReturnType<typeof useApp>['tokens']
  isMobile: boolean
  notes: DisplayNotification[]
  setNotes: React.Dispatch<React.SetStateAction<DisplayNotification[]>>
}

export default function NotificationPanel({
  tokens,
  isMobile,
  notes,
  setNotes,
}: NotificationPanelProps) {
  const { t } = useApp()
  const unread = notes.filter((n) => !n.read).length

  const typeColor: Record<string, string> = {
    b3in: tokens.chartB3In,
    b3out: tokens.chartB3Out,
    domestic: tokens.chartDomMorning,
    alert: tokens.danger,
    B3_RECEIVED: tokens.chartB3In,
    B3_DISPATCHED: tokens.chartB3Out,
    B3_EXPIRED: tokens.danger,
    DOMESTIC_SUBMITTED: tokens.chartDomMorning,
    ALERT: tokens.danger,
  }

  const typeIcon: Record<string, string> = {
    b3in: '↓',
    b3out: '↑',
    domestic: '🏠',
    alert: '⚠',
    B3_RECEIVED: '↓',
    B3_DISPATCHED: '↑',
    B3_EXPIRED: '⚠',
    DOMESTIC_SUBMITTED: '🏠',
    ALERT: '⚠',
  }

  const handleMarkAllRead = async () => {
    const unreadItems = notes.filter((n) => !n.read)
    setNotes((prev) => prev.map((x) => ({ ...x, read: true })))
    try {
      await Promise.all(unreadItems.map((item) => markNotificationAsRead(item.id)))
    } catch {
      // Non-blocking fallback
    }
  }

  const handleMarkItemRead = async (n: DisplayNotification) => {
    if (n.read) return
    setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    try {
      await markNotificationAsRead(n.id)
    } catch {
      // Non-blocking fallback
    }
  }

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts)
      if (isNaN(d.getTime())) return ts
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch {
      return ts
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        width: isMobile ? 'min(340px, calc(100vw - 28px))' : 340,
        maxWidth: 'calc(100vw - 28px)',
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        boxShadow: `0 8px 32px rgba(0,0,0,0.15)`,
        backdropFilter: tokens.glassBlur,
        WebkitBackdropFilter: tokens.glassBlur,
        overflow: 'hidden',
        zIndex: 100,
        fontFamily: tokens.fontFamily,
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>
          {t('notifications')}
          {unread > 0 && (
            <span style={{ marginLeft: 8, background: tokens.danger, color: '#fff', fontSize: 11, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllRead}
          style={{ fontSize: 11, color: tokens.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: tokens.fontFamily }}
        >
          {t('markAllRead')}
        </button>
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>{t('noNotifications')}</div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${tokens.border}`,
                background: n.read ? 'transparent' : `${tokens.primary}08`,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => handleMarkItemRead(n)}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${typeColor[n.type] ?? tokens.primary}20`,
                  color: typeColor[n.type] ?? tokens.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0, fontWeight: 700,
                }}>
                  {typeIcon[n.type] ?? '•'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: tokens.text }}>{n.title}</span>
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: tokens.primary, flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>
                    {formatDate(n.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
