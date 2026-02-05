import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/leaderboard?category=defi&limit=20&offset=0
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where clause
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    // Fetch projects with stats
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        address: true,
        name: true,
        category: true,
        avgRating: true,
        reviewCount: true,
        totalStaked: true,
        currentRank: true,
        updatedAt: true,
      },
      orderBy: [
        { avgRating: 'desc' },
        { reviewCount: 'desc' },
      ],
    })

    // Calculate composite scores and rank
    const maxStaked = projects.reduce((max, p) => {
      const staked = parseFloat(p.totalStaked || '0')
      return Math.max(max, staked)
    }, 1)

    const scored = projects.map((project) => {
      const staked = parseFloat(project.totalStaked || '0')
      const stakedNormalized = maxStaked > 0 ? staked / maxStaked : 0

      // Composite score: 50% rating, 30% review count, 20% staked
      const score =
        project.avgRating * 0.5 +
        Math.min(project.reviewCount / 10, 5) * 0.3 + // Normalize review count
        stakedNormalized * 5 * 0.2

      return {
        ...project,
        score,
      }
    })

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    // Assign ranks
    const ranked = scored.map((item, index) => ({
      rank: index + 1,
      projectAddress: item.address,
      projectName: item.name,
      category: item.category,
      avgRating: parseFloat(item.avgRating.toFixed(2)),
      reviewCount: item.reviewCount,
      totalStaked: item.totalStaked,
      weeklyChange: item.currentRank ? item.currentRank - (index + 1) : 0,
      predictedRank: null, // TODO: Calculate from weighted stake predictions
    }))

    // Paginate
    const paginated = ranked.slice(offset, offset + limit)

    // Get unique categories
    const allProjects = await prisma.project.findMany({
      select: { category: true },
      distinct: ['category'],
    })
    const categories = allProjects.map((p) => p.category)

    return NextResponse.json({
      leaderboard: paginated,
      total: ranked.length,
      categories: categories.length > 0 ? categories : ['defi', 'memecoin', 'perp-dex', 'ai'],
      lastUpdated: new Date().toISOString(),
      nextSettlement: getNextSunday().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    )
  }
}

// Helper: Get next Sunday midnight UTC
function getNextSunday(): Date {
  const now = new Date()
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + daysUntilSunday)
  nextSunday.setHours(0, 0, 0, 0)
  return nextSunday
}
