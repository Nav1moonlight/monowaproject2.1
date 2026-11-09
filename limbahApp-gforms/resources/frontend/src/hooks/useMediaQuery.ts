import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Returns true while viewport width is <= maxWidth.
 * Uses matchMedia so it updates live on resize/rotate.
 */
export function useMediaQuery(maxWidth: number): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setMatches(e.matches)

    handler(mql)

    if (mql.addEventListener) {
      const listener = (e: MediaQueryListEvent) => handler(e)
      mql.addEventListener('change', listener)
      return () => mql.removeEventListener('change', listener)
    } else {
      // Safari fallback (older versions)
      const legacyMql = mql as MediaQueryList & {
        addListener: (l: (e: MediaQueryListEvent) => void) => void
        removeListener: (l: (e: MediaQueryListEvent) => void) => void
      }
      const listener = (e: MediaQueryListEvent) => handler(e)
      legacyMql.addListener(listener)
      return () => legacyMql.removeListener(listener)
    }
  }, [maxWidth])

  return matches
}

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_BREAKPOINT)
}

export function useIsTablet(): boolean {
  return useMediaQuery(TABLET_BREAKPOINT)
}