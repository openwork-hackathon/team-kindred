import { useState, useCallback } from 'react'

interface UseVoteOptions {
  reviewId: string
  initialUpvotes: number
  initialDownvotes: number
}

export function useVote({ reviewId, initialUpvotes, initialDownvotes }: UseVoteOptions) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)

  const vote = useCallback(async (direction: 'up' | 'down') => {
    if (voting || userVote) return

    setVoting(true)
    
    // Optimistic update
    if (direction === 'up') {
      setUpvotes(prev => prev + 1)
    } else {
      setDownvotes(prev => prev + 1)
    }
    setUserVote(direction)

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
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
      setUserVote(null)
    } finally {
      setVoting(false)
    }
  }, [reviewId, voting, userVote])

  const netScore = upvotes - downvotes

  return {
    upvotes,
    downvotes,
    netScore,
    userVote,
    voting,
    vote,
  }
}
