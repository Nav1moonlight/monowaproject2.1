import { useApp } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'

export interface CategoryCardItem {
  id: string
  label: string
  value: number
  change: number
  color: string
}

interface DashboardCategoryCardsProps {
  items: CategoryCardItem[]
  onSelectCategory: (id: string) => void
}

export default function DashboardCategoryCards({
  items,
  onSelectCategory,
}: DashboardCategoryCardsProps) {
  const { tokens, year } = useApp()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isGlass = tokens.glassBg !== undefined

  const kpiColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: kpiColumns, gap: 12, marginBottom: 28 }}>
      {items.map(({ id, label, value, change, color }) => (
        <div
          key={id}
          onClick={() => onSelectCategory(id)}
          style={{
            background: tokens.card,
            border: `1px solid ${tokens.cardBorder}`,
            borderRadius: tokens.radius,
            padding: '16px 18px',
            boxShadow: tokens.shadow,
            backdropFilter: isGlass ? tokens.glassBlur : undefined,
            WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
            borderTop: `3px solid ${color}`,
            cursor: 'pointer',
            transition: 'transform 0.15s',
            minWidth: 0,
            fontFamily: tokens.fontFamily,
          }}
          onMouseEnter={(event) => { event.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(event) => { event.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: tokens.text, fontVariantNumeric: 'tabular-nums' }}>
            {value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
            <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 400, marginLeft: 3 }}>kg</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
              background: change >= 0 ? '#22c55e22' : '#ef444422',
              color: change >= 0 ? '#16a34a' : '#dc2626',
            }}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
            </span>
            <span style={{ fontSize: 11, color: tokens.textMuted }}>tahun {year}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
