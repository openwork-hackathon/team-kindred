'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import {
  useKindBalance,
  useKindAllowance,
  useApproveKind,
  parseKind,
} from '@/hooks/useKindToken'
import {
  useUpvote,
  useDownvote,
  useNetScore,
} from '@/hooks/useKindredComment'

interface VoteButtonsProps {
  tokenId: bigint
  currentUpvotes?: number
  currentDownvotes?: number
}

export function VoteButtons({ tokenId, currentUpvotes = 0, currentDownvotes = 0 }: VoteButtonsProps) {
  const { address } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('10')
  const [showStakeInput, setShowStakeInput] = useState(false)
  
  // Token state
  const { data: balance } = useKindBalance(address)
  const { data: allowance } = useKindAllowance(address)
  const { approve, isPending: isApproving } = useApproveKind()
  
  // Vote actions
  const { upvote, isPending: isUpvoting } = useUpvote()
  const { downvote, isPending: isDownvoting } = useDownvote()
  const { data: netScore } = useNetScore(tokenId)
  
  // Check approval
  const stakeAmountBigInt = parseKind(stakeAmount)
  const needsApproval = !allowance || (allowance as bigint) < stakeAmountBigInt
  const hasBalance = balance && (balance as bigint) >= stakeAmountBigInt
  
  const handleUpvote = () => {
    if (needsApproval || !hasBalance) return
    upvote(tokenId, stakeAmountBigInt)
    setShowStakeInput(false)
  }
  
  const handleDownvote = () => {
    if (needsApproval || !hasBalance) return
    downvote(tokenId, stakeAmountBigInt)
    setShowStakeInput(false)
  }
  
  const handleApprove = () => {
    approve(parseKind('1000000'))
  }
  
  // Display net score from contract if available
  const displayScore = netScore !== undefined 
    ? Number(netScore) 
    : (currentUpvotes - currentDownvotes)
  
  const isVoting = isUpvoting || isDownvoting
  
  return (
    <div className="flex items-center gap-2">
      {/* Upvote */}
      <button
        onClick={handleUpvote}
        disabled={isVoting || needsApproval || !hasBalance}
        className={`flex items-center gap-1 px-2 py-1 rounded-md border transition ${
          isUpvoting 
            ? 'border-green-500 bg-green-500/20 text-green-400' 
            : 'border-gray-700 hover:border-green-500 hover:bg-green-500/10 text-gray-400 hover:text-green-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Upvote (stake to support)"
      >
        {isUpvoting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>
      
      {/* Score Display */}
      <span 
        className={`min-w-[40px] text-center font-bold text-sm ${
          displayScore > 0 ? 'text-green-400' : 
          displayScore < 0 ? 'text-red-400' : 
          'text-gray-400'
        }`}
      >
        {displayScore > 0 ? '+' : ''}{displayScore}
      </span>
      
      {/* Downvote */}
      <button
        onClick={handleDownvote}
        disabled={isVoting || needsApproval || !hasBalance}
        className={`flex items-center gap-1 px-2 py-1 rounded-md border transition ${
          isDownvoting 
            ? 'border-red-500 bg-red-500/20 text-red-400' 
            : 'border-gray-700 hover:border-red-500 hover:bg-red-500/10 text-gray-400 hover:text-red-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Downvote (stake to oppose)"
      >
        {isDownvoting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {/* Stake Amount Input (Toggle) */}
      <button
        onClick={() => setShowStakeInput(!showStakeInput)}
        className="ml-2 text-xs text-gray-500 hover:text-gray-300 transition"
      >
        {stakeAmount} KIND
      </button>
      
      {showStakeInput && (
        <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <label className="block text-xs text-gray-400 mb-2">Stake Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              min="1"
              step="1"
            />
            <button
              onClick={() => setShowStakeInput(false)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              ✓
            </button>
          </div>
          {!hasBalance && (
            <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
          )}
        </div>
      )}
      
      {/* Approval Required Notice */}
      {needsApproval && (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="ml-2 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
        >
          {isApproving ? 'Approving...' : 'Approve First'}
        </button>
      )}
    </div>
  )
}
