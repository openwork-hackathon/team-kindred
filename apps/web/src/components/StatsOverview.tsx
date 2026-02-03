'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Users, FileText, Coins, Award } from 'lucide-react'
import { Card } from './ui'

interface PlatformStats {
  totalReviews: number
  totalStaked: number
  activeUsers: number
  avgTrustScore: number
  reviewsToday: number
  stakingAPY: number
}

export function StatsOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch - replace with real endpoint
    const fetchStats = async () => {
      await new Promise(r => setTimeout(r, 500))
      setStats({
        totalReviews: 12847,
        totalStaked: 2400000,
        activeUsers: 3291,
        avgTrustScore: 87.3,
        reviewsToday: 124,
        stakingAPY: 12.5,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-[#1f1f23] rounded w-1/2 mb-3" />
            <div className="h-8 bg-[#1f1f23] rounded w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    { 
      label: 'Total Reviews', 
      value: stats.totalReviews.toLocaleString(), 
      icon: FileText,
      change: '+12%',
      positive: true 
    },
    { 
      label: 'Total Staked', 
      value: `$${(stats.totalStaked / 1000000).toFixed(1)}M`, 
      icon: Coins,
      change: '+8%',
      positive: true 
    },
    { 
      label: 'Active Users', 
      value: stats.activeUsers.toLocaleString(), 
      icon: Users,
      change: '+24%',
      positive: true 
    },
    { 
      label: 'Avg Trust Score', 
      value: stats.avgTrustScore.toString(), 
      icon: Award,
      change: '+2.1',
      positive: true 
    },
    { 
      label: 'Reviews Today', 
      value: stats.reviewsToday.toString(), 
      icon: TrendingUp,
      change: '-5%',
      positive: false 
    },
    { 
      label: 'Staking APY', 
      value: `${stats.stakingAPY}%`, 
      icon: Coins,
      change: '',
      positive: true 
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  change, 
  positive 
}: { 
  label: string
  value: string
  icon: any
  change: string
  positive: boolean
}) {
  return (
    <Card className="relative overflow-hidden group hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5 text-[#6b6b70] group-hover:text-purple-400 transition-colors" />
        {change && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            positive ? 'text-green-500' : 'text-red-500'
          }`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-xs text-[#6b6b70] mt-1">{label}</div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  )
}

// Compact version for sidebars
export function MiniStats() {
  return (
    <div className="space-y-3 p-4 bg-[#111113] border border-[#1f1f23] rounded-xl">
      <h3 className="text-sm font-semibold text-[#6b6b70] uppercase tracking-wide">Platform Stats</h3>
      <div className="space-y-2">
        <MiniStatRow label="Reviews" value="12.8K" />
        <MiniStatRow label="Staked" value="$2.4M" />
        <MiniStatRow label="Users" value="3.3K" />
        <MiniStatRow label="APY" value="12.5%" highlight />
      </div>
    </div>
  )
}

function MiniStatRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#6b6b70]">{label}</span>
      <span className={`text-sm font-mono font-medium ${highlight ? 'text-green-500' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}
