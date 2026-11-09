import { useState, type ReactNode } from 'react'
import {
  Bar, BarChart, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useApp } from '../../context'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'

export type TrendPeriod = 'weekly' | 'monthly' | 'yearly'

export interface ChartDataItem {
  name: string
  value: number
}

export interface CategoryConfig {
  id: string
  labelKey: string
  color: string
  barData: ChartDataItem[]
  weeklyData: ChartDataItem[]
  monthlyData: ChartDataItem[]
  pieData: ChartDataItem[]
  stats: { total: number; change: number; entries: number }
  unit: string
}

interface CardStatProps {
  value: number
  label: string
  change: number
  tokens: ReturnType<typeof useApp>['tokens']
}

function CardStat({ value, label, change, tokens }: CardStatProps) {
  const isIncreasing = change >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: tokens.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
        <span style={{ fontSize: 13, fontWeight: 400, color: tokens.textMuted, marginLeft: 4 }}>kg</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: isIncreasing ? '#22c55e22' : '#ef444422',
          color: isIncreasing ? '#16a34a' : '#dc2626',
        }}>
          {isIncreasing ? '▲' : '▼'} {Math.abs(change)}%
        </span>
        <span style={{ fontSize: 11, color: tokens.textMuted }}>tren periode</span>
      </div>

      <div style={{ fontSize: 12, color: tokens.textMuted }}>{label}</div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: ReactNode
  tokens: ReturnType<typeof useApp>['tokens']
  onClick?: () => void
}

function ChartCard({ title, children, tokens, onClick }: ChartCardProps) {
  const { theme } = useApp()
  const isGlass = theme === 'frosted' || theme === 'liquid'

  return (
    <div
      onClick={onClick}
      style={{
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: tokens.radius,
        padding: '14px 16px',
        boxShadow: tokens.shadow,
        backdropFilter: isGlass ? tokens.glassBlur : undefined,
        WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        fontFamily: tokens.fontFamily,
        minWidth: 0,
      }}
      onMouseEnter={(event) => {
        if (!onClick) return
        event.currentTarget.style.transform = 'translateY(-2px)'
        event.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(event) => {
        if (!onClick) return
        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow = tokens.shadow
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

interface TrendToggleProps {
  value: TrendPeriod
  onChange: (value: TrendPeriod) => void
  tokens: ReturnType<typeof useApp>['tokens']
}

function TrendToggle({ value, onChange, tokens }: TrendToggleProps) {
  const { t } = useApp()
  const options: TrendPeriod[] = ['weekly', 'monthly', 'yearly']
  const labels: Record<TrendPeriod, string> = {
    weekly: t('weekly', 'Mingguan'),
    monthly: t('monthly', 'Bulanan'),
    yearly: t('yearly', 'Tahunan'),
  }

  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onChange(option)
          }}
          style={{
            padding: '3px 8px',
            borderRadius: 4,
            border: `1px solid ${tokens.border}`,
            background: value === option ? tokens.primary : 'transparent',
            color: value === option ? tokens.textInverse : tokens.textMuted,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: tokens.fontFamily,
            fontWeight: value === option ? 600 : 400,
          }}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}

interface DashboardChartsSectionProps {
  config: CategoryConfig
  onCardClick: (id: string) => void
}

export default function DashboardChartsSection({ config, onCardClick }: DashboardChartsSectionProps) {
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('monthly')
  const [mobileTab, setMobileTab] = useState<'bar' | 'pie' | 'trend'>('bar')
  const { tokens, theme, t } = useApp()
  const isNight = theme === 'nightcity'
  const isGlass = theme === 'frosted' || theme === 'liquid'
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const trendData =
    trendPeriod === 'monthly'
      ? config.monthlyData
      : trendPeriod === 'weekly'
        ? config.weeklyData
        : config.monthlyData.slice(-5)

  const tooltipStyle = {
    contentStyle: {
      background: tokens.tooltipBg,
      border: `1px solid ${tokens.border}`,
      borderRadius: '6px',
      color: tokens.tooltipText,
      fontSize: 12,
      fontFamily: tokens.fontFamily,
    },
    itemStyle: { color: tokens.tooltipText },
    labelStyle: { color: tokens.tooltipText, fontWeight: 600 },
  }

  const pieColors = [config.color, tokens.accent, tokens.warning, tokens.success, '#a78bfa', '#fb923c', '#06b6d4', '#ec4899']
  const totalPie = config.pieData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  // Find max month in barData
  const highestMonth = [...config.barData]
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)[0]

  if (isMobile) {
    return (
      <div
        style={{
          background: tokens.card,
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: tokens.radius,
          padding: '16px',
          boxShadow: tokens.shadow,
          backdropFilter: isGlass ? tokens.glassBlur : undefined,
          WebkitBackdropFilter: isGlass ? tokens.glassBlur : undefined,
          marginBottom: 16,
          fontFamily: tokens.fontFamily,
        }}
      >
        {/* Mobile Header: Category + Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: config.color, flexShrink: 0, boxShadow: `0 0 6px ${config.color}` }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{config.labelKey}</div>
              <div style={{ fontSize: 11, color: tokens.textMuted }}>{config.stats.entries} transaksi tercatat</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: tokens.text, fontVariantNumeric: 'tabular-nums' }}>
              {config.stats.total.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
              <span style={{ fontSize: 11, color: tokens.textMuted, marginLeft: 2 }}>kg</span>
            </div>
            <button
              type="button"
              onClick={() => onCardClick(config.id)}
              style={{ background: 'none', border: 'none', color: tokens.primary, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Detail →
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div style={{ display: 'flex', background: tokens.bgSecondary, padding: 3, borderRadius: 6, gap: 4, marginBottom: 12 }}>
          {[
            { id: 'bar', label: '📊 Volume', title: 'Volume Bulanan' },
            { id: 'pie', label: '🍩 Komposisi', title: 'Komposisi Limbah' },
            { id: 'trend', label: '📈 Tren', title: 'Fluktuasi Tren' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 4,
                border: 'none',
                background: mobileTab === tab.id ? tokens.card : 'transparent',
                color: mobileTab === tab.id ? tokens.text : tokens.textMuted,
                fontWeight: mobileTab === tab.id ? 700 : 500,
                fontSize: 11.5,
                boxShadow: mobileTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontFamily: tokens.fontFamily,
                transition: 'background 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab View */}
        {mobileTab === 'bar' && (
          <div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={config.barData} barSize={16} margin={{ top: 6, right: 4, bottom: 4, left: -16 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)} kg`, '']} />
                <Bar
                  dataKey="value"
                  fill={config.color}
                  radius={[3, 3, 0, 0]}
                  style={{ filter: isNight ? `drop-shadow(0 0 4px ${config.color})` : undefined }}
                />
              </BarChart>
            </ResponsiveContainer>
            {highestMonth && (
              <div style={{ marginTop: 6, fontSize: 11, color: tokens.textMuted, textAlign: 'center', background: tokens.bgSecondary, padding: '4px 8px', borderRadius: 4 }}>
                🏆 Puncak Tertinggi: <strong style={{ color: tokens.text }}>{highestMonth.name} ({highestMonth.value.toLocaleString('id-ID')} kg)</strong>
              </div>
            )}
          </div>
        )}

        {mobileTab === 'pie' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={config.pieData.length > 0 ? config.pieData : [{ name: 'Belum ada data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {config.pieData.map((_, index) => (
                      <Cell key={`${config.id}-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')} kg`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Mini Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, borderTop: `1px solid ${tokens.border}`, paddingTop: 8 }}>
              {config.pieData.length === 0 ? (
                <span style={{ fontSize: 11, color: tokens.textMuted, textAlign: 'center' }}>Belum ada data rincian</span>
              ) : (
                (() => {
                  const sorted = [...config.pieData].sort((a, b) => Number(b.value) - Number(a.value))
                  const top3 = sorted.slice(0, 3)
                  const others = sorted.slice(3)
                  const otherTotal = others.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
                  const otherPct = totalPie > 0 ? ((otherTotal / totalPie) * 100).toFixed(0) : '0'

                  return (
                    <>
                      {top3.map((item, idx) => {
                        const pct = totalPie > 0 ? ((Number(item.value) / totalPie) * 100).toFixed(0) : '0'
                        const color = pieColors[idx % pieColors.length]
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <span style={{ color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                                {item.name}
                              </span>
                            </div>
                            <span style={{ fontWeight: 600, color: tokens.textMuted, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                              {Number(item.value).toLocaleString('id-ID')} kg ({pct}%)
                            </span>
                          </div>
                        )
                      })}

                      {others.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: tokens.textMuted, borderTop: `1px dashed ${tokens.border}`, paddingTop: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} />
                            <span>Lainnya ({others.length} jenis limbah)</span>
                          </div>
                          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                            {otherTotal.toLocaleString('id-ID')} kg ({otherPct}%)
                          </span>
                        </div>
                      )}
                    </>
                  )
                })()
              )}
            </div>
          </div>
        )}

        {mobileTab === 'trend' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <TrendToggle value={trendPeriod} onChange={setTrendPeriod} tokens={tokens} />
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')} kg`, name]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={config.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: config.color }}
                  style={{ filter: isNight ? `drop-shadow(0 0 4px ${config.color})` : undefined }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    )
  }

  // Desktop & Tablet View
  const rowColumns = isTablet ? '1fr 1fr' : '220px 1fr 220px 1fr'

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 4, height: 20, background: config.color, borderRadius: 2, boxShadow: isNight ? `0 0 8px ${config.color}` : undefined }} />
        <h2 style={{ fontSize: 15, fontWeight: 700, color: tokens.text, margin: 0, fontFamily: tokens.fontFamily }}>
          {config.labelKey}
        </h2>
        <div style={{ fontSize: 12, color: tokens.textMuted }}>
          {config.stats.entries} {t('entries', 'entri')}
        </div>
      </div>

      {/* Row: summary card + bar + pie + trend */}
      <div style={{ display: 'grid', gridTemplateColumns: rowColumns, gap: 12 }}>
        <ChartCard title={t('summary', 'Ringkasan')} tokens={tokens} onClick={() => onCardClick(config.id)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${config.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: config.color }} />
            </div>
            <CardStat
              value={config.stats.total}
              label={`${config.stats.entries} ${t('transactions', 'transaksi')}`}
              change={config.stats.change}
              tokens={tokens}
            />
          </div>
        </ChartCard>

        <ChartCard title="Volume Bulanan" tokens={tokens} onClick={() => onCardClick(config.id)}>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={config.barData} barSize={14} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)} kg`, '']} />
              <Bar
                dataKey="value"
                fill={config.color}
                radius={[2, 2, 0, 0]}
                style={{ filter: isNight ? `drop-shadow(0 0 4px ${config.color})` : undefined }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Komposisi Limbah" tokens={tokens} onClick={() => onCardClick(config.id)}>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={config.pieData.length > 0 ? config.pieData : [{ name: 'Belum ada data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={48}
                dataKey="value"
                paddingAngle={2}
              >
                {config.pieData.map((_, index) => (
                  <Cell key={`${config.id}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')} kg`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fluktuasi Tren" tokens={tokens} onClick={() => onCardClick(config.id)}>
          <TrendToggle value={trendPeriod} onChange={setTrendPeriod} tokens={tokens} />
          <ResponsiveContainer width="100%" height={96}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tokens.textMuted, fontFamily: tokens.fontFamily }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString('id-ID')} kg`, name]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                dot={false}
                style={{ filter: isNight ? `drop-shadow(0 0 4px ${config.color})` : undefined }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
