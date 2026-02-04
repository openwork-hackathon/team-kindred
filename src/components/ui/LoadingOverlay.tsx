'use client'

import { useStore } from '@/lib/store'
import { LoadingIndicator } from './LoadingIndicator'

interface LoadingOverlayProps {
  operationKey?: string
  text?: string
  children?: React.ReactNode
}

export function LoadingOverlay({ 
  operationKey,
  text = 'Processing...',
  children 
}: LoadingOverlayProps) {
  const isLoading = useStore(state => 
    operationKey ? state.isLoading(operationKey) : state.anyLoading()
  )

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <LoadingIndicator size="lg" />
        <p className="text-white font-medium">{text}</p>
        {children}
      </div>
    </div>
  )
}

// Hook for easy loading state management
export function useLoading(key: string) {
  const setLoading = useStore(state => state.setLoading)
  const isLoading = useStore(state => state.isLoading(key))

  const startLoading = () => setLoading(key, true)
  const stopLoading = () => setLoading(key, false)

  const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return { isLoading, startLoading, stopLoading, withLoading }
}
