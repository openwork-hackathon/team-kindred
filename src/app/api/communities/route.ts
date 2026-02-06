'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    }

    // Get aggregate stats for this category
    const stats = await prisma.project.aggregate({
      where: { category },
      _count: { id: true },
      _sum: { reviewCount: true },
    })

    // For now, return placeholder stats
    // TODO: Implement actual community membership tracking
    const memberCount = stats._count.id * 10 + Math.floor(Math.random() * 50)
    const stakedAmount = (stats._sum.reviewCount || 0) * 1000 + Math.floor(Math.random() * 10000)

    return NextResponse.json({
      members: memberCount > 0 ? `${memberCount}` : '-',
      staked: stakedAmount > 0 ? `$${(stakedAmount / 1000).toFixed(1)}K` : '-',
      category,
    })
  } catch (error) {
    console.error('[API] /api/communities error:', error)
    return NextResponse.json({ members: '-', staked: '-' })
  }
}
