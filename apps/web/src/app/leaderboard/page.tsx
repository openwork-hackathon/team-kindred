import { LeaderboardPro } from '@/components/LeaderboardPro'
import { Navigation } from '@/components/Navigation'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <LeaderboardPro />
      </main>
    </div>
  )
}
