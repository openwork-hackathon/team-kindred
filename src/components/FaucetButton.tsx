'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '@/lib/contracts'
import { Gift, Loader2, Check } from 'lucide-react'

export function FaucetButton() {
  const { address } = useAccount()
  const [canClaim, setCanClaim] = useState(false)
  const [nextClaimTime, setNextClaimTime] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Check if user can claim
  useEffect(() => {
    // TODO: Add check when contract is deployed
    setCanClaim(true)
  }, [address])

  // Update countdown timer
  useEffect(() => {
    if (nextClaimTime === 0) {
      setTimeRemaining('')
      return
    }

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = nextClaimTime - now

      if (remaining <= 0) {
        setTimeRemaining('')
        setCanClaim(true)
        return
      }

      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)
      setTimeRemaining(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [nextClaimTime])

  const handleClaim = async () => {
    if (!address) return

    try {
      writeContract({
        address: CONTRACTS.baseSepolia.kindClaw.address,
        abi: CONTRACTS.baseSepolia.kindClaw.abi,
        functionName: 'claimFaucet',
      })
    } catch (error) {
      console.error('[Faucet] Claim failed:', error)
    }
  }

  if (!address) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
      >
        <Gift className="w-4 h-4 inline mr-2" />
        Connect Wallet
      </button>
    )
  }

  if (isSuccess) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm"
      >
        <Check className="w-4 h-4 inline mr-2" />
        Claimed 1000 KINDCLAW!
      </button>
    )
  }

  if (isPending || isConfirming) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 text-sm"
      >
        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
        {isPending ? 'Confirm in wallet...' : 'Claiming...'}
      </button>
    )
  }

  if (!canClaim && timeRemaining) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm cursor-not-allowed"
      >
        <Gift className="w-4 h-4 inline mr-2" />
        Claim in {timeRemaining}
      </button>
    )
  }

  return (
    <button
      onClick={handleClaim}
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all"
    >
      <Gift className="w-4 h-4 inline mr-2" />
      Claim 1000 KINDCLAW
    </button>
  )
}
