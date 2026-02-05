import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/reviews?category=k/defi&target=0x...&sort=hot
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const target = searchParams.get('target')
    const sort = searchParams.get('sort') || 'hot' // hot, new, top

    // Build where clause
    const where: any = { status: 'active' }
    
    if (category) {
      where.project = { category }
    }
    
    if (target) {
      where.project = {
        ...where.project,
        OR: [
          { address: { contains: target, mode: 'insensitive' } },
          { name: { contains: target, mode: 'insensitive' } },
        ],
      }
    }

    // Fetch reviews with relations
    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            address: true,
            displayName: true,
            avatarUrl: true,
            reputationScore: true,
          },
        },
        project: {
          select: {
            id: true,
            address: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy:
        sort === 'new'
          ? { createdAt: 'desc' }
          : sort === 'top'
          ? { upvotes: 'desc' }
          : { createdAt: 'desc' }, // Hot sorting done client-side
    })

    // Apply hot sorting if needed (score decay over time)
    let sortedReviews = reviews
    if (sort === 'hot') {
      sortedReviews = reviews.sort((a, b) => {
        const now = Date.now()
        const scoreA =
          (a.upvotes - a.downvotes) /
          Math.pow((now - a.createdAt.getTime()) / 3600000 + 2, 1.5)
        const scoreB =
          (b.upvotes - b.downvotes) /
          Math.pow((now - b.createdAt.getTime()) / 3600000 + 2, 1.5)
        return scoreB - scoreA
      })
    }

    // Transform to API format
    const formattedReviews = sortedReviews.map((r) => ({
      id: r.id,
      targetAddress: r.project.address,
      targetName: r.project.name,
      reviewerAddress: r.reviewer.address,
      reviewerName: r.reviewer.displayName,
      reviewerReputation: r.reviewer.reputationScore,
      rating: r.rating,
      content: r.content,
      category: r.project.category,
      predictedRank: r.predictedRank,
      stakeAmount: r.stakeAmount,
      photoUrls: r.photoUrls ? JSON.parse(r.photoUrls) : [],
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      nftTokenId: r.nftTokenId,
      contractAddress: r.contractAddress,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      total: formattedReviews.length,
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.targetAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid target address' },
        { status: 400 }
      )
    }
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be 1-5' },
        { status: 400 }
      )
    }
    if (!body.content || body.content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      )
    }
    if (!body.reviewerAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid reviewer address' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: body.reviewerAddress.toLowerCase() },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: body.reviewerAddress.toLowerCase(),
          displayName: body.reviewerName || null,
        },
      })
    }

    // Find or create project
    let project = await prisma.project.findUnique({
      where: { address: body.targetAddress.toLowerCase() },
    })

    if (!project) {
      project = await prisma.project.create({
        data: {
          address: body.targetAddress.toLowerCase(),
          name: body.targetName || 'Unknown Project',
          category: body.category || 'defi',
        },
      })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: user.id,
        projectId: project.id,
        rating: body.rating,
        content: body.content,
        predictedRank: body.predictedRank || null,
        stakeAmount: body.stakeAmount || '0',
        photoUrls: body.photoUrls ? JSON.stringify(body.photoUrls) : null,
      },
      include: {
        reviewer: {
          select: {
            address: true,
            displayName: true,
            reputationScore: true,
          },
        },
        project: {
          select: {
            address: true,
            name: true,
            category: true,
          },
        },
      },
    })

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalReviews: { increment: 1 },
        totalStaked: {
          set: (
            BigInt(user.totalStaked) + BigInt(body.stakeAmount || '0')
          ).toString(),
        },
      },
    })

    // Update project stats
    const allReviews = await prisma.review.findMany({
      where: { projectId: project.id, status: 'active' },
      select: { rating: true },
    })
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.project.update({
      where: { id: project.id },
      data: {
        avgRating,
        reviewCount: allReviews.length,
      },
    })

    // Format response
    const response = {
      id: review.id,
      targetAddress: review.project.address,
      targetName: review.project.name,
      reviewerAddress: review.reviewer.address,
      reviewerName: review.reviewer.displayName,
      rating: review.rating,
      content: review.content,
      category: review.project.category,
      predictedRank: review.predictedRank,
      stakeAmount: review.stakeAmount,
      photoUrls: review.photoUrls ? JSON.parse(review.photoUrls) : [],
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      createdAt: review.createdAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    )
  }
}
