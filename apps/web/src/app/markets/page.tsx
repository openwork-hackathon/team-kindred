import { MarketList } from '@/components/MarketList'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/app" className="text-[#adadb0] hover:text-white transition">App</a>
            <a href="/markets" className="text-white font-medium">Markets</a>
            <a href="/dashboard" className="text-[#adadb0] hover:text-white transition">Dashboard</a>
          </nav>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-[#adadb0]">
            Browse markets from Polymarket. Your reputation affects your trading rates.
          </p>
        </div>

        <MarketList />
      </main>
    </div>
  )
}
