/**
 * Polymarket API Client
 * 
 * Fetches real market data from Polymarket's Gamma API
 * Docs: https://docs.polymarket.com
 */

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com'

export interface PolymarketEvent {
  id: string
  ticker: string
  slug: string
  title: string
  description: string
  startDate: string
  endDate: string
  image: string
  icon: string
  active: boolean
  closed: boolean
  liquidity: number
  volume: number
  category: string
  volume24hr: number
  volume1wk: number
}

export interface PolymarketMarket {
  id: string
  question: string
  conditionId: string
  slug: string
  endDate: string
  category: string
  liquidity: string
  image: string
  description: string
  outcomes: string // JSON string array
  outcomePrices: string // JSON string array
  volume: string
  active: boolean
  closed: boolean
  volumeNum: number
  liquidityNum: number
  volume24hr: number
  volume1wk: number
  events: PolymarketEvent[]
}

export interface ProcessedMarket {
  id: string
  question: string
  slug: string
  category: string
  image: string
  description: string
  endDate: string
  outcomes: {
    name: string
    price: number
    probability: number
  }[]
  volume: number
  volume24hr: number
  liquidity: number
  active: boolean
  closed: boolean
  url: string
}

/**
 * Fetch markets from Polymarket
 */
export async function fetchPolymarketMarkets(options?: {
  limit?: number
  active?: boolean
  category?: string
}): Promise<ProcessedMarket[]> {
  const { limit = 50, active = true, category } = options || {}
  
  try {
    let url = `${GAMMA_API_BASE}/markets?limit=${limit}`
    if (active) url += '&active=true&closed=false'
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }
    
    const markets: PolymarketMarket[] = await response.json()
    
    // Process and filter markets
    let processed = markets
      .filter(m => m.liquidityNum > 1000) // Only markets with decent liquidity
      .map(processMarket)
    
    // Filter by category if specified
    if (category) {
      processed = processed.filter(m => 
        m.category.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    // Sort by volume
    processed.sort((a, b) => b.volume24hr - a.volume24hr)
    
    return processed.slice(0, limit)
  } catch (error) {
    console.error('Failed to fetch Polymarket markets:', error)
    return []
  }
}

/**
 * Fetch a single market by slug
 */
export async function fetchPolymarketMarket(slug: string): Promise<ProcessedMarket | null> {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/markets?slug=${slug}`, {
      next: { revalidate: 30 },
    })
    
    if (!response.ok) return null
    
    const markets: PolymarketMarket[] = await response.json()
    if (markets.length === 0) return null
    
    return processMarket(markets[0])
  } catch (error) {
    console.error('Failed to fetch market:', error)
    return null
  }
}

/**
 * Fetch trending markets (high volume in last 24h)
 */
export async function fetchTrendingMarkets(limit = 10): Promise<ProcessedMarket[]> {
  const markets = await fetchPolymarketMarkets({ limit: 100 })
  return markets
    .sort((a, b) => b.volume24hr - a.volume24hr)
    .slice(0, limit)
}

/**
 * Process raw market data into clean format
 */
function processMarket(market: PolymarketMarket): ProcessedMarket {
  let outcomes: { name: string; price: number; probability: number }[] = []
  
  try {
    const names = JSON.parse(market.outcomes) as string[]
    const prices = JSON.parse(market.outcomePrices) as string[]
    
    outcomes = names.map((name, i) => ({
      name,
      price: parseFloat(prices[i] || '0'),
      probability: parseFloat(prices[i] || '0') * 100,
    }))
  } catch {
    outcomes = [
      { name: 'Yes', price: 0.5, probability: 50 },
      { name: 'No', price: 0.5, probability: 50 },
    ]
  }
  
  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    category: mapCategory(market.category),
    image: market.image,
    description: market.description,
    endDate: market.endDate,
    outcomes,
    volume: market.volumeNum,
    volume24hr: market.volume24hr,
    liquidity: market.liquidityNum,
    active: market.active,
    closed: market.closed,
    url: `https://polymarket.com/event/${market.slug}`,
  }
}

/**
 * Map Polymarket categories to Kindred categories
 */
function mapCategory(pmCategory: string): string {
  const categoryMap: Record<string, string> = {
    'crypto': 'k/defi',
    'business': 'k/defi',
    'pop-culture': 'k/memecoin',
    'sports': 'k/sports',
    'politics': 'k/politics',
    'science': 'k/tech',
    'US-current-affairs': 'k/politics',
    'global-current-affairs': 'k/politics',
  }
  
  return categoryMap[pmCategory] || 'k/other'
}
