import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const POLYMARKET_API = 'https://gamma-api.polymarket.com'

// Mock markets for fallback
const MOCK_MARKETS: Record<string, any> = {
  'mock-1': {
    id: 'mock-1',
    question: 'Will Bitcoin reach $100,000 by end of 2026?',
    description: 'This market resolves to "Yes" if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange before January 1, 2027.',
    slug: 'bitcoin-100k-2026',
    category: 'crypto',
    outcomes: [
      { name: 'Yes', price: 0.65 },
      { name: 'No', price: 0.35 },
    ],
    volume: '2300000',
    liquidity: '500000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    rules: 'Resolution source: CoinGecko, CoinMarketCap, or major exchange data.',
  },
  'mock-2': {
    id: 'mock-2',
    question: 'Will Ethereum flip Bitcoin market cap in 2026?',
    description: 'This market resolves to "Yes" if Ethereum\'s total market capitalization exceeds Bitcoin\'s at any point during 2026.',
    slug: 'eth-flip-btc-2026',
    category: 'crypto',
    outcomes: [
      { name: 'Yes', price: 0.15 },
      { name: 'No', price: 0.85 },
    ],
    volume: '3300000',
    liquidity: '800000',
    endDate: '2026-12-31T23:59:59Z',
    resolved: false,
    rules: 'Resolution source: CoinGecko market cap data.',
  },
  'mock-3': {
    id: 'mock-3',
    question: 'Will Uniswap v4 launch in Q1 2026?',
    description: 'This market resolves to "Yes" if Uniswap v4 is deployed to Ethereum mainnet before April 1, 2026.',
    slug: 'uniswap-v4-q1-2026',
    category: 'defi',
    outcomes: [
      { name: 'Yes', price: 0.72 },
      { name: 'No', price: 0.28 },
    ],
    volume: '278000',
    liquidity: '50000',
    endDate: '2026-03-31T23:59:59Z',
    resolved: false,
    rules: 'Resolution source: Official Uniswap announcement and Etherscan contract deployment.',
  },
}

// GET /api/markets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Polymarket first
  try {
    const response = await fetch(`${POLYMARKET_API}/markets/${id}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        market: {
          id: data.conditionId || data.id,
          question: data.question,
          description: data.description,
          slug: data.slug,
          category: data.tags?.[0] || 'other',
          outcomes: data.outcomes?.map((o: string, i: number) => ({
            name: o,
            price: data.outcomePrices?.[i] ? parseFloat(data.outcomePrices[i]) : 0.5,
          })) || [],
          volume: data.volume?.toString() || '0',
          liquidity: data.liquidity?.toString() || '0',
          endDate: data.endDate,
          resolved: data.resolved || false,
          rules: data.resolutionSource || null,
        },
        source: 'polymarket',
        polymarketUrl: `https://polymarket.com/event/${data.slug}`,
      })
    }
  } catch (error) {
    console.error('Polymarket fetch error:', error)
  }

  // Check mock markets
  const mockMarket = MOCK_MARKETS[id]
  if (mockMarket) {
    return NextResponse.json({
      market: mockMarket,
      source: 'mock',
    })
  }

  return NextResponse.json({ error: 'Market not found' }, { status: 404 })
}
