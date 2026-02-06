'use client'

import { CategoryFeed } from '@/components/CategoryFeed'
import { Header } from '@/components/Header'
import { CommunityInfo } from '@/components/project/CommunityInfo'

interface CategoryPageClientProps {
  category: string
  categoryIcon: string
  categoryDescription: string
}

export function CategoryPageClient({
  category,
  categoryIcon,
  categoryDescription,
}: CategoryPageClientProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* SEO-friendly header (hidden but crawlable) */}
          <h1 className="sr-only">
            {categoryIcon} {category === 'all' ? 'All Reviews' : `${category.charAt(0).toUpperCase() + category.slice(1)} Reviews`} - Kindred
          </h1>
          
          <CategoryFeed
            category={`k/${category}`}
            categoryIcon={categoryIcon}
            categoryDescription={categoryDescription}
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
