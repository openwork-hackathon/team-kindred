'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Flame, Clock, Award, BarChart3, ArrowUpRight } from 'lucide-react'

type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/ai' | 'k/memecoin'
type TimeRange = '24h' | '7d' | '30d'

interface MindshareEntry {
  rank: number
  name: string
  ticker: string
  category: Category
  mindshare: number
  mindshareChange: number
  staked: number
  reviews: number
  sentiment: number
  color: string
}

const MOCK_DATA: MindshareEntry[] = [
  { rank: 1, name: 'Hyperliquid', ticker: 'HYPE', category: 'k/perp-dex', mindshare: 18.4, mindshareChange: 3.2, staked: 180000, reviews: 312, sentiment: 92, color: '#8B5CF6' },
  { rank: 2, name: 'Aave V3', ticker: 'AAVE', category: 'k/defi', mindshare: 14.2, mindshareChange: -0.8, staked: 125000, reviews: 234, sentiment: 88, color: '#6366F1' },
  { rank: 3, name: 'Uniswap V4', ticker: 'UNI', category: 'k/defi', mindshare: 12.1, mindshareChange: 1.5, staked: 98000, reviews: 189, sentiment: 85, color: '#EC4899' },
  { rank: 4, name: 'ai16z', ticker: 'AI16Z', category: 'k/ai', mindshare: 9.8, mindshareChange: 5.1, staked: 92000, reviews: 167, sentiment: 78, color: '#10B981' },
  { rank: 5, name: 'POPCAT', ticker: 'POPCAT', category: 'k/memecoin', mindshare: 8.3, mindshareChange: -2.1, staked: 76000, reviews: 298, sentiment: 71, color: '#F59E0B' },
  { rank: 6, name: 'GMX V2', ticker: 'GMX', category: 'k/perp-dex', mindshare: 7.6, mindshareChange: -0.3, staked: 156000, reviews: 278, sentiment: 90, color: '#3B82F6' },
  { rank: 7, name: 'Virtuals', ticker: 'VIRTUAL', category: 'k/ai', mindshare: 6.4, mindshareChange: 8.7, staked: 45000, reviews: 89, sentiment: 82, color: '#14B8A6' },
  { rank: 8, name: 'Lido', ticker: 'LDO', category: 'k/defi', mindshare: 5.9, mindshareChange: -1.2, staked: 65000, reviews: 142, sentiment: 84, color: '#F97316' },
  { rank: 9, name: 'dYdX V4', ticker: 'DYDX', category: 'k/perp-dex', mindshare: 5.1, mindshareChange: 0.4, staked: 134000, reviews: 245, sentiment: 87, color: '#6D28D9' },
  { rank: 10, name: 'WIF', ticker: 'WIF', category: 'k/memecoin', mindshare: 4.7, mindshareChange: -3.5, staked: 54000, reviews: 187, sentiment: 65, color: '#EF4444' },
]

const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: BarChart3 },
  { id: 'k/defi' as Category, label: 'DeFi', icon: Award },
  { id: 'k/perp-dex' as Category, label: 'Perp DEX', icon: TrendingUp },
  { id: 'k/ai' as Category, label: 'AI Agents', icon: Flame },
  { id: 'k/memecoin' as Category, label: 'Memecoins', icon: Clock },
]

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

function MindshareBar({ value, color, maxValue }: { value: number; color: string; maxValue: number }) {
  const width = (value / maxValue) * 100
  return (
    <div className="w-full h-2 bg-[#1a1a1d] rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-green-400 text-sm font-medium">
      <TrendingUp className="w-3.5 h-3.5" />
      +{value.toFixed(1)}%
    </span>
  )
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-red-400 text-sm font-medium">
      <TrendingDown className="w-3.5 h-3.5" />
      {value.toFixed(1)}%
    </span>
  )
  return (
    <span className="flex items-center gap-0.5 text-[#6b6b70] text-sm font-medium">
      <Minus className="w-3.5 h-3.5" />
      0.0%
    </span>
  )
}

function SentimentDot({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-green-400' : value >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm text-[#adadb0]">{value}</span>
    </div>
  )
}

export function MindshareBoard() {
  const [category, setCategory] = useState<Category>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const filtered = category === 'all' 
    ? MOCK_DATA 
    : MOCK_DATA.filter(e => e.category === category)

  const maxMindshare = Math.max(...filtered.map(e => e.mindshare))
  const totalMindshare = filtered.reduce((sum, e) => sum + e.mindshare, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Mindshare</h1>
          <p className="text-[#6b6b70]">Community attention across Web3 projects</p>
        </div>
        
        {/* Time Range */}
        <div className="flex items-center gap-1 bg-[#111113] rounded-lg p-1 border border-[#1f1f23]">
          {(['24h', '7d', '30d'] as TimeRange[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeRange === t
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-[#6b6b70] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top Mindshare Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {filtered.slice(0, 4).map((entry) => (
          <div key={entry.name} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4 hover:border-[#2a2a2e] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                  {entry.ticker.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{entry.ticker}</div>
                  <div className="text-xs text-[#6b6b70]">#{entry.rank}</div>
                </div>
              </div>
              <ChangeIndicator value={entry.mindshareChange} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: entry.color }}>
              {entry.mindshare.toFixed(1)}%
            </div>
            <MindshareBar value={entry.mindshare} color={entry.color} maxValue={maxMindshare} />
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-[#6b6b70] hover:text-white hover:bg-[#111113] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1f1f23] text-xs font-medium text-[#6b6b70] uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Project</div>
          <div className="col-span-3">Mindshare</div>
          <div className="col-span-1 text-right">Change</div>
          <div className="col-span-1 text-right">Staked</div>
          <div className="col-span-1 text-right">Reviews</div>
          <div className="col-span-1 text-right">Sentiment</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {filtered.map((entry, i) => (
          <Link
            key={entry.name}
            href={`/project/${entry.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a1a1d] transition-colors cursor-pointer ${
              i !== filtered.length - 1 ? 'border-b border-[#1a1a1d]' : ''
            }`}
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-purple-400' : 'text-[#6b6b70]'}`}>
                {entry.rank}
              </span>
            </div>

            {/* Project */}
            <div className="col-span-3 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: entry.color + '15', color: entry.color }}
              >
                {entry.ticker.slice(0, 3)}
              </div>
              <div>
                <div className="text-sm font-semibold">{entry.name}</div>
                <div className="text-xs text-[#6b6b70]">{entry.ticker}</div>
              </div>
            </div>

            {/* Mindshare */}
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold min-w-[52px]" style={{ color: entry.color }}>
                  {entry.mindshare.toFixed(1)}%
                </span>
                <div className="flex-1">
                  <MindshareBar value={entry.mindshare} color={entry.color} maxValue={maxMindshare} />
                </div>
              </div>
            </div>

            {/* Change */}
            <div className="col-span-1 text-right">
              <ChangeIndicator value={entry.mindshareChange} />
            </div>

            {/* Staked */}
            <div className="col-span-1 text-right">
              <span className="text-sm text-[#adadb0]">{formatNumber(entry.staked)}</span>
            </div>

            {/* Reviews */}
            <div className="col-span-1 text-right">
              <span className="text-sm text-[#adadb0]">{entry.reviews}</span>
            </div>

            {/* Sentiment */}
            <div className="col-span-1 flex justify-end">
              <SentimentDot value={entry.sentiment} />
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex justify-end">
              <ArrowUpRight className="w-4 h-4 text-[#6b6b70]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 px-2 text-sm text-[#6b6b70]">
        <span>Showing {filtered.length} projects</span>
        <span>Total mindshare tracked: {totalMindshare.toFixed(1)}%</span>
      </div>
    </div>
  )
}
