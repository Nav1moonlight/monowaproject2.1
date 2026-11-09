import React, { useState } from 'react'
import { useApp } from '../../context'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { B3Transaction, DomesticTransaction } from '../../api'

interface LogbookDateStripProps {
  b3List?: B3Transaction[]
  domesticList?: DomesticTransaction[]
  loading?: boolean
}

interface DateItem {
  date: Date
  dateStr: string
  dayName: string
  dayNum: number
  isToday: boolean
  hasLog: boolean
  logCount: number
}

export default function LogbookDateStrip({ b3List = [], domesticList = [], loading = false }: LogbookDateStripProps) {
  const { tokens, setPage, theme } = useApp()
  const isMobile = useIsMobile()
  const isGlass = theme === 'frosted' || theme === 'liquid'
  const isNight = theme === 'nightcity'

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [offsetDays, setOffsetDays] = useState(0)

  const today = new Date()
  const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Count real transactions per date string
  const getLogCountForDate = (dateStr: string) => {
    const b3Count = b3List.filter((tx) => tx.date && tx.date.startsWith(dateStr)).length
    const domCount = domesticList.filter((tx) => tx.date && tx.date.startsWith(dateStr)).length
    return b3Count + domCount
  }

  const days: DateItem[] = []
  for (let i = -3; i <= 3; i++) {
    const d = new Date()
    d.setDate(today.getDate() + offsetDays + i)
    const dateStr = formatYMD(d)
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()

    const logCount = getLogCountForDate(dateStr)
    const hasLog = logCount > 0

    days.push({
      date: d,
      dateStr,
      dayName: dayNamesShort[d.getDay()] || '',
      dayNum: d.getDate(),
      isToday,
      hasLog,
      logCount,
    })
  }

  const selectedDateStr = formatYMD(selectedDate)
  const activeDay = days.find((d) => d.dateStr === selectedDateStr) || days[3]

  const monthYearStr = selectedDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      style={{
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        padding: isMobile ? '16px' : '20px 22px',
        boxShadow: tokens.shadow,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
        fontFamily: tokens.fontFamily,
        minWidth: 0,
      }}
    >
      {/* Header Info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: tokens.primary,
                background: `${tokens.primary}16`,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Logbook Harian
            </span>
            <span style={{ fontSize: 12, color: tokens.textMuted }}>
              Terakhir: <strong>Hari Ini</strong>
            </span>
          </div>

          {/* Month Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => setOffsetDays((prev) => prev - 7)}
              title="Minggu Sebelumnya"
              style={{
                background: tokens.inputBg,
                border: `1px solid ${tokens.border}`,
                color: tokens.text,
                borderRadius: 6,
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border }}
            >
              ❮
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: tokens.text, minWidth: 100, textAlign: 'center' }}>
              {monthYearStr}
            </span>
            <button
              type="button"
              onClick={() => setOffsetDays((prev) => prev + 7)}
              title="Minggu Berikutnya"
              style={{
                background: tokens.inputBg,
                border: `1px solid ${tokens.border}`,
                color: tokens.text,
                borderRadius: 6,
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border }}
            >
              ❯
            </button>
          </div>
        </div>

        {/* 7-Day Strip Carousel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            marginTop: 4,
          }}
        >
          {days.map((item, idx) => {
            const isSelected = item.dateStr === selectedDateStr

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(item.date)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: 10,
                  border: isSelected
                    ? `1.5px solid ${tokens.primary}`
                    : item.isToday
                    ? `1px solid ${tokens.primary}60`
                    : `1px solid ${tokens.cardBorder}`,
                  background: isSelected
                    ? tokens.primary
                    : item.isToday
                    ? `${tokens.primary}10`
                    : tokens.bgSecondary,
                  color: isSelected ? tokens.textInverse : tokens.text,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  position: 'relative',
                  minWidth: 0,
                  boxShadow: isSelected
                    ? isNight
                      ? `0 4px 14px ${tokens.primary}60`
                      : '0 4px 12px rgba(22, 163, 74, 0.28)'
                    : undefined,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    opacity: isSelected ? 0.9 : 0.7,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {item.dayName}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  {item.dayNum}
                </span>

                {/* Dot status */}
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    marginTop: 4,
                    background: isSelected
                      ? '#ffffff'
                      : item.hasLog
                      ? tokens.success
                      : tokens.textMuted,
                    opacity: item.hasLog ? 1 : 0.25,
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Status Bar */}
      <div
        style={{
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: loading
                ? tokens.textMuted
                : (activeDay?.hasLog ? tokens.success : tokens.warning),
            }}
          />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: tokens.text }}>
            {activeDay?.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}:
          </span>
          <span style={{ fontSize: 12.5, color: tokens.textMuted }}>
            {loading
              ? 'Memuat data logbook...'
              : activeDay?.hasLog
              ? `${activeDay.logCount} transaksi timbang tercatat di database`
              : 'Tidak ada transaksi timbang pada tanggal ini'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPage('b3')}
          style={{
            background: 'none',
            border: 'none',
            color: tokens.primary,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
        >
          <span>Buka Logbook</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
