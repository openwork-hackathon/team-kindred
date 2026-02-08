'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, ShieldCheck, ExternalLink } from 'lucide-react'
import { useVerifyUsage } from '@/hooks/useVerifyUsage'

interface UsageVerificationBadgeProps {
  protocol: string
  onVerificationChange?: (verified: boolean) => void
  autoVerify?: boolean
}

export function UsageVerificationBadge({
  protocol,
  onVerificationChange,
  autoVerify = true,
}: UsageVerificationBadgeProps) {
  const { verify, isVerifying, result, error, reset } = useVerifyUsage()
  const [hasChecked, setHasChecked] = useState(false)

  // Auto-verify on mount if enabled
  useEffect(() => {
    if (autoVerify && protocol && !hasChecked) {
      setHasChecked(true)
      verify(protocol)
    }
  }, [autoVerify, protocol, hasChecked, verify])

  // Notify parent of verification status changes
  useEffect(() => {
    if (onVerificationChange && result !== null) {
      onVerificationChange(result.verified)
    }
  }, [result, onVerificationChange])

  const handleRetry = () => {
    reset()
    verify(protocol)
  }

  if (isVerifying) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        <span className="text-sm text-blue-300">Verifying on-chain usage...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
        <button
          onClick={handleRetry}
          className="text-xs text-red-400 hover:text-red-300 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (result) {
    if (result.verified) {
      return (
        <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div>
              <span className="text-sm text-green-300 font-medium">
                ✅ Verified User
              </span>
              <span className="text-xs text-green-400/70 ml-2">
                {result.txCount} tx on {result.protocol}
              </span>
            </div>
          </div>
          {result.lastTx && (
            <a
              href={`https://basescan.org/tx/${result.lastTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              View tx
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )
    } else {
      return (
        <div className="px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-orange-300 font-medium">
              Usage Verification Required
            </span>
          </div>
          <p className="text-xs text-orange-200/70 mb-3">
            You must have used {result.protocol} before you can review it.
            This ensures reviews come from real users.
          </p>
          <div className="flex gap-2">
            <a
              href={getProtocolUrl(protocol)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition"
            >
              Use {result.protocol} Now →
            </a>
            <button
              onClick={handleRetry}
              className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-sm font-medium rounded-lg transition"
            >
              Re-check
            </button>
          </div>
        </div>
      )
    }
  }

  // Initial state - not yet verified
  return (
    <button
      onClick={() => verify(protocol)}
      className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition"
    >
      <ShieldCheck className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-purple-300">Verify Protocol Usage</span>
    </button>
  )
}

function getProtocolUrl(protocol: string): string {
  const urls: Record<string, string> = {
    uniswap: 'https://app.uniswap.org/',
    aave: 'https://app.aave.com/',
    compound: 'https://app.compound.finance/',
    curve: 'https://curve.fi/',
  }
  return urls[protocol.toLowerCase()] || 'https://defillama.com/'
}
