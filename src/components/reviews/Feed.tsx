'use client'

import { useState } from 'react'
import { Flame, Clock, TrendingUp, Award, SlidersHorizontal } from 'lucide-react'
import { ReviewCard } from '@/components/reviews/ReviewCard'

type SortOption = 'hot' | 'new' | 'top' | 'rising'

import { REVIEWS, Review } from '@/data/mock'

export function Feed() {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rising', label: 'Rising', icon: <Award className="w-4 h-4" /> },
  ]

  const sortedPosts = [...REVIEWS].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        // Hot = upvotes * recency factor
        const aHot = a.upvotes * (1 / (Date.now() - new Date(a.timestamp).getTime()))
        const bHot = b.upvotes * (1 / (Date.now() - new Date(b.timestamp).getTime()))
        return bHot - aHot
      case 'new':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'top':
        return b.upvotes - a.upvotes
      case 'rising':
        // Rising = high engagement rate
        return (b.upvotes + b.comments * 5) - (a.upvotes + a.comments * 5)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-4">
      {/* Sort Bar Hidden (Using external one) */}
      {/* 
      <div className="flex items-center gap-2 p-2 bg-[#111113] border border-[#1f1f23] rounded-lg">
        ...
      </div>
      */}

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-[#111113] border border-[#1f1f23] rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Time</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Min Stake</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>Any</option>
                <option>100+ $KIND</option>
                <option>500+ $KIND</option>
                <option>1000+ $KIND</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6b70] mb-2">Rating</label>
              <select className="w-full bg-[#0a0a0b] border border-[#1f1f23] rounded px-3 py-2 text-sm text-white">
                <option>All Ratings</option>
                <option>4+ Stars</option>
                <option>3+ Stars</option>
                <option>2+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {sortedPosts.map((post) => (
          <ReviewCard key={post.id} review={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <button className="px-6 py-2 bg-[#1f1f23] hover:bg-[#2a2a2e] rounded-full text-sm font-medium text-[#adadb0] transition-colors">
          Load More Reviews
        </button>
      </div>
    </div>
  )
}
