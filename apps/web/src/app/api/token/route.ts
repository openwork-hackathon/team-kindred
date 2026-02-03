import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Contract addresses (Base Mainnet) - from PLATFORM_TOKEN_SPEC.md
const CONTRACTS = {
  MCV2_Bond: '0xc5a076cad94176c2996B32d8466Be1cE757FAa27',
  MCV2_Token: '0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df',
  MCV2_ZapV1: '0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa',
  OPENWORK: '0x299c30DD5974BF4D5bFE42C340CA40462816AB07',
}

// Token configuration
const TOKEN_CONFIG = {
  name: 'Kindred Token',
  symbol: 'KIND',
  decimals: 18,
  address: null as string | null, // Set after deployment
  chain: 'base',
  chainId: 8453,
  mintClubUrl: 'https://mint.club/token/base/KIND',
  
  // Bonding curve parameters
  bondingCurve: {
    maxSupply: '1000000', // 1M tokens
    mintRoyalty: 100, // 1% (basis points)
    burnRoyalty: 100, // 1%
    reserveToken: CONTRACTS.OPENWORK,
    steps: [
      { supply: '0', price: '0.001' },        // 0-100k: 0.001 OPENWORK
      { supply: '100000', price: '0.005' },   // 100k-500k: 0.005 OPENWORK
      { supply: '500000', price: '0.01' },    // 500k-1M: 0.01 OPENWORK
    ],
  },
}

// GET /api/token - Get token info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeChart = searchParams.get('chart') === 'true'

  const response: any = {
    ...TOKEN_CONFIG,
    contracts: CONTRACTS,
    deployed: TOKEN_CONFIG.address !== null,
    currentSupply: '0', // TODO: Fetch from chain
    currentPrice: TOKEN_CONFIG.bondingCurve.steps[0].price,
  }

  // Include chart data for bonding curve visualization
  if (includeChart) {
    response.chartData = generateBondingCurveChart()
  }

  return NextResponse.json(response)
}

// Generate bonding curve chart data points
function generateBondingCurveChart() {
  const { steps, maxSupply } = TOKEN_CONFIG.bondingCurve
  const dataPoints = []
  const max = parseFloat(maxSupply)
  
  // Generate smooth curve with 100 data points
  for (let i = 0; i <= 100; i++) {
    const supply = (i / 100) * max
    let price = 0
    
    // Find price based on supply tier
    for (let j = steps.length - 1; j >= 0; j--) {
      if (supply >= parseFloat(steps[j].supply)) {
        price = parseFloat(steps[j].price)
        break
      }
    }
    
    dataPoints.push({
      supply: Math.round(supply),
      price,
      marketCap: supply * price,
    })
  }
  
  return dataPoints
}

// POST /api/token/quote - Get quote for buying/selling KIND
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, action = 'buy' } = body

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'amount must be positive' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)
    const { steps, mintRoyalty, burnRoyalty } = TOKEN_CONFIG.bondingCurve
    
    // Calculate cost based on bonding curve
    // Simplified: assume buying from current supply of 0
    let totalCost = 0
    let remaining = amountNum
    let currentSupply = 0

    for (const step of steps) {
      const stepSupply = parseFloat(step.supply)
      const stepPrice = parseFloat(step.price)
      const nextStepSupply = steps[steps.indexOf(step) + 1]?.supply 
        ? parseFloat(steps[steps.indexOf(step) + 1].supply) 
        : parseFloat(TOKEN_CONFIG.bondingCurve.maxSupply)
      
      const availableInStep = nextStepSupply - Math.max(currentSupply, stepSupply)
      const buyInStep = Math.min(remaining, availableInStep)
      
      if (buyInStep > 0) {
        totalCost += buyInStep * stepPrice
        remaining -= buyInStep
        currentSupply += buyInStep
      }
      
      if (remaining <= 0) break
    }

    // Apply royalty
    const royaltyBps = action === 'buy' ? mintRoyalty : burnRoyalty
    const royalty = totalCost * (royaltyBps / 10000)
    const total = action === 'buy' ? totalCost + royalty : totalCost - royalty

    return NextResponse.json({
      action,
      amount: amountNum.toString(),
      baseCost: totalCost.toFixed(6),
      royalty: royalty.toFixed(6),
      royaltyPercent: (royaltyBps / 100).toFixed(2) + '%',
      total: total.toFixed(6),
      currency: 'OPENWORK',
      avgPrice: (totalCost / amountNum).toFixed(6),
      note: TOKEN_CONFIG.address 
        ? 'Live quote from bonding curve' 
        : 'Estimated quote (token not yet deployed)',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
