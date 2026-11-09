import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ThemeId, ModeId, ThemeTokens } from './theme'
import { getTokens } from './theme'
import type { LangId } from './i18n'
import { t as translate } from './i18n'
import type { AuthUser } from './api'

import UnsavedChangesModal from './components/UnsavedChangesModal'

export type PageId = 'home' | 'dashboard' | 'analytics' | 'b3' | 'domestic' | 'b3-in' | 'b3-out' | 'waste-in' | 'waste-out' | 'settings'

interface AppCtx {
  theme: ThemeId
  mode: ModeId
  lang: LangId
  page: PageId
  tokens: ThemeTokens
  sidebarOpen: boolean
  search: string
  year: string
  periodFilter: string
  user: AuthUser | null
  token: string | null
  isLoadingAuth: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => Promise<void>
  setTheme: (t: ThemeId) => void
  setMode: (m: ModeId) => void
  setLang: (l: LangId) => void
  setPage: (p: PageId) => void
  setSidebarOpen: (o: boolean) => void
  setSearch: (s: string) => void
  setYear: (y: string) => void
  setPeriodFilter: (p: string) => void
  t: (key: string, fallback?: string) => string
  isRTL: boolean
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (v: boolean) => void
  registerUnsavedHandlers: (saveFn: () => Promise<boolean | void>, discardFn: () => void) => void
}

const Ctx = createContext<AppCtx>(null as never)

const VALID_PAGES: PageId[] = ['home', 'dashboard', 'analytics', 'b3', 'domestic', 'b3-in', 'b3-out', 'waste-in', 'waste-out', 'settings']

function getPageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'analytics' || hash === 'dashboard') return 'analytics'
  if (hash === 'home' || hash === '') return 'home'
  return VALID_PAGES.includes(hash as PageId) ? (hash as PageId) : 'home'
}

export function getPeriodDateRange(yearStr: string, periodStr: string): { from: string; to: string } {
  const y = parseInt(yearStr, 10) || new Date().getFullYear()

  if (periodStr === 'Q1') return { from: `${y}-01-01`, to: `${y}-03-31` }
  if (periodStr === 'Q2') return { from: `${y}-04-01`, to: `${y}-06-30` }
  if (periodStr === 'Q3') return { from: `${y}-07-01`, to: `${y}-09-30` }
  if (periodStr === 'Q4') return { from: `${y}-10-01`, to: `${y}-12-31` }

  if (/^\d{2}$/.test(periodStr)) {
    const m = parseInt(periodStr, 10)
    const lastDay = new Date(y, m, 0).getDate()
    const mm = m < 10 ? `0${m}` : `${m}`
    return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${lastDay}` }
  }

  return { from: `${y}-01-01`, to: `${y}-12-31` }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AuthUser | null>({
    id: 1,
    name: 'Operator EHS',
    email: 'operator@ehs.local',
    role: 'ADMIN_EHS',
  })
  const [token] = useState<string | null>('guest_token')
  const [isLoadingAuth] = useState(false)

  const [theme, setThemeState] = useState<ThemeId>(() => (localStorage.getItem('app_theme') as ThemeId) || 'corporate')
  const [mode, setModeState] = useState<ModeId>(() => (localStorage.getItem('app_mode') as ModeId) || 'light')
  const [lang, setLangState] = useState<LangId>(() => (localStorage.getItem('app_lang') as LangId) || 'id')
  const [page, setPageState] = useState<PageId>(getPageFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(() => new Date().getFullYear().toString())
  const [periodFilter, setPeriodFilter] = useState('all')

  const login = () => {}
  const logout = async () => {}

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingPage, setPendingPage] = useState<PageId | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveFnRef, setSaveFnRef] = useState<(() => Promise<boolean | void>) | null>(null)
  const [discardFnRef, setDiscardFnRef] = useState<(() => void) | null>(null)

  const registerUnsavedHandlers = (saveFn: () => Promise<boolean | void>, discardFn: () => void) => {
    setSaveFnRef(() => saveFn)
    setDiscardFnRef(() => discardFn)
  }

  const setTheme = (t: ThemeId) => {
    setThemeState(t)
    localStorage.setItem('app_theme', t)
  }

  const setMode = (m: ModeId) => {
    setModeState(m)
    localStorage.setItem('app_mode', m)
  }

  const setLang = (l: LangId) => {
    setLangState(l)
    localStorage.setItem('app_lang', l)
  }

  const setPage = (p: PageId) => {
    if (hasUnsavedChanges && p !== page) {
      setPendingPage(p)
      return
    }

    setPageState(p)
    if (window.location.hash !== `#${p}`) {
      window.location.hash = p
    }
  }

  const handleSaveAndContinue = async () => {
    if (!pendingPage) return
    setIsSaving(true)
    try {
      if (saveFnRef) {
        await saveFnRef()
      }
    } catch {
      // Non-blocking
    } finally {
      setIsSaving(false)
      setHasUnsavedChanges(false)
      const target = pendingPage
      setPendingPage(null)
      setPageState(target)
      if (window.location.hash !== `#${target}`) {
        window.location.hash = target
      }
    }
  }

  const handleDiscardAndContinue = () => {
    if (!pendingPage) return
    try {
      if (discardFnRef) {
        discardFnRef()
      }
    } catch {
      // Non-blocking
    }
    setHasUnsavedChanges(false)
    const target = pendingPage
    setPendingPage(null)
    setPageState(target)
    if (window.location.hash !== `#${target}`) {
      window.location.hash = target
    }
  }

  const handleCancelNavigation = () => {
    setPendingPage(null)
  }

  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash()
      setPageState(newPage)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const tokens = getTokens(theme, mode)

  const isRTL = lang === 'ar'

  const tFn = (key: string, fallback?: string) => translate(lang, key, fallback)

  return (
    <Ctx.Provider
      value={{
        theme,
        mode,
        lang,
        page,
        tokens,
        sidebarOpen,
        search,
        year,
        periodFilter,
        user,
        token,
        isLoadingAuth,
        login,
        logout,
        setTheme,
        setMode,
        setLang,
        setPage,
        setSidebarOpen,
        setSearch,
        setYear,
        setPeriodFilter,
        t: tFn,
        isRTL,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        registerUnsavedHandlers,
      }}
    >
      {children}
      <UnsavedChangesModal
        isOpen={!!pendingPage}
        tokens={tokens}
        isSaving={isSaving}
        onSaveAndContinue={handleSaveAndContinue}
        onDiscardAndContinue={handleDiscardAndContinue}
        onCancel={handleCancelNavigation}
      />
    </Ctx.Provider>
  )
}

export function useApp() {
  return useContext(Ctx)
}