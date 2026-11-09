import { useApp } from '../../context'

export default function PeriodFilterPicker({ isMobile }: { isMobile: boolean }) {
  const { tokens, year, setYear, periodFilter, setPeriodFilter } = useApp()

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - 4 + i).toString())
  if (year && !yearOptions.includes(year)) {
    yearOptions.push(year)
    yearOptions.sort()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      {/* Year filter */}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={{
          padding: isMobile ? '5px 4px' : '5px 10px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          color: tokens.text,
          fontSize: isMobile ? 12 : 13,
          fontFamily: tokens.fontFamily,
          cursor: 'pointer',
          outline: 'none',
          flexShrink: 0,
          width: isMobile ? 74 : undefined,
        }}
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Period filter */}
      <select
        value={periodFilter}
        onChange={(e) => setPeriodFilter(e.target.value)}
        style={{
          padding: isMobile ? '5px 4px' : '5px 10px',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius,
          color: tokens.text,
          fontSize: isMobile ? 12 : 13,
          fontFamily: tokens.fontFamily,
          cursor: 'pointer',
          outline: 'none',
          flexShrink: 0,
          maxWidth: isMobile ? 110 : undefined,
        }}
      >
        <option value="all">Semua Periode</option>
        <optgroup label="Kuartal">
          <option value="Q1">Q1 (Jan - Mar)</option>
          <option value="Q2">Q2 (Apr - Jun)</option>
          <option value="Q3">Q3 (Jul - Sep)</option>
          <option value="Q4">Q4 (Okt - Des)</option>
        </optgroup>
        <optgroup label="Bulan">
          <option value="01">Januari</option>
          <option value="02">Februari</option>
          <option value="03">Maret</option>
          <option value="04">April</option>
          <option value="05">Mei</option>
          <option value="06">Juni</option>
          <option value="07">Juli</option>
          <option value="08">Agustus</option>
          <option value="09">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </optgroup>
      </select>
    </div>
  )
}
