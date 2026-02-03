import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Types
interface Position {
  id: string
  userAddress: string
  marketId: string
  marketQuestion: string
  outcome: 'yes' | 'no'
  shares: string
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  status: 'open' | 'closed' | 'settled'
  createdAt: string
  closedAt: string | null
}

// In-memory positions store
const positions: Position[] = [
  {
    id: 'pos_1',
    userAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    marketId: 'mock-1',
    marketQuestion: 'Will Bitcoin reach $100,000 by end of 2026?',
    outcome: 'yes',
    shares: '100',
    avgPrice: 0.55,
    currentPrice: 0.65,
    pnl: 10,
    pnlPercent: 18.18,
    status: 'open',
    createdAt: '2026-01-15T00:00:00Z',
    closedAt: null,
  },
]

// GET /api/positions - Get user positions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const status = searchParams.get('status')
  const marketId = searchParams.get('marketId')

  let filtered = [...positions]

  if (address) {
    filtered = filtered.filter(p => 
      p.userAddress.toLowerCase() === address.toLowerCase()
    )
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }

  if (marketId) {
    filtered = filtered.filter(p => p.marketId === marketId)
  }

  // Calculate totals
  const totalValue = filtered.reduce((sum, p) => {
    if (p.status === 'open') {
      return sum + parseFloat(p.shares) * p.currentPrice
    }
    return sum
  }, 0)

  const totalPnl = filtered.reduce((sum, p) => sum + p.pnl, 0)

  return NextResponse.json({
    positions: filtered,
    total: filtered.length,
    totalValue: totalValue.toFixed(2),
    totalPnl: totalPnl.toFixed(2),
    openCount: filtered.filter(p => p.status === 'open').length,
  })
}

// POST /api/positions - Record a new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.userAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 })
    }
    if (!body.marketId) {
      return NextResponse.json({ error: 'marketId required' }, { status: 400 })
    }
    if (!['yes', 'no'].includes(body.outcome)) {
      return NextResponse.json({ error: 'outcome must be "yes" or "no"' }, { status: 400 })
    }
    if (!body.shares || parseFloat(body.shares) <= 0) {
      return NextResponse.json({ error: 'shares must be positive' }, { status: 400 })
    }

    const position: Position = {
      id: `pos_${Date.now()}`,
      userAddress: body.userAddress.toLowerCase(),
      marketId: body.marketId,
      marketQuestion: body.marketQuestion || 'Unknown Market',
      outcome: body.outcome,
      shares: body.shares,
      avgPrice: body.avgPrice || body.currentPrice || 0.5,
      currentPrice: body.currentPrice || 0.5,
      pnl: 0,
      pnlPercent: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      closedAt: null,
    }

    positions.push(position)

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// PATCH /api/positions - Update position (close, update price)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionId, action, currentPrice } = body

    const position = positions.find(p => p.id === positionId)
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    if (action === 'close') {
      position.status = 'closed'
      position.closedAt = new Date().toISOString()
      if (currentPrice) {
        position.currentPrice = currentPrice
        position.pnl = (currentPrice - position.avgPrice) * parseFloat(position.shares)
        position.pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100
      }
    } else if (action === 'update' && currentPrice) {
      position.currentPrice = currentPrice
      position.pnl = (currentPrice - position.avgPrice) * parseFloat(position.shares)
      position.pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100
    }

    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
