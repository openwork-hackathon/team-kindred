'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { 
  Wallet, TrendingUp, TrendingDown, RefreshCw, 
  PlusCircle, X, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'
import { usePositions, useToken } from '@/hooks'

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const { 
    positions, 
    isLoading, 
    error, 
    totalValue, 
    totalPnl, 
    openCount,
    refetch,
    closePosition 
  } = usePositions({ 
    address, 
    autoRefresh: 30000 
  })
  
  const { token } = useToken()
  const [closingId, setClosingId] = useState<string | null>(null)

  const handleClose = async (positionId: string) => {
    setClosingId(positionId)
    try {
      await closePosition(positionId)
    } finally {
      setClosingId(null)
    }
  }

  const pnlNum = parseFloat(totalPnl)
  const isProfitable = pnlNum >= 0

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/app" className="text-sm text-[#adadb0] hover:text-white">App</Link>
            <Link href="/markets" className="text-sm text-[#adadb0] hover:text-white">Markets</Link>
            <Link href="/portfolio" className="text-sm text-purple-400">Portfolio</Link>
            <Link href="/leaderboard" className="text-sm text-[#adadb0] hover:text-white">Leaderboard</Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-[#6b6b70]" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-[#adadb0] mb-8">
              Connect your wallet to view and manage your prediction market positions.
            </p>
            <ConnectButton />
          </div>
        )}

        {/* Connected State */}
        {isConnected && (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <SummaryCard 
                label="Portfolio Value" 
                value={`$${totalValue}`}
                icon={Wallet}
              />
              <SummaryCard 
                label="Total P&L" 
                value={`${isProfitable ? '+' : ''}$${totalPnl}`}
                icon={isProfitable ? TrendingUp : TrendingDown}
                positive={isProfitable}
                negative={!isProfitable && pnlNum !== 0}
              />
              <SummaryCard 
                label="Open Positions" 
                value={openCount.toString()}
                icon={PlusCircle}
              />
              <SummaryCard 
                label="$KIND Price" 
                value={token?.currentPrice || '0.001'}
                icon={TrendingUp}
                suffix=" OPENWORK"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Positions</h2>
              <div className="flex items-center gap-3">
                <Link 
                  href="/markets"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Position
                </Link>
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-sm text-[#adadb0] hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && positions.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-[#6b6b70]" />
              </div>
            )}

            {/* Positions List */}
            {positions.length > 0 && (
              <div className="space-y-4">
                {positions.map((position) => (
                  <PositionCard 
                    key={position.id} 
                    position={position}
                    onClose={() => handleClose(position.id)}
                    isClosing={closingId === position.id}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && positions.length === 0 && (
              <div className="text-center py-20 bg-[#111113] border border-[#1f1f23] rounded-xl">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">No Positions Yet</h3>
                <p className="text-[#6b6b70] mb-6">
                  Start trading prediction markets to build your portfolio
                </p>
                <Link 
                  href="/markets"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Explore Markets
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ 
  label, 
  value, 
  icon: Icon, 
  positive, 
  negative,
  suffix 
}: { 
  label: string
  value: string
  icon: any
  positive?: boolean
  negative?: boolean
  suffix?: string
}) {
  return (
    <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          positive ? 'bg-green-500/10' : 
          negative ? 'bg-red-500/10' : 
          'bg-purple-500/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            positive ? 'text-green-500' : 
            negative ? 'text-red-500' : 
            'text-purple-400'
          }`} />
        </div>
        <span className="text-sm text-[#6b6b70]">{label}</span>
      </div>
      <div className={`text-2xl font-bold font-mono ${
        positive ? 'text-green-500' : 
        negative ? 'text-red-500' : 
        'text-white'
      }`}>
        {value}{suffix && <span className="text-sm text-[#6b6b70]">{suffix}</span>}
      </div>
    </div>
  )
}

function PositionCard({ 
  position, 
  onClose, 
  isClosing 
}: { 
  position: any
  onClose: () => void
  isClosing: boolean
}) {
  const isProfitable = position.pnl >= 0
  const isOpen = position.status === 'open'
  
  return (
    <div className={`p-5 bg-[#111113] border rounded-xl transition-colors ${
      isOpen ? 'border-[#1f1f23] hover:border-purple-500/30' : 'border-[#1f1f23]/50 opacity-75'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              position.outcome === 'yes' 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {position.outcome.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              isOpen ? 'bg-purple-500/10 text-purple-400' : 'bg-[#1f1f23] text-[#6b6b70]'
            }`}>
              {position.status}
            </span>
          </div>
          <h3 className="font-semibold mb-1">{position.marketQuestion}</h3>
          <p className="text-sm text-[#6b6b70]">
            {position.shares} shares @ {(position.avgPrice * 100).toFixed(0)}¢
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end mb-1">
            {isProfitable ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-lg font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? '+' : ''}{position.pnlPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-[#6b6b70]">
            P&L: ${position.pnl.toFixed(2)}
          </p>
          <p className="text-xs text-[#6b6b70]">
            Current: {(position.currentPrice * 100).toFixed(0)}¢
          </p>
        </div>
      </div>

      {isOpen && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1f1f23]">
          <button
            onClick={onClose}
            disabled={isClosing}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {isClosing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Close Position
          </button>
          <Link
            href={`/markets/${position.marketId}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f1f23] rounded-lg text-sm text-[#adadb0] hover:text-white transition-colors"
          >
            View Market
          </Link>
        </div>
      )}
    </div>
  )
}
