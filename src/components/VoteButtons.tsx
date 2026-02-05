'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface VoteButtonsProps {
  initialScore: number
  userVote?: 'up' | 'down' | null
  onVote?: (vote: 'up' | 'down') => void | Promise<void>
  reviewId?: string
  size?: 'sm' | 'md' | 'lg'
  horizontal?: boolean
}

export function VoteButtons({ 
  initialScore, 
  userVote: initialUserVote = null,
  onVote,
  reviewId,
  size = 'md',
  horizontal = false
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote)
  const [voting, setVoting] = useState(false)

  const handleVote = async (vote: 'up' | 'down') => {
    if (voting || userVote) return

    let newScore = initialScore
    let newVote: 'up' | 'down' | null = vote

    if (userVote === vote) {
      // Clicking same vote = remove vote (only for local mode)
      if (!reviewId) {
        newVote = null
        newScore = initialScore
      } else {
        return // In API mode, don't allow un-voting
      }
    } else if (userVote === null) {
      // No previous vote
      newScore = initialScore + (vote === 'up' ? 1 : -1)
    } else {
      // Switching vote
      newScore = initialScore + (vote === 'up' ? 2 : -2)
    }

    // Optimistic update
    setScore(newScore)
    setUserVote(newVote)

    // API mode
    if (reviewId) {
      setVoting(true)
      try {
        const response = await fetch(`/api/reviews/${reviewId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction: vote }),
        })

        if (!response.ok) {
          throw new Error('Vote failed')
        }

        const data = await response.json()
        setScore(data.netScore)
      } catch (error) {
        console.error('Vote error:', error)
        // Rollback
        setScore(initialScore)
        setUserVote(initialUserVote)
      } finally {
        setVoting(false)
      }
    }

    // Callback mode
    if (onVote) {
      await onVote(vote)
    }
  }

  const sizeClasses = {
    sm: { container: 'gap-0.5', button: 'p-0.5', icon: 'w-4 h-4', text: 'text-xs' },
    md: { container: 'gap-1', button: 'p-1', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'gap-1.5', button: 'p-1.5', icon: 'w-6 h-6', text: 'text-base' },
  }

  const s = sizeClasses[size]

  return (
    <div className={`flex ${horizontal ? 'flex-row' : 'flex-col'} items-center ${s.container}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={voting || userVote === 'up'}
        className={`${s.button} rounded hover:bg-green-500/20 transition-colors ${
          userVote === 'up' ? 'text-green-500' : 'text-[#6b6b70] hover:text-green-500'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Upvote"
      >
        <ChevronUp className={s.icon} strokeWidth={userVote === 'up' ? 3 : 2} />
      </button>
      
      <span className={`${s.text} font-bold min-w-[2ch] text-center ${
        userVote === 'up' ? 'text-green-500' : 
        userVote === 'down' ? 'text-red-500' : 
        'text-[#adadb0]'
      }`}>
        {formatScore(score)}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={voting || userVote === 'down'}
        className={`${s.button} rounded hover:bg-red-500/20 transition-colors ${
          userVote === 'down' ? 'text-red-500' : 'text-[#6b6b70] hover:text-red-500'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Downvote"
      >
        <ChevronDown className={s.icon} strokeWidth={userVote === 'down' ? 3 : 2} />
      </button>
    </div>
  )
}

function formatScore(score: number): string {
  if (score >= 10000) {
    return `${(score / 1000).toFixed(0)}k`
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`
  }
  return score.toString()
}
