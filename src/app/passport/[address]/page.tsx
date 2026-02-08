'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Shield, Award } from 'lucide-react'

interface PassportData {
  address: string
  reputation: number
  reviewCount: number
  totalStaked: string
  joinedAt: string
  badges: string[]
  verified: boolean
  lastActivity: string
}

export default function PassportPage({ params }: { params: { address: string } }) {
  const [passport, setPassport] = useState<PassportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchPassport() {
      try {
        const res = await fetch(`/api/users/${params.address}/passport`)
        const data = await res.json()
        setPassport(data)
      } catch (error) {
        console.error('Failed to fetch passport:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPassport()
  }, [params.address])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🦞</div>
          <p className="text-[#6b6b70]">Loading passport...</p>
        </div>
      </div>
    )
  }

  if (!passport) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load passport</p>
        </div>
      </div>
    )
  }

  const reputationColor = 
    passport.reputation >= 75 ? 'text-green-400' :
    passport.reputation >= 50 ? 'text-yellow-400' :
    'text-orange-400'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🦞 Kindred Passport</h1>
          <p className="text-[#6b6b70]">Your reputation & trust profile</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#1a1a1d] to-[#111113] border border-purple-500/20 rounded-2xl p-8 mb-6 shadow-2xl">
          {/* Address */}
          <div className="mb-8 pb-8 border-b border-[#2a2a2e]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6b6b70] mb-1">Address</p>
                <p className="text-white font-mono text-lg">{passport.address}</p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors"
                title="Copy passport link"
              >
                <Copy className="w-5 h-5 text-[#adadb0]" />
              </button>
            </div>
            {copied && <p className="text-green-400 text-sm mt-2">✅ Copied!</p>}
          </div>

          {/* Reputation Score */}
          <div className="mb-8">
            <div className="flex items-end gap-4">
              <div className={`text-6xl font-bold ${reputationColor}`}>
                {passport.reputation}
              </div>
              <div className="mb-2">
                <p className="text-sm text-[#6b6b70]">Reputation Score</p>
                <div className="w-48 h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${passport.reputation}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8 py-8 border-y border-[#2a2a2e]">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{passport.reviewCount}</p>
              <p className="text-sm text-[#6b6b70] mt-1">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">
                {parseInt(passport.totalStaked).toLocaleString()}
              </p>
              <p className="text-sm text-[#6b6b70] mt-1">$KIND Staked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {passport.verified ? '✅' : '🔓'}
              </p>
              <p className="text-sm text-[#6b6b70] mt-1">
                {passport.verified ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </div>

          {/* Badges */}
          {passport.badges.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-medium text-[#adadb0] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges
              </p>
              <div className="flex flex-wrap gap-2">
                {passport.badges.map((badge) => (
                  <div
                    key={badge}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Joined & Last Activity */}
          <div className="text-xs text-[#6b6b70] space-y-1">
            <p>
              Joined {new Date(passport.joinedAt).toLocaleDateString()}
            </p>
            <p>
              Last active {new Date(passport.lastActivity).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Passport
          </button>
        </div>
      </div>
    </div>
  )
}
