import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/stakes?address=0x...&project=0x...&status=active
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const project = searchParams.get('project')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}

    if (address) {
      where.staker = { address: { equals: address.toLowerCase() } }
    }
    if (project) {
      where.project = { address: { equals: project.toLowerCase() } }
    }
    if (status) {
      where.status = status
    }

    // Fetch stakes
    const stakes = await prisma.stake.findMany({
      where,
      include: {
        staker: {
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
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const totalStaked = stakes.reduce(
      (sum, s) => sum + BigInt(s.amount),
      BigInt(0)
    )
    const activeStakes = stakes.filter((s) => s.status === 'active')
    const wonStakes = stakes.filter((s) => s.status === 'won')

    // Format response
    const formattedStakes = stakes.map((s) => ({
      id: s.id,
      stakerAddress: s.staker.address,
      stakerName: s.staker.displayName,
      reviewId: s.reviewId,
      projectAddress: s.project.address,
      projectName: s.project.name,
      predictedRank: s.predictedRank,
      amount: s.amount,
      status: s.status,
      txHash: s.txHash,
      payout: s.payout,
      createdAt: s.createdAt.toISOString(),
      settledAt: s.settledAt?.toISOString() || null,
    }))

    return NextResponse.json({
      stakes: formattedStakes,
      total: formattedStakes.length,
      totalStaked: totalStaked.toString(),
      activeCount: activeStakes.length,
      wonCount: wonStakes.length,
    })
  } catch (error: any) {
    console.error('Error fetching stakes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stakes', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/stakes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.stakerAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid staker address' },
        { status: 400 }
      )
    }
    if (!body.projectAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid project address' },
        { status: 400 }
      )
    }
    if (
      !body.predictedRank ||
      body.predictedRank < 1 ||
      body.predictedRank > 100
    ) {
      return NextResponse.json(
        { error: 'Predicted rank must be 1-100' },
        { status: 400 }
      )
    }
    if (!body.amount || BigInt(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'Stake amount must be positive' },
        { status: 400 }
      )
    }

    // Find or create staker
    let staker = await prisma.user.findUnique({
      where: { address: body.stakerAddress.toLowerCase() },
    })
    if (!staker) {
      staker = await prisma.user.create({
        data: { address: body.stakerAddress.toLowerCase() },
      })
    }

    // Find or create project
    let project = await prisma.project.findUnique({
      where: { address: body.projectAddress.toLowerCase() },
    })
    if (!project) {
      project = await prisma.project.create({
        data: {
          address: body.projectAddress.toLowerCase(),
          name: body.projectName || 'Unknown Project',
          category: body.category || 'defi',
        },
      })
    }

    // Create stake
    const stake = await prisma.stake.create({
      data: {
        stakerId: staker.id,
        projectId: project.id,
        reviewId: body.reviewId || null,
        predictedRank: body.predictedRank,
        amount: body.amount,
        txHash: body.txHash || null,
      },
      include: {
        staker: {
          select: { address: true, displayName: true },
        },
        project: {
          select: { address: true, name: true },
        },
      },
    })

    // Update user stats
    await prisma.user.update({
      where: { id: staker.id },
      data: {
        totalStaked: {
          set: (BigInt(staker.totalStaked) + BigInt(body.amount)).toString(),
        },
      },
    })

    // Update project stats
    await prisma.project.update({
      where: { id: project.id },
      data: {
        totalStaked: {
          set: (BigInt(project.totalStaked) + BigInt(body.amount)).toString(),
        },
      },
    })

    // Format response
    const response = {
      id: stake.id,
      stakerAddress: stake.staker.address,
      stakerName: stake.staker.displayName,
      reviewId: stake.reviewId,
      projectAddress: stake.project.address,
      projectName: stake.project.name,
      predictedRank: stake.predictedRank,
      amount: stake.amount,
      status: stake.status,
      txHash: stake.txHash,
      createdAt: stake.createdAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Error creating stake:', error)
    return NextResponse.json(
      { error: 'Failed to create stake', details: error.message },
      { status: 500 }
    )
  }
}
