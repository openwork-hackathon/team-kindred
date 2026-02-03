'use client'

import { useState } from 'react'
import { 
  Trophy, TrendingUp, TrendingDown, Minus, Users, 
  Coins, Star, ChevronRight, Flame, Crown, Medal
} from 'lucide-react'

type Category = 'all' | 'defi' | 'perp' | 'meme' | 'ai'
type TimeRange = '24h' | '7d' | '30d'

interface LeaderEntry {
  rank: number
  previousRank: number
  name: string
  symbol: string
  avatar: string
  category: Category
  score: number
  scoreChange: number
  staked: number
  reviews: number
  mindshare: number
  sparkline: number[]
}

const MOCK_DATA: LeaderEntry[] = [
  { rank: 1, previousRank: 1, name: 'Hyperliquid', symbol: 'HYPE', avatar: '🔷', category: 'perp', score: 96, scoreChange: 2.4, staked: 180000, reviews: 312, mindshare: 24.5, sparkline: [65, 72, 68, 75, 82, 88, 96] },
  { rank: 2, previousRank: 3, name: 'Aave V3', symbol: 'AAVE', avatar: '👻', category: 'defi', score: 94, scoreChange: 5.2, staked: 156000, reviews: 287, mindshare: 18.2, sparkline: [70, 75, 72, 80, 85, 89, 94] },
  { rank: 3, previousRank: 2, name: 'AI16Z', symbol: 'AI16Z', avatar: '🤖', category: 'ai', score: 91, scoreChange: -1.5, staked: 134000, reviews: 245, mindshare: 15.8, sparkline: [85, 88, 92, 90, 88, 90, 91] },
  { rank: 4, previousRank: 5, name: 'Uniswap V4', symbol: 'UNI', avatar: '🦄', category: 'defi', score: 89, scoreChange: 3.8, staked: 125000, reviews: 234, mindshare: 12.4, sparkline: [72, 75, 78, 82, 85, 87, 89] },
  { rank: 5, previousRank: 4, name: 'PEPE', symbol: 'PEPE', avatar: '🐸', category: 'meme', score: 85, scoreChange: -2.1, staked: 198000, reviews: 1892, mindshare: 10.2, sparkline: [90, 88, 85, 82, 84, 86, 85] },
  { rank: 6, previousRank: 8, name: 'GMX V2', symbol: 'GMX', avatar: '💎', category: 'perp', score: 84, scoreChange: 4.5, staked: 112000, reviews: 189, mindshare: 8.5, sparkline: [68, 72, 75, 78, 80, 82, 84] },
  { rank: 7, previousRank: 6, name: 'Virtual Protocol', symbol: 'VIRTUAL', avatar: '🎮', category: 'ai', score: 82, scoreChange: 1.2, staked: 98000, reviews: 167, mindshare: 6.8, sparkline: [75, 78, 80, 79, 81, 80, 82] },
  { rank: 8, previousRank: 7, name: 'dYdX V4', symbol: 'DYDX', avatar: '📊', category: 'perp', score: 80, scoreChange: 0.5, staked: 87000, reviews: 156, mindshare: 5.2, sparkline: [78, 79, 78, 80, 79, 80, 80] },
]

const CATEGORIES = [
  { value: 'all', label: 'All', icon: Trophy },
  { value: 'defi', label: 'DeFi', icon: Coins },
  { value: 'perp', label: 'Perp', icon: TrendingUp },
  { value: 'meme', label: 'Meme', icon: Flame },
  { value: 'ai', label: 'AI', icon: Star },
]

export function LeaderboardPro() {
  const [category, setCategory] = useState<Category>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  
  const filtered = category === 'all' 
    ? MOCK_DATA 
    : MOCK_DATA.filter(e => e.category === category)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Mindshare Leaderboard
          </h1>
          <p className="text-[#6b6b70] mt-1">Stake-weighted reputation rankings</p>
        </div>
        
        {/* Time Range */}
        <div className="flex gap-2 bg-[#111113] border border-[#1f1f23] rounded-lg p-1">
          {(['24h', '7d', '30d'] as TimeRange[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                timeRange === t 
                  ? 'bg-purple-500 text-white' 
                  : 'text-[#6b6b70] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as Category)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                category === cat.value
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-[#111113] border border-[#1f1f23] text-[#adadb0] hover:border-purple-500/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Top 3 Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.slice(0, 3).map((entry, idx) => (
          <TopCard key={entry.symbol} entry={entry} position={idx + 1} />
        ))}
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f23] text-xs text-[#6b6b70] uppercase">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Trend</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Mindshare</th>
                <th className="px-4 py-3 text-right hidden lg:table-cell">Staked</th>
                <th className="px-4 py-3 text-right hidden lg:table-cell">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(3).map(entry => (
                <LeaderRow key={entry.symbol} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TopCard({ entry, position }: { entry: LeaderEntry; position: number }) {
  const colors = {
    1: { bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/30', icon: Crown },
    2: { bg: 'from-gray-400/20 to-gray-500/5', border: 'border-gray-400/30', icon: Medal },
    3: { bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/30', icon: Medal },
  }
  const style = colors[position as keyof typeof colors]
  const Icon = style.icon

  return (
    <div className={`relative p-5 bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform`}>
      {/* Position Badge */}
      <div className="absolute top-3 right-3">
        <Icon className={`w-6 h-6 ${position === 1 ? 'text-yellow-500' : position === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
      </div>
      
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{entry.avatar}</div>
        <div>
          <div className="font-bold text-lg">{entry.name}</div>
          <div className="text-xs text-[#6b6b70]">${entry.symbol}</div>
        </div>
      </div>
      
      {/* Score */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold">{entry.score}</div>
          <div className={`text-sm flex items-center gap-1 ${entry.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {entry.scoreChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {entry.scoreChange >= 0 ? '+' : ''}{entry.scoreChange}%
          </div>
        </div>
        
        {/* Mini Sparkline */}
        <Sparkline data={entry.sparkline} />
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-[#1f1f23]">
        <div>
          <div className="text-xs text-[#6b6b70]">Mindshare</div>
          <div className="font-semibold">{entry.mindshare}%</div>
        </div>
        <div>
          <div className="text-xs text-[#6b6b70]">Reviews</div>
          <div className="font-semibold">{entry.reviews}</div>
        </div>
      </div>
    </div>
  )
}

function LeaderRow({ entry }: { entry: LeaderEntry }) {
  const rankChange = entry.previousRank - entry.rank
  
  return (
    <tr className="border-b border-[#1f1f23] hover:bg-[#1a1a1d] transition group cursor-pointer">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#6b6b70]">#{entry.rank}</span>
          {rankChange !== 0 && (
            <span className={`text-xs ${rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {rankChange > 0 ? '↑' : '↓'}{Math.abs(rankChange)}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.avatar}</span>
          <div>
            <div className="font-medium group-hover:text-purple-400 transition">{entry.name}</div>
            <div className="text-xs text-[#6b6b70]">${entry.symbol}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="font-bold">{entry.score}</span>
      </td>
      <td className="px-4 py-4 text-right hidden md:table-cell">
        <Sparkline data={entry.sparkline} small />
      </td>
      <td className="px-4 py-4 text-right hidden sm:table-cell">
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-1.5 bg-[#1f1f23] rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${entry.mindshare * 4}%` }}
            />
          </div>
          <span className="text-sm">{entry.mindshare}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right hidden lg:table-cell">
        <span className="text-green-500 font-mono">{(entry.staked / 1000).toFixed(0)}k</span>
      </td>
      <td className="px-4 py-4 text-right hidden lg:table-cell">
        <span className="text-[#6b6b70]">{entry.reviews}</span>
      </td>
    </tr>
  )
}

function Sparkline({ data, small = false }: { data: number[]; small?: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = small ? 60 : 80
  const height = small ? 20 : 30
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const isUp = data[data.length - 1] >= data[0]
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#22c55e' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
