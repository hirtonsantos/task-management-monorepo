import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = (globalThis as any).matchMedia?.(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile((globalThis as any).innerWidth < MOBILE_BREAKPOINT)
    }
    if (mql?.addEventListener) mql.addEventListener('change', onChange)
    setIsMobile((globalThis as any).innerWidth < MOBILE_BREAKPOINT)
    return () => {
      if (mql?.removeEventListener) mql.removeEventListener('change', onChange)
    }
  }, [])

  return !!isMobile
}
