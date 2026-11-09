export type ThemeId =
  | 'corporate'
  | 'frosted'
  | 'liquid'
  | 'flat'
  | 'highcontrast'
  | 'nightcity'

export type ModeId = 'light' | 'dark' | 'amoled'

export interface ThemeDef {
  id: ThemeId
  labelKey: string
  supportsDark: boolean
  alwaysDark: boolean
}

export const THEMES: ThemeDef[] = [
  { id: 'corporate', labelKey: 'themeCorporate', supportsDark: true, alwaysDark: false },
  { id: 'frosted', labelKey: 'themeFrosted', supportsDark: true, alwaysDark: false },
  { id: 'liquid', labelKey: 'themeLiquid', supportsDark: true, alwaysDark: false },
  { id: 'flat', labelKey: 'themeFlat', supportsDark: true, alwaysDark: false },
  { id: 'highcontrast', labelKey: 'themeHighContrast', supportsDark: false, alwaysDark: false },
  { id: 'nightcity', labelKey: 'themeNightCity', supportsDark: false, alwaysDark: true },
]

export interface ThemeTokens {
  bg: string
  bgSecondary: string
  sidebar: string
  sidebarBorder: string
  sidebarText: string
  sidebarActive: string
  sidebarActiveText: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  textInverse: string
  primary: string
  primaryHover: string
  accent: string
  border: string
  inputBg: string
  shadow: string
  chartB3In: string
  chartB3Out: string
  chartDomMorning: string
  chartDomAfternoon: string
  danger: string
  warning: string
  success: string
  headerBg: string
  headerBorder: string
  tooltipBg: string
  tooltipText: string
  scrollbarThumb: string
  radius: string
  fontFamily: string
  glassBg?: string
  glassBlur?: string
  neonGlow?: string
}

const CORPORATE_LIGHT: ThemeTokens = {
  bg: '#f0f2f5',
  bgSecondary: '#e4e7ec',
  sidebar: '#1a2332',
  sidebarBorder: '#253347',
  sidebarText: '#94a3b8',
  sidebarActive: '#16a34a',
  sidebarActiveText: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  textInverse: '#ffffff',
  primary: '#16a34a',
  primaryHover: '#15803d',
  accent: '#0ea5e9',
  border: '#e2e8f0',
  inputBg: '#ffffff',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  chartB3In: '#ef4444',
  chartB3Out: '#f97316',
  chartDomMorning: '#3b82f6',
  chartDomAfternoon: '#8b5cf6',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  headerBg: '#ffffff',
  headerBorder: '#e2e8f0',
  tooltipBg: '#1e293b',
  tooltipText: '#f8fafc',
  scrollbarThumb: '#cbd5e1',
  radius: '8px',
  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
}

const CORPORATE_DARK: ThemeTokens = {
  ...CORPORATE_LIGHT,
  bg: '#0f172a',
  bgSecondary: '#1e293b',
  sidebar: '#0a0f1a',
  sidebarBorder: '#1e293b',
  sidebarText: '#64748b',
  sidebarActive: '#16a34a',
  sidebarActiveText: '#ffffff',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
  inputBg: '#0f172a',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  headerBg: '#1e293b',
  headerBorder: '#334155',
  tooltipBg: '#334155',
  tooltipText: '#f1f5f9',
  scrollbarThumb: '#334155',
}

const CORPORATE_AMOLED: ThemeTokens = {
  ...CORPORATE_DARK,
  bg: '#000000',
  bgSecondary: '#0a0a0a',
  sidebar: '#000000',
  sidebarBorder: '#111111',
  card: '#111111',
  cardBorder: '#222222',
  border: '#1a1a1a',
  inputBg: '#000000',
  headerBg: '#000000',
  headerBorder: '#111111',
}

const FROSTED_LIGHT: ThemeTokens = {
  ...CORPORATE_LIGHT,
  bg: 'linear-gradient(135deg, #e0f2fe 0%, #dcfce7 50%, #fef9c3 100%)',
  card: 'rgba(255,255,255,0.6)',
  cardBorder: 'rgba(255,255,255,0.8)',
  shadow: '0 4px 24px rgba(0,0,0,0.06)',
  sidebar: 'rgba(15,23,42,0.85)',
  headerBg: 'rgba(255,255,255,0.7)',
  headerBorder: 'rgba(255,255,255,0.5)',
  glassBg: 'rgba(255,255,255,0.55)',
  glassBlur: 'blur(16px)',
  radius: '12px',
  inputBg: 'rgba(255,255,255,0.7)',
}

const FROSTED_DARK: ThemeTokens = {
  ...CORPORATE_DARK,
  bg: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #0f1a14 100%)',
  card: 'rgba(30,41,59,0.7)',
  cardBorder: 'rgba(255,255,255,0.08)',
  glassBg: 'rgba(30,41,59,0.6)',
  glassBlur: 'blur(16px)',
  headerBg: 'rgba(15,23,42,0.8)',
  headerBorder: 'rgba(255,255,255,0.08)',
  radius: '12px',
}

const FROSTED_AMOLED: ThemeTokens = {
  ...FROSTED_DARK,
  bg: 'linear-gradient(135deg, #000000 0%, #0a0f14 100%)',
  card: 'rgba(10,10,10,0.8)',
  cardBorder: 'rgba(255,255,255,0.06)',
  sidebar: 'rgba(0,0,0,0.95)',
  headerBg: 'rgba(0,0,0,0.9)',
}

const LIQUID_LIGHT: ThemeTokens = {
  ...CORPORATE_LIGHT,
  bg: 'linear-gradient(160deg, #c7d2fe 0%, #a7f3d0 40%, #fde68a 100%)',
  card: 'rgba(255,255,255,0.45)',
  cardBorder: 'rgba(255,255,255,0.9)',
  shadow: '0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
  glassBg: 'rgba(255,255,255,0.4)',
  glassBlur: 'blur(20px)',
  radius: '16px',
  sidebar: 'rgba(15,23,42,0.9)',
  headerBg: 'rgba(255,255,255,0.5)',
  headerBorder: 'rgba(255,255,255,0.6)',
  inputBg: 'rgba(255,255,255,0.6)',
}

const LIQUID_DARK: ThemeTokens = {
  ...CORPORATE_DARK,
  bg: 'linear-gradient(160deg, #1e1b4b 0%, #0f2d1f 40%, #1c1309 100%)',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.12)',
  glassBg: 'rgba(255,255,255,0.05)',
  glassBlur: 'blur(20px)',
  shadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  radius: '16px',
  headerBg: 'rgba(15,23,42,0.7)',
  headerBorder: 'rgba(255,255,255,0.08)',
}

const LIQUID_AMOLED: ThemeTokens = {
  ...LIQUID_DARK,
  bg: '#000000',
  card: 'rgba(255,255,255,0.04)',
  sidebar: '#000000',
}

const FLAT_LIGHT: ThemeTokens = {
  ...CORPORATE_LIGHT,
  shadow: 'none',
  cardBorder: '#d1d5db',
  radius: '4px',
  sidebar: '#111827',
  sidebarBorder: '#1f2937',
  fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
}

const FLAT_DARK: ThemeTokens = {
  ...CORPORATE_DARK,
  shadow: 'none',
  radius: '4px',
  cardBorder: '#374151',
  fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
}

const FLAT_AMOLED: ThemeTokens = {
  ...FLAT_DARK,
  bg: '#000000',
  card: '#0d0d0d',
  sidebar: '#000000',
  sidebarBorder: '#111111',
  border: '#1a1a1a',
  headerBg: '#000000',
}

const HIGHCONTRAST: ThemeTokens = {
  bg: '#ffffff',
  bgSecondary: '#f3f4f6',
  sidebar: '#000000',
  sidebarBorder: '#000000',
  sidebarText: '#d1d5db',
  sidebarActive: '#facc15',
  sidebarActiveText: '#000000',
  card: '#ffffff',
  cardBorder: '#000000',
  text: '#000000',
  textMuted: '#374151',
  textInverse: '#ffffff',
  primary: '#000000',
  primaryHover: '#111827',
  accent: '#dc2626',
  border: '#000000',
  inputBg: '#ffffff',
  shadow: '2px 2px 0 #000000',
  chartB3In: '#dc2626',
  chartB3Out: '#b45309',
  chartDomMorning: '#1d4ed8',
  chartDomAfternoon: '#6d28d9',
  danger: '#dc2626',
  warning: '#b45309',
  success: '#15803d',
  headerBg: '#ffffff',
  headerBorder: '#000000',
  tooltipBg: '#000000',
  tooltipText: '#ffffff',
  scrollbarThumb: '#6b7280',
  radius: '2px',
  fontFamily: '"Inter", system-ui, sans-serif',
}

const NIGHTCITY: ThemeTokens = {
  bg: '#020408',
  bgSecondary: '#050b12',
  sidebar: '#000000',
  sidebarBorder: '#0ff',
  sidebarText: '#4a9eff',
  sidebarActive: '#00ffff',
  sidebarActiveText: '#000000',
  card: '#060d14',
  cardBorder: '#0a2a3a',
  text: '#e0f4ff',
  textMuted: '#4a9eff',
  textInverse: '#000000',
  primary: '#00ffff',
  primaryHover: '#00cccc',
  accent: '#ff00aa',
  border: '#0a2a3a',
  inputBg: '#020408',
  shadow: '0 0 20px rgba(0,255,255,0.1)',
  chartB3In: '#ff0055',
  chartB3Out: '#ff6600',
  chartDomMorning: '#00aaff',
  chartDomAfternoon: '#aa00ff',
  danger: '#ff0055',
  warning: '#ffaa00',
  success: '#00ff88',
  headerBg: '#000000',
  headerBorder: '#0a2a3a',
  tooltipBg: '#00ffff',
  tooltipText: '#000000',
  scrollbarThumb: '#0a2a3a',
  radius: '4px',
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  neonGlow: '0 0 10px rgba(0,255,255,0.5)',
}

export type ThemeKey = `${ThemeId}_${ModeId}`

export const THEME_TOKENS: Record<string, ThemeTokens> = {
  corporate_light: CORPORATE_LIGHT,
  corporate_dark: CORPORATE_DARK,
  corporate_amoled: CORPORATE_AMOLED,
  frosted_light: FROSTED_LIGHT,
  frosted_dark: FROSTED_DARK,
  frosted_amoled: FROSTED_AMOLED,
  liquid_light: LIQUID_LIGHT,
  liquid_dark: LIQUID_DARK,
  liquid_amoled: LIQUID_AMOLED,
  flat_light: FLAT_LIGHT,
  flat_dark: FLAT_DARK,
  flat_amoled: FLAT_AMOLED,
  highcontrast_light: HIGHCONTRAST,
  nightcity_light: NIGHTCITY,
}

export function getTokens(theme: ThemeId, mode: ModeId): ThemeTokens {
  const key = `${theme}_${mode}`
  return THEME_TOKENS[key] ?? THEME_TOKENS['corporate_light']!
}
