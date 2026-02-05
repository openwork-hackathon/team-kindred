'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Flame, Clock, Award, BarChart3, ArrowUpRight } from 'lucide-react'

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/ai' | 'k/restaurants'
type TimeRange = '24h' | '7d' | '30d'

interface MindshareEntry {
  rank: number
  projectAddress: string
  projectName: string
  category: string
  avgRating: number
  reviewCount: number
  totalStaked: string
  weeklyChange: number
  predictedRank: number | null
}

interface LeaderboardResponse {
  leaderboard: MindshareEntry[]
  total: number
  categories: string[]
  lastUpdated: string
  nextSettlement: string
}

const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: BarChart3 },
  { id: 'k/defi' as Category, label: 'DeFi', icon: Award },
  { id: 'k/perp-dex' as Category, label: 'Perp DEX', icon: TrendingUp },
  { id: 'k/restaurants' as Category, label: 'Restaurants', icon: Flame },
  { id: 'k/ai' as Category, label: 'AI Agents', icon: Clock },
]

function formatNumber(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toFixed(0)
}

function MindshareBar({ value, maxValue }: { value: number; maxValue: number }) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-400 text-xs font-medium">
        <TrendingUp className="w-3 h-3" />
        +{change}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-medium">
        <TrendingDown className="w-3 h-3" />
        {change}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-gray-500 text-xs font-medium">
      <Minus className="w-3 h-3" />
      0
    </span>
  )
}

export function MindshareBoard() {
  const [category, setCategory] = useState<Category>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [data, setData] = useState<MindshareEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          category: category === 'all' ? '' : category,
          limit: '20',
        })

        const res = await fetch(`/api/leaderboard?${params}`)
        if (!res.ok) throw new Error('Failed to fetch leaderboard')

        const json: LeaderboardResponse = await res.json()
        setData(json.leaderboard)
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [category, timeRange])

  const maxMindshare = data.length > 0 ? Math.max(...data.map(d => parseFloat(d.totalStaked))) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mindshare Leaderboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Community-driven project rankings • Weekly settlement
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2a] transition-colors font-medium">
            Stake & Predict
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 pb-4 border-b border-gray-800">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                category === cat.id
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          Loading leaderboard...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 text-red-400">
          Error: {error}
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-2">
          {data.map((entry) => (
            <Link
              key={entry.projectAddress}
              href={`/projects/${entry.projectAddress}`}
              className="block bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg p-4 transition-all hover:border-gray-700 group"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 text-center">
                  <div className="text-lg font-bold text-gray-400 group-hover:text-[#FF6B35] transition-colors">
                    {entry.rank}
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold truncate group-hover:text-[#FF6B35] transition-colors">
                      {entry.projectName}
                    </h3>
                    <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded">
                      {entry.category.replace('k/', '')}
                    </span>
                    <ChangeIndicator change={entry.weeklyChange} />
                  </div>

                  <MindshareBar value={parseFloat(entry.totalStaked)} maxValue={maxMindshare} />
                </div>

                {/* Stats */}
                <div className="flex gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Staked</div>
                    <div className="font-semibold">${formatNumber(entry.totalStaked)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Reviews</div>
                    <div className="font-semibold">{entry.reviewCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Rating</div>
                    <div className="font-semibold">{entry.avgRating.toFixed(1)}★</div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-[#FF6B35] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No projects found in this category
        </div>
      )}
    </div>
  )
}
