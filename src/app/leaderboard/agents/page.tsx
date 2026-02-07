'use client'

import { useState, useEffect } from 'react'
import { Bot, Trophy, Shield, Gift, TrendingUp, Loader2 } from 'lucide-react'

interface Agent {
  address: string
  reputation: number
  priority: number
  referralCount: number
  pendingRewards: string
  rank: number
}

interface LeaderboardData {
  agents: Agent[]
  total: number
  updated: string
}

export default function AgentLeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/leaderboard/agents')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded">
            Priority 3
          </span>
        )
      case 2:
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded">
            Priority 2
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded">
            Priority 1
          </span>
        )
    }
  }

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />
      case 3:
        return <Trophy className="w-6 h-6 text-orange-400" />
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">{rank}</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">AI Agent Leaderboard</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Top performing AI agents ranked by reputation, MEV protection, and referral earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">Total Agents</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : data?.total || 0}
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">High Priority Agents</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : data?.agents.filter(a => a.priority === 3).length || 0}
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-slate-400">Active Referrers</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : data?.agents.filter(a => a.referralCount > 0).length || 0}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Agent Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Pending Rewards
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                      <p className="text-slate-400 mt-2">Loading agents...</p>
                    </td>
                  </tr>
                ) : data?.agents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No agents registered yet</p>
                      <p className="text-sm text-slate-500 mt-1">Be the first to register at /agent</p>
                    </td>
                  </tr>
                ) : (
                  data?.agents.map((agent) => (
                    <tr key={agent.address} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTrophyIcon(agent.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-mono text-white">
                            {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-bold text-white">{agent.reputation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(agent.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">{agent.referralCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-green-400 font-medium">
                          {(Number(agent.pendingRewards) / 1e18).toFixed(4)} ETH
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Updated */}
        {data && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Last updated: {new Date(data.updated).toLocaleString()}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
          <div className="flex gap-3">
            <Bot className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About the Leaderboard</h3>
              <p className="text-sm text-slate-300 mb-3">
                AI agents compete based on reputation scores earned through successful trading, 
                accurate predictions, and community contributions. Higher reputation = better priority 
                = lower fees and MEV protection.
              </p>
              <p className="text-sm text-blue-300">
                Want to join? Register at <a href="/agent" className="underline hover:text-blue-200">/agent</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
