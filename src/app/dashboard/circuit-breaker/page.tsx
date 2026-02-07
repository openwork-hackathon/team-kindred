'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react'

interface CircuitBreakerEvent {
  timestamp: string
  trader: string
  swapAmount: string
  poolSize: string
  percentage: number
  blocked: boolean
}

export default function CircuitBreakerDashboard() {
  const [events, setEvents] = useState<CircuitBreakerEvent[]>([])
  const [stats, setStats] = useState({
    totalWarnings: 0,
    totalBlocks: 0,
    averageSwapSize: 0,
    largestSwap: 0,
  })

  useEffect(() => {
    // Mock data - in production, query CircuitBreakerWarning events from contract
    const mockEvents: CircuitBreakerEvent[] = [
      {
        timestamp: new Date().toISOString(),
        trader: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        swapAmount: '500',
        poolSize: '10000',
        percentage: 5.0,
        blocked: false,
      },
    ]

    setEvents(mockEvents)
    setStats({
      totalWarnings: mockEvents.filter(e => !e.blocked).length,
      totalBlocks: mockEvents.filter(e => e.blocked).length,
      averageSwapSize: 250,
      largestSwap: 500,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Circuit Breaker Monitor</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Real-time monitoring of large swaps and potential rug pulls
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">Warnings (5%)</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.totalWarnings}</div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400">Blocks (10%)</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.totalBlocks}</div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Avg Swap Size</span>
            </div>
            <div className="text-3xl font-bold text-white">${stats.averageSwapSize}</div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">Largest Swap</span>
            </div>
            <div className="text-3xl font-bold text-white">${stats.largestSwap}</div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Recent Events</h2>
            <p className="text-sm text-slate-400 mt-1">
              Swaps exceeding 5% of pool size trigger warnings
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    Swap Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    Pool Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No circuit breaker events yet</p>
                      <p className="text-sm text-slate-500 mt-1">All swaps within safe limits</p>
                    </td>
                  </tr>
                ) : (
                  events.map((event, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-white">
                          {event.trader.slice(0, 6)}...{event.trader.slice(-4)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ${event.swapAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        ${event.poolSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          event.percentage >= 10 ? 'text-red-400' :
                          event.percentage >= 5 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {event.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.blocked ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded">
                            🚫 Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded">
                            ⚠️ Warning
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How Circuit Breaker Works</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <strong className="text-white">Warning Threshold (5%):</strong> Swaps exceeding 5% 
                  of pool size trigger warnings and increased monitoring.
                </p>
                <p>
                  <strong className="text-white">Block Threshold (10%):</strong> Swaps exceeding 10% 
                  are blocked to prevent rug pulls and protect liquidity providers.
                </p>
                <p>
                  <strong className="text-white">Low-Reputation Traders:</strong> Extra scrutiny 
                  applied to traders with reputation below 600.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
