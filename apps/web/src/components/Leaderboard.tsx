'use client'

import { useState } from 'react'

type Category = 'k/memecoin' | 'k/defi' | 'k/perp-dex' | 'k/ai'

interface LeaderboardEntry {
  rank: number
  previousRank: number | null
  projectName: string
  projectAddress: string
  category: Category
  score: number
  totalStaked: string
  reviewCount: number
  weeklyChange: number
}

const MOCK_LEADERBOARD: Record<Category, LeaderboardEntry[]> = {
  'k/defi': [
    { rank: 1, previousRank: 1, projectName: 'Aave V3', projectAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', category: 'k/defi', score: 94, totalStaked: '125000', reviewCount: 234, weeklyChange: 0 },
    { rank: 2, previousRank: 3, projectName: 'Uniswap V4', projectAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984', category: 'k/defi', score: 91, totalStaked: '98000', reviewCount: 189, weeklyChange: 2 },
    { rank: 3, previousRank: 2, projectName: 'Compound III', projectAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', category: 'k/defi', score: 88, totalStaked: '87000', reviewCount: 156, weeklyChange: -1 },
    { rank: 4, previousRank: 5, projectName: 'Lido', projectAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', category: 'k/defi', score: 85, totalStaked: '76000', reviewCount: 142, weeklyChange: 1 },
    { rank: 5, previousRank: 4, projectName: 'MakerDAO', projectAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', category: 'k/defi', score: 82, totalStaked: '65000', reviewCount: 128, weeklyChange: -1 },
  ],
  'k/perp-dex': [
    { rank: 1, previousRank: 2, projectName: 'Hyperliquid', projectAddress: '0x1234567890123456789012345678901234567890', category: 'k/perp-dex', score: 96, totalStaked: '180000', reviewCount: 312, weeklyChange: 1 },
    { rank: 2, previousRank: 1, projectName: 'GMX V2', projectAddress: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', category: 'k/perp-dex', score: 93, totalStaked: '156000', reviewCount: 278, weeklyChange: -1 },
    { rank: 3, previousRank: 3, projectName: 'dYdX V4', projectAddress: '0x92D6C1e31e14520e676a687F0a93788B716BEff5', category: 'k/perp-dex', score: 89, totalStaked: '134000', reviewCount: 245, weeklyChange: 0 },
    { rank: 4, previousRank: 6, projectName: 'Vertex', projectAddress: '0x2345678901234567890123456789012345678901', category: 'k/perp-dex', score: 84, totalStaked: '98000', reviewCount: 167, weeklyChange: 2 },
    { rank: 5, previousRank: 4, projectName: 'Gains Network', projectAddress: '0x3456789012345678901234567890123456789012', category: 'k/perp-dex', score: 81, totalStaked: '76000', reviewCount: 134, weeklyChange: -1 },
  ],
  'k/memecoin': [
    { rank: 1, previousRank: 1, projectName: 'PEPE', projectAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', category: 'k/memecoin', score: 78, totalStaked: '234000', reviewCount: 1892, weeklyChange: 0 },
    { rank: 2, previousRank: 4, projectName: 'WIF', projectAddress: '0x4567890123456789012345678901234567890123', category: 'k/memecoin', score: 75, totalStaked: '198000', reviewCount: 1456, weeklyChange: 2 },
    { rank: 3, previousRank: 2, projectName: 'BONK', projectAddress: '0x5678901234567890123456789012345678901234', category: 'k/memecoin', score: 72, totalStaked: '167000', reviewCount: 1234, weeklyChange: -1 },
    { rank: 4, previousRank: 3, projectName: 'FLOKI', projectAddress: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E', category: 'k/memecoin', score: 69, totalStaked: '145000', reviewCount: 987, weeklyChange: -1 },
    { rank: 5, previousRank: null, projectName: 'TRUMP', projectAddress: '0x6789012345678901234567890123456789012345', category: 'k/memecoin', score: 65, totalStaked: '123000', reviewCount: 876, weeklyChange: 0 },
  ],
  'k/ai': [
    { rank: 1, previousRank: 1, projectName: 'AI16Z', projectAddress: '0x7890123456789012345678901234567890123456', category: 'k/ai', score: 88, totalStaked: '156000', reviewCount: 456, weeklyChange: 0 },
    { rank: 2, previousRank: 3, projectName: 'Virtual Protocol', projectAddress: '0x8901234567890123456789012345678901234567', category: 'k/ai', score: 84, totalStaked: '134000', reviewCount: 389, weeklyChange: 1 },
    { rank: 3, previousRank: 2, projectName: 'Griffain', projectAddress: '0x9012345678901234567890123456789012345678', category: 'k/ai', score: 81, totalStaked: '112000', reviewCount: 334, weeklyChange: -1 },
    { rank: 4, previousRank: 5, projectName: 'Fetch.ai', projectAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85', category: 'k/ai', score: 78, totalStaked: '98000', reviewCount: 287, weeklyChange: 1 },
    { rank: 5, previousRank: 4, projectName: 'SingularityNET', projectAddress: '0x5B7533812759B45C2B44C19e320ba2cD2681b542', category: 'k/ai', score: 75, totalStaked: '87000', reviewCount: 234, weeklyChange: -1 },
  ],
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'k/defi', label: 'DeFi', icon: '🏦' },
  { value: 'k/perp-dex', label: 'Perp DEX', icon: '📈' },
  { value: 'k/memecoin', label: 'Memecoins', icon: '🐸' },
  { value: 'k/ai', label: 'AI Agents', icon: '🤖' },
]

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('k/defi')
  const entries = MOCK_LEADERBOARD[selectedCategory]

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-400">▲{change}</span>
    if (change < 0) return <span className="text-red-400">▼{Math.abs(change)}</span>
    return <span className="text-gray-500">―</span>
  }

  const getWeekEndDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSunday = 7 - dayOfWeek
    const sunday = new Date(now)
    sunday.setDate(now.getDate() + daysUntilSunday)
    return sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🏆 Weekly Rankings</h2>
            <p className="text-gray-400 text-sm">Stake-weighted community rankings</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Settles</div>
            <div className="text-kindred-primary font-semibold">{getWeekEndDate()}</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                selectedCategory === cat.value
                  ? 'bg-kindred-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr className="text-left text-gray-500 text-sm">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3 text-right">Score</th>
              <th className="px-6 py-3 text-right">Staked</th>
              <th className="px-6 py-3 text-right">Reviews</th>
              <th className="px-6 py-3 text-center">Change</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr 
                key={entry.projectAddress}
                className={`border-t border-gray-800 hover:bg-gray-900/30 transition ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-400' :
                      entry.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold">{entry.projectName}</div>
                    <code className="text-xs text-gray-500">{truncateAddress(entry.projectAddress)}</code>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-kindred-primary/20 rounded text-kindred-primary font-semibold">
                    {entry.score}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-green-400 font-mono">
                    {(Number(entry.totalStaked) / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-500">OPEN</div>
                </td>
                <td className="px-6 py-4 text-right text-gray-400">
                  {entry.reviewCount}
                </td>
                <td className="px-6 py-4 text-center">
                  {getRankChangeIcon(entry.weeklyChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">
          Rankings are calculated based on stake-weighted reviews. 
          <a href="/review" className="text-kindred-primary hover:underline ml-1">
            Submit your prediction →
          </a>
        </p>
      </div>
    </div>
  )
}
