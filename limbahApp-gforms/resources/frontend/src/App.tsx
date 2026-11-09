import { useState, useEffect, lazy, Suspense } from 'react'
import { AppProvider, useApp } from './context'
import { ToastProvider } from './context/ToastContext'
import { useIsMobile } from './hooks/useMediaQuery'
import SplashScreen from './components/SplashScreen'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MobileBottomNav from './components/MobileBottomNav'

const HomePage = lazy(() => import('./components/HomePage'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const B3Page = lazy(() => import('./components/B3Page'))
const DomesticPage = lazy(() => import('./components/DomesticPage'))
const SettingsPage = lazy(() => import('./components/SettingsPage'))
const B3TransactionForm = lazy(() => import('./components/B3TransactionForm'))
const DomesticWasteForm = lazy(() => import('./components/DomesticWasteForm'))

function MainLayout() {
  const { tokens, page, isRTL, theme } = useApp()
  const isMobile = useIsMobile()

  const isGrad = tokens.bg.includes('gradient') || tokens.bg.includes('linear')
  const isNight = theme === 'nightcity'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: isGrad ? tokens.bg : undefined,
        backgroundColor: isGrad ? undefined : tokens.bg,
        fontFamily: tokens.fontFamily,
        color: tokens.text,
        position: 'relative',
      }}
    >
      {/* Night city background grid */}
      {isNight && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      )}

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom, 16px))' : '0px',
          }}
        >
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: tokens.textMuted, fontSize: 13 }}>
              Memuat...
            </div>
          }>
            {page === 'home' && <HomePage />}
            {page === 'analytics' && <Dashboard />}
            {page === 'dashboard' && <HomePage />}
            {page === 'b3' && <B3Page />}
            {page === 'domestic' && <DomesticPage />}
            {page === 'b3-in' && <B3TransactionForm type="IN" />}
            {page === 'b3-out' && <B3TransactionForm type="OUT" />}
            {page === 'waste-in' && <DomesticWasteForm direction="incoming" />}
            {page === 'waste-out' && <DomesticWasteForm direction="outgoing" />}
            {page === 'settings' && <SettingsPage />}
          </Suspense>
        </main>
      </div>

      <MobileBottomNav />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${tokens.scrollbarThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${tokens.textMuted}; }
        input::placeholder { color: ${tokens.textMuted}; opacity: 0.7; }
        input, select, button { font-family: ${tokens.fontFamily}; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${isNight ? `
          @keyframes neon-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        ` : ''}
      `}</style>
    </div>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.title = 'Monowa - Smart Waste Monitoring'
  }, [])

  if (!mounted) return null

  return (
    <AppProvider>
      <ToastProvider>
        <AppInner splashDone={splashDone} setSplashDone={setSplashDone} />
      </ToastProvider>
    </AppProvider>
  )
}

function AppInner({ splashDone, setSplashDone }: { splashDone: boolean; setSplashDone: (v: boolean) => void }) {
  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.4s ease 0.1s', height: '100vh' }}>
        <MainLayout />
      </div>
    </>
  )
}

export default App