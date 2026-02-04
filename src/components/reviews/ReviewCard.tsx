'use client'

import { Review } from '@/data/mock'

interface ReviewCardProps {
  review: Review & { category?: string } // Allow optional category injection
}

const CATEGORY_ICONS: Record<string, string> = {
  'k/memecoin': '🐸',
  'k/defi': '🏦',
  'k/perp-dex': '📈',
  'k/ai': '🤖',
}

export function ReviewCard({ review }: ReviewCardProps) {
  const stakeValue = review.stakedAmount ? Number(review.stakedAmount.replace(/,/g, '')) : 0
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-kindred-primary to-orange-600 rounded-full flex items-center justify-center text-lg">
            {review.author.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-sm">{truncateAddress(review.author)}</div>
            <div className="text-xs text-gray-500">
              {new Date(review.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-700'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{review.category ? CATEGORY_ICONS[review.category] : '📄'}</span>
        <span className="text-sm text-gray-400">Reviewing:</span>
        <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono capitalize">
          {review.projectId}
        </code>
        {review.category && (
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full capitalize">
            {review.category}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-4 line-clamp-3">{review.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition">
            <span>👍</span>
            <span className="text-sm">{review.upvotes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition">
            <span>👎</span>
            <span className="text-sm">0</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition">
            <span>💬</span>
            <span className="text-sm">{review.comments}</span>
          </button>
        </div>
        {(stakeValue > 0 || review.isNFT) && (
          <div className="flex items-center gap-2">
             {review.isNFT && (
               <span className="text-xs border border-purple-500/50 text-purple-400 px-2 py-0.5 rounded">NFT</span>
             )}
             {stakeValue > 0 && (
                <div className="flex items-center gap-1 text-kindred-primary">
                    <span>💰</span>
                    <span className="text-sm font-semibold">{stakeValue} $KIND</span>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
