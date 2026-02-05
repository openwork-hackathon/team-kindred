import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Types
interface UserReputation {
  address: string
  displayName: string | null
  totalReviews: number
  totalUpvotes: number
  totalStaked: string
  totalWon: string
  totalLost: string
  winRate: number
  reputationScore: number
  feeTier: string
  level: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'authority'
  badges: string[]
  joinedAt: string
}

// Calculate level from score
function calculateLevel(score: number): UserReputation['level'] {
  if (score >= 10000) return 'authority'
  if (score >= 5000) return 'expert'
  if (score >= 1000) return 'trusted'
  if (score >= 100) return 'contributor'
  return 'newcomer'
}

// Calculate badges
function calculateBadges(user: Partial<UserReputation>): string[] {
  const badges: string[] = []
  
  if ((user.totalReviews || 0) >= 100) badges.push('Century Reviewer')
  if ((user.totalReviews || 0) >= 10) badges.push('Active Reviewer')
  if ((user.winRate || 0) >= 80) badges.push('Oracle')
  if ((user.winRate || 0) >= 60) badges.push('Predictor')
  if (BigInt(user.totalStaked || '0') >= BigInt('100000000000000000000')) badges.push('High Roller')
  if ((user.totalUpvotes || 0) >= 1000) badges.push('Influencer')
  
  return badges
}

// GET /api/users/[address]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  
  // Validate address
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()
  
  try {
    let user = await prisma.user.findUnique({
      where: { address: normalizedAddress },
    })

    if (!user) {
      // Return default user for new addresses
      return NextResponse.json({
        address: normalizedAddress,
        displayName: null,
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
    const totalWon = BigInt(user.totalWon)
    const totalLost = BigInt(user.totalLost)
    const totalSettled = totalWon + totalLost
    const winRate = totalSettled > 0 
      ? Number((totalWon * BigInt(100)) / totalSettled)
      : 0

    const response: UserReputation = {
      address: user.address,
      displayName: user.displayName,
      totalReviews: user.totalReviews,
      totalUpvotes: user.totalUpvotes,
      totalStaked: user.totalStaked,
      totalWon: user.totalWon,
      totalLost: user.totalLost,
      winRate,
      reputationScore: user.reputationScore,
      feeTier: user.feeTier,
      level: calculateLevel(user.reputationScore),
      badges: calculateBadges({
        totalReviews: user.totalReviews,
        totalUpvotes: user.totalUpvotes,
        totalStaked: user.totalStaked,
        winRate,
      }),
      joinedAt: user.createdAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
