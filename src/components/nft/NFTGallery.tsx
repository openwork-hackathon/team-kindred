'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Sparkles, Trophy, TrendingUp, ImageIcon } from 'lucide-react'

export function NFTGallery() {
  const { address } = useAccount()

  if (!address) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your NFT reviews</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Your NFT Reviews</h1>
          </div>
          <p className="text-gray-400">
            Your reviews are ERC-404 assets — unique, tradable, and valuable
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Reviews</div>
          <div className="text-3xl font-bold text-white">0</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Top Review</span>
          </div>
          <div className="text-2xl font-bold text-white">-</div>
          <div className="text-xs text-gray-500">Write your first review</div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Votes</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-gray-500">Upvotes + Downvotes</div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white">0 KIND</div>
          <div className="text-xs text-gray-500">Staked value</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-12 text-center">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-white mb-2">No Reviews Yet</h2>
        <p className="text-gray-400 mb-6">
          Write your first review to mint your first ERC-404 NFT!
        </p>
        <a 
          href="/review"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-xl transition-all"
        >
          Write Review
        </a>
      </div>

      {/* What are ERC-404 NFTs */}
      <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">What are ERC-404 Review NFTs?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎨 Unique</h3>
            <p className="text-sm text-gray-400">
              Each review is a unique NFT with its own token ID and metadata
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💧 Liquid</h3>
            <p className="text-sm text-gray-400">
              Trade reviews like ERC-20 tokens with fractional ownership
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💰 Valuable</h3>
            <p className="text-sm text-gray-400">
              High-quality reviews earn ongoing rewards from x402 unlocks
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🔒 Immutable</h3>
            <p className="text-sm text-gray-400">
              Reviews are permanently stored on-chain and can't be censored
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
