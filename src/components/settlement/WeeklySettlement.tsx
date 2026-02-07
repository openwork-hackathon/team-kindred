'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, Gift } from 'lucide-react'

export function WeeklySettlement() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Weekly Settlement</h1>
        <p className="text-lg text-gray-400">
          Predict project rankings, earn rewards for early discovery
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-12 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h2 className="text-2xl font-bold text-white mb-2">Settlement System Coming Soon</h2>
        <p className="text-gray-400 mb-6">
          Weekly ranking predictions and rewards distribution will launch after hackathon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-[#1a1a1d] border border-[#2a2a2e] rounded-xl p-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-400" />
            <h3 className="text-lg font-bold text-white mb-2">Predict Rankings</h3>
            <p className="text-sm text-gray-400">
              Stake tokens on your top 10 project predictions
            </p>
          </div>
          <div className="bg-[#1a1a1d] border border-[#2a2a2e] rounded-xl p-6">
            <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
            <h3 className="text-lg font-bold text-white mb-2">Earn Rewards</h3>
            <p className="text-sm text-gray-400">
              Get rewards based on prediction accuracy
            </p>
          </div>
          <div className="bg-[#1a1a1d] border border-[#2a2a2e] rounded-xl p-6">
            <Gift className="w-8 h-8 mx-auto mb-3 text-purple-400" />
            <h3 className="text-lg font-bold text-white mb-2">Early Bird Bonus</h3>
            <p className="text-sm text-gray-400">
              +10% rewards for predictions in first 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
