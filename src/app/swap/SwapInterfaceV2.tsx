'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CircleWalletButton } from '@/components/CircleWalletButton'
import { ArrowDownUp, Shield, Award } from 'lucide-react'
import { useSwapETHForUSDC, useSwapUSDCForETH } from '@/hooks/useSimpleSwap'
import { PriorityBadge } from '@/components/swap/PriorityBadge'
import { ReferralWidget } from '@/components/swap/ReferralWidget'

const FEE_HIGH_TRUST = 0.15
const FEE_MEDIUM_TRUST = 0.22
const FEE_LOW_TRUST = 0.30

const HIGH_TRUST_THRESHOLD = 850
const MEDIUM_TRUST_THRESHOLD = 600
const MIN_SCORE_TO_TRADE = 100

function calculateFee(score: number): number {
  if (score >= HIGH_TRUST_THRESHOLD) return FEE_HIGH_TRUST
  if (score >= MEDIUM_TRUST_THRESHOLD) return FEE_MEDIUM_TRUST
  return FEE_LOW_TRUST
}

export default function SwapInterfaceV2() {
  const { address, isConnected } = useAccount()
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('0.0')
  const [fromToken, setFromToken] = useState<'ETH' | 'USDC'>('ETH')
  const [toToken, setToToken] = useState<'ETH' | 'USDC'>('USDC')
  const [reputation, setReputation] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const { swapETHForUSDC } = useSwapETHForUSDC()
  const { swapUSDCForETH } = useSwapUSDCForETH()

  // Fetch reputation from API
  useEffect(() => {
    if (!address) return

    const fetchReputation = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reputation?address=${address}`)
        const data = await res.json()
        setReputation(data.score || 0)
      } catch (error) {
        console.error('Failed to fetch reputation:', error)
        setReputation(500) // Default
      } finally {
        setLoading(false)
      }
    }

    fetchReputation()
  }, [address])

  // Calculate output amount
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setToAmount('0.0')
      return
    }

    const amount = parseFloat(fromAmount)
    const fee = reputation !== null ? calculateFee(reputation) : FEE_LOW_TRUST
    
    if (fromToken === 'ETH' && toToken === 'USDC') {
      // 1 ETH = 2000 USDC
      const output = amount * 2000 * (1 - fee / 100)
      setToAmount(output.toFixed(2))
    } else if (fromToken === 'USDC' && toToken === 'ETH') {
      // 1 USDC = 0.0005 ETH
      const output = amount * 0.0005 * (1 - fee / 100)
      setToAmount(output.toFixed(6))
    }
  }, [fromAmount, fromToken, toToken, reputation])

  const handleFlip = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount('')
    setToAmount('0.0')
  }

  const handleSwap = async () => {
    if (!address || !fromAmount || parseFloat(fromAmount) <= 0) return

    try {
      if (fromToken === 'ETH' && toToken === 'USDC') {
        await swapETHForUSDC(fromAmount, toAmount)
      } else if (fromToken === 'USDC' && toToken === 'ETH') {
        await swapUSDCForETH(fromAmount, toAmount)
      }
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Swap</h2>
          <p className="text-slate-400 mb-8">
            Connect to see your reputation, priority level, and start trading with dynamic fees
          </p>
          <CircleWalletButton />
        </div>
      </div>
    )
  }

  const fee = reputation !== null ? calculateFee(reputation) : FEE_LOW_TRUST
  const canTrade = reputation !== null && reputation >= MIN_SCORE_TO_TRADE

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Left Column - Info Cards */}
      <div className="lg:col-span-1 space-y-4">
        {/* Priority & MEV Protection */}
        <PriorityBadge reputation={reputation || 0} />

        {/* Referral Program */}
        <ReferralWidget reputation={reputation || 0} />
      </div>

      {/* Center Column - Swap Interface */}
      <div className="lg:col-span-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Reputation Swap</h2>
                <p className="text-sm text-slate-400">Fee: {fee}% • Priority Protection</p>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-slate-400 animate-pulse">Loading...</div>
            ) : (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{reputation}</div>
                <div className="text-xs text-slate-400">Reputation</div>
              </div>
            )}
          </div>

          {/* From Token */}
          <div className="mb-3">
            <label className="block text-sm text-slate-400 mb-2">From</label>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-3xl font-bold outline-none w-full text-white"
                  disabled={!canTrade}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <span className="text-2xl">{fromToken === 'ETH' ? 'Ξ' : '$'}</span>
                  <span className="text-lg font-semibold text-white">{fromToken}</span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Balance: {fromToken === 'ETH' ? '0.5' : '1,234.56'} {fromToken}
              </div>
            </div>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleFlip}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl p-3 transition-all hover:scale-110"
              disabled={!canTrade}
            >
              <ArrowDownUp className="w-5 h-5 text-purple-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">To (estimated)</label>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-white">{toAmount}</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <span className="text-2xl">{toToken === 'ETH' ? 'Ξ' : '$'}</span>
                  <span className="text-lg font-semibold text-white">{toToken}</span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Balance: {toToken === 'ETH' ? '0.5' : '1,234.56'} {toToken}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          <div className="mb-6 p-4 bg-black/20 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Exchange Rate</span>
              <span className="text-white font-medium">
                1 {fromToken} = {fromToken === 'ETH' ? '2,000' : '0.0005'} {toToken}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Fee ({fee}%)</span>
              <span className="text-white font-medium">
                {(parseFloat(fromAmount || '0') * (fee / 100)).toFixed(6)} {fromToken}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Minimum Received</span>
              <span className="text-white font-medium">
                {(parseFloat(toAmount) * 0.995).toFixed(6)} {toToken}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!canTrade || !fromAmount || parseFloat(fromAmount) <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              canTrade && fromAmount && parseFloat(fromAmount) > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!canTrade
              ? `Insufficient Reputation (Need ${MIN_SCORE_TO_TRADE})`
              : !fromAmount || parseFloat(fromAmount) <= 0
              ? 'Enter Amount'
              : 'Swap'}
          </button>

          {/* Warning for low rep */}
          {reputation !== null && reputation < MIN_SCORE_TO_TRADE && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">
                ⚠️ Your reputation is too low to trade. Build reputation by creating reviews 
                and participating in the Kindred community.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
