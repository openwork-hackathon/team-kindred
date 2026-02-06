'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import wallet providers with SSR disabled
// This prevents localStorage errors during server-side rendering
const WalletProviders = dynamic(
  () => import('@/components/WalletProviders').then(mod => ({ default: mod.WalletProviders })),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading skeleton during SSR/hydration
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <WalletProviders>
      {children}
    </WalletProviders>
  )
}
