import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // 獲取用戶信息
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        reviews: {
          select: { id: true, rating: true, createdAt: true }
        },
        stakes: {
          select: { amount: true, createdAt: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        address: address.toLowerCase(),
        reputation: 0,
        reviewCount: 0,
        totalStaked: '0',
        joinedAt: new Date().toISOString(),
        badges: [],
        verified: false
      })
    }

    // 計算聲譽分數
    const reviewCount = user.reviews?.length || 0
    const totalStaked = user.stakes?.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0) || 0
    const reputation = Math.min(100, reviewCount * 2 + Math.floor(totalStaked / 10))

    // 生成 badges
    const badges: string[] = []
    if (reviewCount >= 10) badges.push('Prolific Reviewer')
    if (totalStaked >= 100) badges.push('Major Stakeholder')
    if (reviewCount >= 5 && totalStaked >= 50) badges.push('Trusted')
    if (user.reviews?.some(r => r.rating >= 4)) badges.push('Bullish Reviewer')

    return NextResponse.json({
      address: address.toLowerCase(),
      reputation,
      reviewCount,
      totalStaked: totalStaked.toString(),
      joinedAt: user.createdAt?.toISOString() || new Date().toISOString(),
      badges,
      verified: user.verified || false,
      lastActivity: user.updatedAt?.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching passport:', error)
    return NextResponse.json(
      { error: 'Failed to fetch passport' },
      { status: 500 }
    )
  }
}
