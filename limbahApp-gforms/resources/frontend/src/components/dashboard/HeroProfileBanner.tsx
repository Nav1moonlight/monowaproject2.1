import React, { useState } from 'react'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { exportToCSV, exportToPrintPDF } from '../../utils/exportUtils'
import type { B3Transaction } from '../../api'

interface HeroProfileBannerProps {
  b3List?: B3Transaction[]
}

export default function HeroProfileBanner({ b3List = [] }: HeroProfileBannerProps) {
  const { tokens, year, user, setPage, theme } = useApp()
  const isMobile = useIsMobile()
  const [showInputMenu, setShowInputMenu] = useState(false)

  const isGlass = theme === 'frosted' || theme === 'liquid'
  const isNight = theme === 'nightcity'

  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long' })
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat Pagi'
    if (hour >= 11 && hour < 15) return 'Selamat Siang'
    if (hour >= 15 && hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }
  const greeting = getGreeting()
  const displayName = user?.name ? user.name.split(' ')[0] : 'Petugas TPS'

  // Handle Export Excel
  const handleExportExcel = () => {
    const headers = ['ID', 'Tanggal', 'Kode Limbah', 'Nama Limbah', 'Tipe', 'Berat (Kg)', 'Status', 'Sumber/Tujuan']
    const rows = b3List.map((tx) => [
      tx.id,
      tx.date ? tx.date.slice(0, 10) : '-',
      (tx as any).waste_code || (tx as any).wasteCode || '-',
      (tx as any).waste_name || (tx as any).type || '-',
      (tx as any).transaction_type || tx.category || '-',
      (tx as any).weight_kg || (tx as any).amountKg || 0,
      tx.status || 'processed',
      (tx as any).source || (tx as any).destination || '-',
    ])

    exportToCSV(`Neraca_Limbah_B3_${year}_${currentMonthName}`, headers, rows)
  }

  // Handle Export PDF
  const handleExportPDF = () => {
    const headers = ['ID', 'Tanggal', 'Kode Limbah', 'Nama Limbah', 'Tipe', 'Berat (Kg)', 'Status']
    const rows = b3List.map((tx) => [
      tx.id,
      tx.date ? tx.date.slice(0, 10) : '-',
      (tx as any).waste_code || (tx as any).wasteCode || '-',
      (tx as any).waste_name || (tx as any).type || '-',
      (tx as any).transaction_type || tx.category || '-',
      `${(tx as any).weight_kg || (tx as any).amountKg || 0} kg`,
      tx.status || 'processed',
    ])

    exportToPrintPDF(
      'Laporan Neraca & Mutasi Limbah B3',
      `Periode: ${currentMonthName} ${year}`,
      headers,
      rows
    )
  }

  return (
    <div
      style={{
        background: isNight
          ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : `linear-gradient(135deg, ${tokens.card} 0%, ${tokens.bgSecondary} 100%)`,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        padding: isMobile ? '18px' : '22px 26px',
        boxShadow: tokens.shadow,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        marginBottom: 20,
        position: 'relative',
        fontFamily: tokens.fontFamily,
      }}
    >
      {/* Decorative accent top line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent}, #10b981)`,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left Welcome Details */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${tokens.primary}18`,
              border: `1px solid ${tokens.primary}40`,
              color: tokens.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isNight ? `0 0 14px ${tokens.primary}50` : undefined,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: tokens.primary,
                  background: `${tokens.primary}18`,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                🌿 MONOWA EHS PORTAL
              </span>
              <span style={{ fontSize: 12, color: tokens.textMuted }}>
                • Periode: <strong style={{ color: tokens.text }}>1 {currentMonthName} – 31 {currentMonthName} {year}</strong>
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 18 : 22,
                fontWeight: 800,
                color: tokens.text,
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
              }}
            >
              {greeting}, {displayName}
            </h1>

            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 13,
                color: tokens.textMuted,
                lineHeight: 1.45,
              }}
            >
              Masa simpan TPS terpantau tertib regulasi. Semua logbook operasional siap dipantau.
            </p>
          </div>
        </div>

        {/* Right Action Buttons (Fino Style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'flex-start' : 'flex-end',
            position: 'relative',
          }}
        >
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            title="Download Rekap CSV / Excel"
            style={{
              padding: '9px 14px',
              background: tokens.inputBg,
              border: `1px solid ${tokens.border}`,
              color: tokens.text,
              borderRadius: tokens.radius,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
              boxShadow: tokens.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tokens.primary
              e.currentTarget.style.color = tokens.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.border
              e.currentTarget.style.color = tokens.text
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Unduh Excel</span>
          </button>

          {/* PDF Berita Acara Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            title="Cetak Laporan PDF Resmi"
            style={{
              padding: '9px 14px',
              background: tokens.inputBg,
              border: `1px solid ${tokens.border}`,
              color: tokens.text,
              borderRadius: tokens.radius,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
              boxShadow: tokens.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tokens.primary
              e.currentTarget.style.color = tokens.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.border
              e.currentTarget.style.color = tokens.text
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15h6" />
            </svg>
            <span>Cetak PDF</span>
          </button>

          {/* Quick Input Button with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowInputMenu(!showInputMenu)}
              style={{
                padding: '9px 16px',
                background: tokens.primary,
                border: 'none',
                color: tokens.textInverse,
                borderRadius: tokens.radius,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                boxShadow: isNight
                  ? `0 4px 14px ${tokens.primary}50`
                  : '0 4px 12px rgba(22, 163, 74, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
              <span>Input Timbang</span>
              <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showInputMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: tokens.card,
                  border: `1px solid ${tokens.cardBorder}`,
                  borderRadius: 8,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  minWidth: 190,
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowInputMenu(false)
                    setPage('b3-in')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: tokens.text,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderBottom: `1px solid ${tokens.border}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgSecondary }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ color: tokens.chartB3In }}>●</span>
                  <span>Input Limbah B3 Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowInputMenu(false)
                    setPage('b3-out')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: tokens.text,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderBottom: `1px solid ${tokens.border}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgSecondary }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ color: tokens.chartB3Out }}>●</span>
                  <span>Input Limbah B3 Keluar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowInputMenu(false)
                    setPage('waste-in')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: tokens.text,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgSecondary }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ color: tokens.chartDomMorning }}>●</span>
                  <span>Input Domestik Masuk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
