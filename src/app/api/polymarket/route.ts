import { NextRequest, NextResponse } from 'next/server'
import { fetchPolymarketMarkets, fetchTrendingMarkets } from '@/lib/polymarket'

/**
 * GET /api/polymarket
 * 
 * Fetch real market data from Polymarket
 * 
 * Query params:
 * - limit: number (default 20)
 * - category: string (optional)
 * - trending: boolean (if true, returns trending markets)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const trending = searchParams.get('trending') === 'true'

  try {
    let markets
    
    if (trending) {
      markets = await fetchTrendingMarkets(limit)
    } else {
      markets = await fetchPolymarketMarkets({
        limit,
        category: category || undefined,
        active: true,
      })
    }

    return NextResponse.json({
      markets,
      total: markets.length,
      source: 'polymarket',
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Polymarket API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Polymarket data' },
      { status: 500 }
    )
  }
}
