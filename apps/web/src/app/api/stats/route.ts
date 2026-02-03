import { NextResponse } from 'next/server'
import type { PlatformStats } from '@kindred/shared'

export const dynamic = 'force-dynamic'

// Platform statistics endpoint
// Used by HomePage StatCard components

// Mock stats (replace with DB aggregation)
const stats: PlatformStats = {
  totalReviews: 1247,
  totalStaked: '847500000000000000000000', // 847,500 tokens
  totalStakedFormatted: '847.5K',
  activeUsers: 423,
  projectsRated: 89,
  avgRating: 4.2,
  totalPayouts: '125000000000000000000000', // 125,000 tokens
  winRate: 67.3,
  lastUpdated: new Date().toISOString(),
}

// GET /api/stats
export async function GET() {
  // TODO: Calculate from actual DB data
  // const reviews = await prisma.review.count()
  // const totalStaked = await prisma.stake.aggregate({ _sum: { amount: true } })
  // etc.

  return NextResponse.json({
    ...stats,
    status: 'ok',
  })
}
