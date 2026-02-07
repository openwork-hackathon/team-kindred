'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, Trophy, Award, Clock, Gift } from 'lucide-react'

export function EarlyDiscoveryRewards() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-full mb-4">
          <Award className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-300">Early Discovery Rewards</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Your Rewards</h1>
        <p className="text-lg text-gray-400">
          Earn rewards for discovering high-quality projects early
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-white">0 KIND</div>
          <div className="text-xs text-gray-500">Start predicting to earn</div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-white">0%</div>
          <div className="text-xs text-gray-500">No predictions yet</div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Early Bird</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-gray-500">+10% bonus each</div>
        </div>

        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Rank</span>
          </div>
          <div className="text-2xl font-bold text-white">-</div>
          <div className="text-xs text-gray-500">Start earning</div>
        </div>
      </div>

      {/* How Rewards Work */}
      <div className="bg-gradient-to-r from-orange-500/5 to-yellow-500/5 border border-orange-500/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">How Rewards Work</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💎 Prediction Accuracy</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">3x</span>
                <span>Exact rank match</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">1.5x</span>
                <span>Within ±1 rank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold">1x</span>
                <span>In top 10</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">🐦 Early Bird Bonus</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Predict within first 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Earn +10% bonus rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Compounds with accuracy multipliers</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">💰 Reward Pool</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>70% to successful predictors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>20% to protocol treasury</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>10% early bird bonus pool</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">📈 Future Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Build reputation score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Lower swap fees via v4 Hook</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Early access to new features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Start Earning Rewards</h2>
        <p className="text-gray-400 mb-6">
          Join weekly settlement rounds to predict rankings and earn rewards
        </p>
        <a
          href="/settlement"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold hover:shadow-xl transition-all"
        >
          View Settlement
        </a>
      </div>
    </div>
  )
}
