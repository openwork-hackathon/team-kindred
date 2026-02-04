import { NextRequest } from 'next/server'
import { withAuth, apiResponse, apiError, corsHeaders } from '@/lib/api-auth'

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders })
}

// Mock project data (in production, this would come from a database)
const MOCK_PROJECTS = [
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    ticker: 'HYPE',
    category: 'k/perp-dex',
    score: 92,
    tvl: '$1.2B',
    change24h: '+5.2%',
    reviewsCount: 47,
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    ticker: 'UNI',
    category: 'k/defi',
    score: 88,
    tvl: '$4.8B',
    change24h: '+2.1%',
    reviewsCount: 156,
  },
  {
    id: 'ai16z',
    name: 'ai16z',
    ticker: 'AI16Z',
    category: 'k/ai',
    score: 85,
    tvl: '$890M',
    change24h: '+12.4%',
    reviewsCount: 89,
  },
  {
    id: 'pepe',
    name: 'PEPE',
    ticker: 'PEPE',
    category: 'k/memecoin',
    score: 78,
    tvl: '$2.1B',
    change24h: '-3.2%',
    reviewsCount: 234,
  },
]

// GET /api/projects - List/search projects
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, agent) => {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.toLowerCase()
    const category = searchParams.get('category')?.toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let projects = [...MOCK_PROJECTS]

    // Filter by search query
    if (query) {
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.ticker.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (category) {
      projects = projects.filter(p =>
        p.category.toLowerCase() === category ||
        p.category.toLowerCase().includes(category)
      )
    }

    // Paginate
    const total = projects.length
    projects = projects.slice(offset, offset + limit)

    return apiResponse({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + projects.length < total,
      },
    })
  })
}
