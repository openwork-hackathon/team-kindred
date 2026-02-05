import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/projects?q=search&category=defi&limit=20&offset=0
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase()
    const category = searchParams.get('category')?.toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where clause
    const where: any = {}

    // Search filter
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    // Fetch total count
    const total = await prisma.project.count({ where })

    // Fetch projects
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        address: true,
        name: true,
        description: true,
        website: true,
        category: true,
        avgRating: true,
        reviewCount: true,
        totalStaked: true,
        currentRank: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { avgRating: 'desc' },
        { reviewCount: 'desc' },
      ],
      skip: offset,
      take: limit,
    })

    // Format response
    const formattedProjects = projects.map((p) => ({
      id: p.id,
      address: p.address,
      name: p.name,
      description: p.description,
      website: p.website,
      category: p.category,
      score: parseFloat(p.avgRating.toFixed(1)),
      avgRating: parseFloat(p.avgRating.toFixed(2)),
      reviewsCount: p.reviewCount,
      totalStaked: p.totalStaked,
      currentRank: p.currentRank,
      createdAt: p.createdAt.toISOString(),
    }))

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + formattedProjects.length < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/projects (create new project)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.address?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid project address' },
        { status: 400 }
      )
    }
    if (!body.name || body.name.length < 2) {
      return NextResponse.json(
        { error: 'Project name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Check if project already exists
    const existing = await prisma.project.findUnique({
      where: { address: body.address.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Project already exists' },
        { status: 409 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        address: body.address.toLowerCase(),
        name: body.name,
        description: body.description || null,
        website: body.website || null,
        category: body.category || 'defi',
      },
    })

    return NextResponse.json(
      {
        id: project.id,
        address: project.address,
        name: project.name,
        description: project.description,
        website: project.website,
        category: project.category,
        createdAt: project.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
