'use client'

import { useState, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'

interface VerificationResult {
  verified: boolean
  address: string
  protocol: string
  chainId: number
  txCount: number
  lastTx?: string
  message: string
}

interface UseVerifyUsageReturn {
  verify: (protocol: string) => Promise<VerificationResult | null>
  isVerifying: boolean
  result: VerificationResult | null
  error: string | null
  reset: () => void
}

export function useVerifyUsage(): UseVerifyUsageReturn {
  const { address } = useAccount()
  const chainId = useChainId()
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (protocol: string): Promise<VerificationResult | null> => {
    if (!address) {
      setError('Please connect your wallet first')
      return null
    }

    setIsVerifying(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/verify-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          protocol,
          chainId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.reason || 'Verification failed')
        return null
      }

      setResult(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [address, chainId])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    verify,
    isVerifying,
    result,
    error,
    reset,
  }
}
