'use client'

import { useParams } from 'next/navigation'
import { CategoryFeed } from '@/components/CategoryFeed'
import { Header } from '@/components/Header'
import { CommunityInfo } from '@/components/CommunityInfo'

const CATEGORY_INFO: Record<string, { icon: string; description: string }> = {
  'defi': { icon: '🏦', description: 'DeFi protocols - Lending, DEXs, Yield' },
  'perp-dex': { icon: '📈', description: 'Perpetual DEXs - Derivatives trading' },
  'memecoin': { icon: '🐕', description: 'Memecoins - The degen corner' },
  'ai': { icon: '🤖', description: 'AI projects - ML, Agents, Data' },
  'all': { icon: '🌐', description: 'All categories' },
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  
  const info = CATEGORY_INFO[category] || { icon: '📁', description: 'Community reviews' }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          <CategoryFeed
            category={`k/${category}`}
            categoryIcon={info.icon}
            categoryDescription={info.description}
          />
        </div>

        {/* Right Sidebar - Category Community Info */}
        <div className="hidden xl:block">
          <CommunityInfo category={`k/${category}`} />
        </div>
      </div>
    </main>
  )
}
