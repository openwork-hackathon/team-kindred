'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/config/wagmi'
import { ReactNode, useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

// Single instance persisted for the lifetime of the app
let queryClientInstance: QueryClient | null = null

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: create a new instance per request
    return new QueryClient()
  }
  // Client: reuse the same instance
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient()
  }
  return queryClientInstance
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => getQueryClient(), [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#a855f7',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          modal={{ accentColor: '#a855f7' }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
