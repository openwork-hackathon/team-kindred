import { NextRequest, NextResponse } from 'next/server'
import { fetchPolymarketMarket } from '@/lib/polymarket'

/**
 * GET /api/polymarket/[slug]
 * 
 * Fetch a single market by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const market = await fetchPolymarketMarket(slug)

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      market,
      source: 'polymarket',
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Polymarket API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    )
  }
}
