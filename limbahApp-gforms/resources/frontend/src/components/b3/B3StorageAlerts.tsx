import { useState } from 'react'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { StorageAlertItem } from '../../types/waste'

interface B3StorageAlertsProps {
  alerts: StorageAlertItem[]
  onAcknowledge?: (alertId: number | string) => void
}

export default function B3StorageAlerts({ alerts }: B3StorageAlertsProps) {
  const { tokens, t, theme } = useApp()
  const isMobile = useIsMobile()
  const isGlass = theme === 'frosted' || theme === 'liquid'
  const [selectedAlert, setSelectedAlert] = useState<StorageAlertItem | null>(null)

  if (!alerts || alerts.length === 0) return null

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Alert Header Banner */}
      <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: `${tokens.danger}20`,
              color: tokens.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span>{t('storageAlertTitle', 'Peringatan Batas Waktu Simpan B3 (PP 22/2021)')}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: `${tokens.danger}18`, color: tokens.danger }}>
            {alerts.length} perhatian
          </span>
        </div>
        <span style={{ fontSize: 11, color: tokens.textMuted }}>Klik kartu untuk melihat rincian regulasi & tindakan</span>
      </div>

      {/* Grid of Compact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
        {alerts.map((a) => {
          const isExceeded = a.urgency === 'exceeded'
          const daysLeft = a.storageDeadlineDays ?? 0

          // Calculate dynamic max days if available, default to 90
          let maxDays = 90
          if (a.date && a.storage_deadline_at) {
            const d1 = new Date(a.date).getTime()
            const d2 = new Date(a.storage_deadline_at).getTime()
            const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
            if (diff > 0) maxDays = diff
          }

          const daysInStorage = Math.max(0, maxDays - daysLeft)
          const color = isExceeded ? tokens.danger : daysLeft <= 7 ? '#f97316' : tokens.warning
          const pct = Math.min(100, Math.max(0, Math.round((daysInStorage / maxDays) * 100)))
          const barColor = isExceeded ? tokens.danger : pct > 80 ? '#f97316' : pct > 65 ? tokens.warning : tokens.success
          const wasteName = a.type || a.waste_name || 'Limbah B3'
          const wasteCode = a.wasteCode || a.waste_code || '-'
          const amount = (a.amountKg ?? a.weight_kg ?? a.weightKg ?? 0).toLocaleString('id-ID')

          return (
            <div
              key={a.id}
              onClick={() => setSelectedAlert(a)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedAlert(a) }}
              style={{
                background: tokens.card,
                border: `1px solid ${color}45`,
                borderLeft: `4px solid ${color}`,
                borderRadius: tokens.radius,
                padding: '11px 14px',
                boxShadow: tokens.shadow,
                backdropFilter: isGlass ? tokens.glassBlur : undefined,
                WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                fontFamily: tokens.fontFamily,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = tokens.shadow
                e.currentTarget.style.borderColor = `${color}45`
              }}
            >
              {/* Compact Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: tokens.text, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {wasteName}
                  </div>
                  <div style={{ color: tokens.textMuted, fontSize: 11, marginTop: 1 }}>
                    <span style={{ fontWeight: 600, color: tokens.text }}>{wasteCode}</span> • {amount} kg
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2.5px 6px',
                      borderRadius: 4,
                      background: color,
                      color: '#ffffff',
                      letterSpacing: '0.3px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isExceeded ? `${Math.abs(daysLeft)} HR LEWAT` : `${daysLeft} HR LAGI`}
                  </span>
                  <span style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1 }}>›</span>
                </div>
              </div>

              {/* Progress Bar with Mini Stats */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: tokens.textMuted, marginBottom: 3 }}>
                  <span>Tersimpan {daysInStorage}/{maxDays} hr</span>
                  <span style={{ fontWeight: 600, color: barColor }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: tokens.bgSecondary, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Detail Modal */}
      {selectedAlert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 16,
          }}
          onClick={() => setSelectedAlert(null)}
        >
          {(() => {
            const a = selectedAlert
            const isExceeded = a.urgency === 'exceeded'
            const daysLeft = a.storageDeadlineDays ?? 0

            let maxDays = 90
            if (a.date && a.storage_deadline_at) {
              const d1 = new Date(a.date).getTime()
              const d2 = new Date(a.storage_deadline_at).getTime()
              const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
              if (diff > 0) maxDays = diff
            }

            const daysInStorage = Math.max(0, maxDays - daysLeft)
            const color = isExceeded ? tokens.danger : daysLeft <= 7 ? '#f97316' : tokens.warning
            const pct = Math.min(100, Math.max(0, Math.round((daysInStorage / maxDays) * 100)))
            const barColor = isExceeded ? tokens.danger : pct > 80 ? '#f97316' : pct > 65 ? tokens.warning : tokens.success
            const wasteName = a.type || a.waste_name || 'Limbah B3'
            const wasteCode = a.wasteCode || a.waste_code || '-'
            const isCategory1 = wasteCode.toUpperCase().startsWith('A')

            return (
              <div
                style={{
                  background: tokens.card,
                  border: `1px solid ${tokens.cardBorder}`,
                  borderRadius: tokens.radius,
                  width: '100%',
                  maxWidth: 520,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                  fontFamily: tokens.fontFamily,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${tokens.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: `${color}10`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text }}>
                        Detail Kepatuhan Masa Simpan B3
                      </div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>
                        Berdasarkan PP RI No. 22 Tahun 2021 tentang Pengelolaan Limbah B3
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 18,
                      color: tokens.textMuted,
                      cursor: 'pointer',
                      padding: 4,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Status Banner */}
                  <div
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}40`,
                      borderRadius: tokens.radius,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: color, letterSpacing: '0.4px' }}>
                        Tingkat Kedaruratan Simpan
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text, marginTop: 2 }}>
                        {isExceeded
                          ? `⚠️ Melebihi Batas (${Math.abs(daysLeft)} Hari Overdue)`
                          : daysLeft <= 7
                          ? `🔥 Sangat Kritis (Tersisa ${daysLeft} Hari Lagi)`
                          : `⏳ Peringatan Dini (Tersisa ${daysLeft} Hari Lagi)`}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: color,
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {pct}% Simpan
                    </span>
                  </div>

                  {/* Waste Identity Card */}
                  <div style={{ background: tokens.bgSecondary, borderRadius: tokens.radius, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Identifikasi Limbah B3
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: tokens.textMuted }}>Nama Limbah:</span>
                        <div style={{ fontWeight: 700, color: tokens.text, marginTop: 2 }}>{wasteName}</div>
                      </div>
                      <div>
                        <span style={{ color: tokens.textMuted }}>Kode Limbah:</span>
                        <div style={{ fontWeight: 700, color: tokens.primary, marginTop: 2 }}>{wasteCode}</div>
                      </div>
                      <div>
                        <span style={{ color: tokens.textMuted }}>Jumlah / Saldo TPS:</span>
                        <div style={{ fontWeight: 800, color: tokens.text, fontSize: 13, marginTop: 2 }}>
                          {(a.amountKg ?? a.weight_kg ?? a.weightKg ?? 0).toLocaleString('id-ID')} kg
                        </div>
                      </div>
                      <div>
                        <span style={{ color: tokens.textMuted }}>Klasifikasi Bahaya:</span>
                        <div style={{ fontWeight: 600, color: isCategory1 ? tokens.danger : '#0284c7', marginTop: 2 }}>
                          {isCategory1 ? 'Kategori 1 (Akut / Tinggi)' : 'Kategori 2 (Kronis / Spesifik)'}
                        </div>
                      </div>
                      {a.source && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: tokens.textMuted }}>Sumber / Ruangan Asal:</span>
                          <div style={{ fontWeight: 600, color: tokens.text, marginTop: 2 }}>{a.source}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Storage Timeline & Progress */}
                  <div style={{ background: tokens.card, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Timeline Kepatuhan Simpan (Maks. {maxDays} Hari)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: tokens.textMuted }}>📅 Tanggal Masuk TPS:</span>
                        <div style={{ fontWeight: 600, color: tokens.text, marginTop: 2 }}>{formatDate(a.date)}</div>
                      </div>
                      <div>
                        <span style={{ color: tokens.textMuted }}>⏰ Batas Waktu Jatuh Tempo:</span>
                        <div style={{ fontWeight: 700, color: color, marginTop: 2 }}>{formatDate(a.storage_deadline_at)}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: tokens.textMuted, marginBottom: 4 }}>
                        <span>Lama Tersimpan: <strong>{daysInStorage} hari</strong></span>
                        <span>Maksimal: <strong>{maxDays} hari</strong></span>
                      </div>
                      <div style={{ height: 7, background: tokens.bgSecondary, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action Notice */}
                  <div style={{ background: `${tokens.primary}10`, border: `1px solid ${tokens.primary}30`, borderRadius: tokens.radius, padding: '12px 14px', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: tokens.primary, marginBottom: 4 }}>
                      <span>💡</span> Rekomendasi Tindakan EHS:
                    </div>
                    <div style={{ color: tokens.text, lineHeight: 1.5 }}>
                      Segera koordinasikan penjemputan dengan pihak pengolah/transporter berizin (PT PPLI / Wastec / dsb) dan terbitkan dokumen manifest Festronik resmi sebelum masa simpan berakhir.
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderTop: `1px solid ${tokens.border}`,
                    background: tokens.bgSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: tokens.radius,
                      background: 'transparent',
                      border: `1px solid ${tokens.border}`,
                      color: tokens.text,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Tutup
                  </button>

                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfjMzfJ2PBi01pyLyO6-Ad2VJbwgAGeTn6OVUxMLyLdtXtYAg/viewform"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setSelectedAlert(null)
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: tokens.radius,
                      background: tokens.primary,
                      border: 'none',
                      color: tokens.textInverse,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      textDecoration: 'none'
                    }}
                  >
                    <span>🚚</span> Buka GForm B3 Keluar ↗
                  </a>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
