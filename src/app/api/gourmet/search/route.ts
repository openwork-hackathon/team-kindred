import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/gourmet/search
 * Search for a restaurant by name, create if doesn't exist
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()
    
    // Generate slug
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if restaurant already exists (by name or slug)
    let restaurant = await prisma.project.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: 'insensitive' } },
          { address: slug },
        ],
        category: 'k/gourmet',
      },
    })

    // Create restaurant if doesn't exist
    if (!restaurant) {
      restaurant = await prisma.project.create({
        data: {
          name: trimmedName,
          address: slug, // Use slug as "address" for restaurants
          category: 'k/gourmet',
          description: `${trimmedName} restaurant`,
          website: null,
          avgRating: 0,
          reviewCount: 0,
          totalStaked: "0",
          currentRank: null,
        },
      })
    }

    return NextResponse.json({ 
      slug,
      id: restaurant.id,
      name: restaurant.name,
      created: !restaurant, // Whether it was just created
    })
  } catch (error) {
    console.error('Gourmet search error:', error)
    return NextResponse.json(
      { error: 'Failed to search restaurant' },
      { status: 500 }
    )
  }
}
