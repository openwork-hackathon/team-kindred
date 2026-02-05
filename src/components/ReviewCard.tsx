'use client'

import { useState } from 'react'

interface ReviewCardProps {
  review: {
    id: string
    targetAddress: string
    reviewerAddress: string
    rating: number
    content: string
    category: string
    stakeAmount: string
    upvotes: number
    downvotes: number
    createdAt: string
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'k/memecoin': '🐸',
  'k/defi': '🏦',
  'k/perp-dex': '📈',
  'k/ai': '🤖',
  // Legacy support
  protocol: '⚡',
  token: '🪙',
  nft: '🖼️',
  product: '📦',
  service: '🛠️',
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [upvotes, setUpvotes] = useState(review.upvotes)
  const [downvotes, setDownvotes] = useState(review.downvotes)
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)

  const stakeInEth = Number(review.stakeAmount) / 1e18
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleVote = async (direction: 'up' | 'down') => {
    if (voting || voted) return

    setVoting(true)
    
    // Optimistic update
    if (direction === 'up') {
      setUpvotes(prev => prev + 1)
    } else {
      setDownvotes(prev => prev + 1)
    }
    setVoted(direction)

    try {
      const response = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })

      if (!response.ok) {
        throw new Error('Vote failed')
      }

      const data = await response.json()
      setUpvotes(data.upvotes)
      setDownvotes(data.downvotes)
    } catch (error) {
      console.error('Vote error:', error)
      // Rollback optimistic update
      if (direction === 'up') {
        setUpvotes(prev => prev - 1)
      } else {
        setDownvotes(prev => prev - 1)
      }
      setVoted(null)
      alert('Failed to vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }
  
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-kindred-primary to-orange-600 rounded-full flex items-center justify-center text-lg">
            {review.reviewerAddress.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-sm">{truncateAddress(review.reviewerAddress)}</div>
            <div className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
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
        <span className="text-lg">{CATEGORY_ICONS[review.category] || '📄'}</span>
        <span className="text-sm text-gray-400">Reviewing:</span>
        <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono">
          {truncateAddress(review.targetAddress)}
        </code>
        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full capitalize">
          {review.category}
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-4 line-clamp-3">{review.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleVote('up')}
            disabled={voting || voted === 'up'}
            className={`flex items-center gap-1 transition ${
              voted === 'up' 
                ? 'text-green-400' 
                : 'text-gray-400 hover:text-green-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>👍</span>
            <span className="text-sm font-medium">{upvotes}</span>
          </button>
          <button 
            onClick={() => handleVote('down')}
            disabled={voting || voted === 'down'}
            className={`flex items-center gap-1 transition ${
              voted === 'down' 
                ? 'text-red-400' 
                : 'text-gray-400 hover:text-red-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>👎</span>
            <span className="text-sm font-medium">{downvotes}</span>
          </button>
        </div>
        {stakeInEth > 0 && (
          <div className="flex items-center gap-1 text-kindred-primary">
            <span>💰</span>
            <span className="text-sm font-semibold">{stakeInEth} OPEN staked</span>
          </div>
        )}
      </div>
    </div>
  )
}
