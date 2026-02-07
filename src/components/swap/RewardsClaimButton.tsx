'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Gift, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'
import { formatEther } from 'viem'

interface RewardsClaimButtonProps {
  pendingRewards: string
  onSuccess?: () => void
}

export function RewardsClaimButton({ pendingRewards, onSuccess }: RewardsClaimButtonProps) {
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const rewardAmount = Number(pendingRewards) / 1e18
  const hasRewards = rewardAmount > 0

  const handleClaim = () => {
    writeContract({
      address: CONTRACTS.baseSepolia.kindredHookV2.address,
      abi: CONTRACTS.baseSepolia.kindredHookV2.abi,
      functionName: 'claimReferralRewards',
      args: [],
    })
  }

  if (isSuccess && onSuccess) {
    setTimeout(onSuccess, 2000)
  }

  return (
    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-400" />
          <span className="text-sm font-semibold text-white">Pending Rewards</span>
        </div>
        <span className="text-2xl font-bold text-green-400">
          {rewardAmount.toFixed(4)} ETH
        </span>
      </div>

      {hasRewards ? (
        <>
          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-bold transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isPending ? 'Confirming...' : 'Claiming...'}
              </span>
            ) : (
              'Claim Rewards'
            )}
          </button>

          {hash && (
            <div className="mt-3 p-2 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                {isConfirming && (
                  <>
                    <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                    <span className="text-slate-300">Processing...</span>
                  </>
                )}
                {isSuccess && (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-slate-300">Claimed!</span>
                  </>
                )}
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400 text-center">
          No rewards to claim yet. Keep referring!
        </p>
      )}
    </div>
  )
}
