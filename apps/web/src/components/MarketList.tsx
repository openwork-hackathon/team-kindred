'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, DollarSign, BarChart3, ExternalLink } from 'lucide-react'
import { Card } from './ui/Card'

interface Market {
  id: string
  question: string
  slug: string
  category: string
  outcomes: { name: string; price: number }[]
  volume: string
  endDate: string | null
}

export function MarketList() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')

  useEffect(() => {
    fetchMarkets()
  }, [category])

  async function fetchMarkets() {
    setLoading(true)
    try {
      const url = category === 'all' 
        ? '/api/markets' 
        : `/api/markets?category=${category}`
      const res = await fetch(url)
      const data = await res.json()
      setMarkets(data.markets || [])
    } catch (err) {
      console.error('Failed to fetch markets:', err)
    }
    setLoading(false)
  }

  const categories = ['all', 'crypto', 'politics', 'sports', 'entertainment']

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              category === cat
                ? 'bg-purple-500 text-white'
                : 'bg-[#111113] border border-[#1f1f23] text-[#adadb0] hover:border-purple-500/50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-[#1f1f23] rounded w-3/4 mb-4" />
              <div className="h-4 bg-[#1f1f23] rounded w-1/2 mb-2" />
              <div className="h-4 bg-[#1f1f23] rounded w-1/4" />
            </Card>
          ))}
        </div>
      ) : markets.length === 0 ? (
        <Card className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#6b6b70] opacity-50" />
          <p className="text-[#6b6b70]">No markets found</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  )
}

function MarketCard({ market }: { market: Market }) {
  const yesPrice = market.outcomes.find(o => o.name.toLowerCase() === 'yes')?.price || 0
  const noPrice = market.outcomes.find(o => o.name.toLowerCase() === 'no')?.price || 0

  return (
    <Card hoverable className="group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-medium line-clamp-2 group-hover:text-purple-400 transition">
          {market.question}
        </h3>
        <a 
          href={`https://polymarket.com/event/${market.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6b6b70] hover:text-white transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Probability Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-500">Yes {(yesPrice * 100).toFixed(0)}%</span>
          <span className="text-red-500">No {(noPrice * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-[#1f1f23] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            style={{ width: `${yesPrice * 100}%` }}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-[#6b6b70]">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {market.volume}
        </span>
        {market.endDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(market.endDate).toLocaleDateString()}
          </span>
        )}
        <span className="px-2 py-0.5 bg-[#1f1f23] rounded-full">
          {market.category}
        </span>
      </div>
    </Card>
  )
}
