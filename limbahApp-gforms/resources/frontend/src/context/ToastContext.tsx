import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  toast: {
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, type, message, duration }])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const toast = useMemo(
    () => ({
      success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
      error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
      info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
      warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 'min(420px, calc(100vw - 32px))',
        }}
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const typeConfig: Record<
    ToastType,
    { icon: string; bg: string; border: string; color: string; badgeBg: string }
  > = {
    success: {
      icon: '✓',
      bg: '#0f291e',
      border: 'rgba(34, 197, 94, 0.4)',
      color: '#4ade80',
      badgeBg: 'rgba(34, 197, 94, 0.2)',
    },
    error: {
      icon: '✕',
      bg: '#2d1215',
      border: 'rgba(239, 68, 68, 0.4)',
      color: '#f87171',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
    },
    warning: {
      icon: '⚠️',
      bg: '#2d2109',
      border: 'rgba(245, 158, 11, 0.4)',
      color: '#fbbf24',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
    },
    info: {
      icon: 'ℹ',
      bg: '#0f2038',
      border: 'rgba(59, 130, 246, 0.4)',
      color: '#60a5fa',
      badgeBg: 'rgba(59, 130, 246, 0.2)',
    },
  }

  const config = typeConfig[toast.type]

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 500,
        animation: 'slideUpFade 0.25s ease-out',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: config.badgeBg,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4, wordBreak: 'break-word' }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
          padding: 4,
          fontSize: 14,
          lineHeight: 1,
          flexShrink: 0,
        }}
        title="Tutup"
      >
        ✕
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
