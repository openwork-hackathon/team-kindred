import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/reviews/[id]/vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reviewId } = await params
    const { voterAddress, direction } = body

    // Validation
    if (!voterAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid voter address' },
        { status: 400 }
      )
    }
    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Direction must be "up" or "down"' },
        { status: 400 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Find or create voter
    let voter = await prisma.user.findUnique({
      where: { address: voterAddress.toLowerCase() },
    })
    if (!voter) {
      voter = await prisma.user.create({
        data: { address: voterAddress.toLowerCase() },
      })
    }

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_reviewId: {
          voterId: voter.id,
          reviewId: reviewId,
        },
      },
    })

    if (existingVote) {
      // Update existing vote if direction changed
      if (existingVote.direction !== direction) {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { direction },
        })

        // Update review vote counts
        const deltaUpvotes = direction === 'up' ? 2 : -2
        const deltaDownvotes = direction === 'down' ? 2 : -2

        await prisma.review.update({
          where: { id: reviewId },
          data: {
            upvotes: { increment: deltaUpvotes },
            downvotes: { increment: deltaDownvotes },
          },
        })

        return NextResponse.json({ message: 'Vote updated', direction })
      } else {
        return NextResponse.json(
          { message: 'Already voted in this direction' },
          { status: 200 }
        )
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          voterId: voter.id,
          reviewId: reviewId,
          direction,
        },
      })

      // Update review vote counts
      const updateData =
        direction === 'up'
          ? { upvotes: { increment: 1 } }
          : { downvotes: { increment: 1 } }

      await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
      })

      return NextResponse.json({ message: 'Vote recorded', direction }, { status: 201 })
    }
  } catch (error: any) {
    console.error('Error voting on review:', error)
    return NextResponse.json(
      { error: 'Failed to vote', details: error.message },
      { status: 500 }
    )
  }
}
