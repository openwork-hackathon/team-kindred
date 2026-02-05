import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Calculate level from reputation score
function calculateLevel(score: number): string {
  if (score >= 10000) return 'authority'
  if (score >= 5000) return 'expert'
  if (score >= 1000) return 'trusted'
  if (score >= 100) return 'contributor'
  return 'newcomer'
}

// Calculate badges based on user stats
function calculateBadges(stats: {
  totalReviews: number
  totalUpvotes: number
  totalStaked: string
  winRate: number
}): string[] {
  const badges: string[] = []

  if (stats.totalReviews >= 100) badges.push('Century Reviewer')
  if (stats.totalReviews >= 10) badges.push('Active Reviewer')
  if (stats.winRate >= 80) badges.push('Oracle')
  if (stats.winRate >= 60) badges.push('Predictor')
  if (BigInt(stats.totalStaked) >= BigInt('100000000000000000000'))
    badges.push('High Roller')
  if (stats.totalUpvotes >= 1000) badges.push('Influencer')

  return badges
}

// GET /api/users/[address]
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = await params

    // Validate address
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase()

    // Find user
    let user = await prisma.user.findUnique({
      where: { address: normalizedAddress },
      include: {
        reviews: {
          select: { upvotes: true, downvotes: true },
        },
        stakes: {
          where: { status: { in: ['won', 'lost'] } },
          select: { status: true, amount: true, payout: true },
        },
      },
    })

    // If user doesn't exist, return default newcomer profile
    if (!user) {
      return NextResponse.json({
        address: normalizedAddress,
        displayName: null,
        avatarUrl: null,
        totalReviews: 0,
        totalUpvotes: 0,
        totalStaked: '0',
        totalWon: '0',
        totalLost: '0',
        winRate: 0,
        reputationScore: 0,
        feeTier: 'normal',
        level: 'newcomer',
        badges: [],
        joinedAt: new Date().toISOString(),
      })
    }

    // Calculate win rate
    const settledStakes = user.stakes.filter((s) =>
      ['won', 'lost'].includes(s.status)
    )
    const wonStakes = user.stakes.filter((s) => s.status === 'won')
    const winRate =
      settledStakes.length > 0
        ? (wonStakes.length / settledStakes.length) * 100
        : 0

    // Calculate total upvotes across all reviews
    const totalUpvotes = user.reviews.reduce((sum, r) => sum + r.upvotes, 0)

    // Build response
    const userData = {
      address: user.address,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      totalReviews: user.totalReviews,
      totalUpvotes,
      totalStaked: user.totalStaked,
      totalWon: user.totalWon,
      totalLost: user.totalLost,
      winRate: parseFloat(winRate.toFixed(2)),
      reputationScore: user.reputationScore,
      feeTier: user.feeTier,
      level: calculateLevel(user.reputationScore),
      badges: calculateBadges({
        totalReviews: user.totalReviews,
        totalUpvotes,
        totalStaked: user.totalStaked,
        winRate,
      }),
      joinedAt: user.createdAt.toISOString(),
    }

    return NextResponse.json(userData)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    )
  }
}
