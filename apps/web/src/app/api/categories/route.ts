import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Category definitions for the Kindred platform
// These are the "subreddits" for crypto projects

interface Category {
  id: string
  name: string
  description: string
  icon: string
  projectCount: number
  reviewCount: number
  totalStaked: string
  color: string
}

const categories: Category[] = [
  {
    id: 'k/defi',
    name: 'DeFi',
    description: 'Decentralized finance protocols - lending, DEXs, yield',
    icon: '🏦',
    projectCount: 34,
    reviewCount: 456,
    totalStaked: '250000000000000000000000',
    color: '#3B82F6', // blue
  },
  {
    id: 'k/memecoin',
    name: 'Memecoins',
    description: 'Community tokens and meme-based projects',
    icon: '🐸',
    projectCount: 127,
    reviewCount: 892,
    totalStaked: '150000000000000000000000',
    color: '#10B981', // green
  },
  {
    id: 'k/perp-dex',
    name: 'Perp DEX',
    description: 'Perpetual futures and derivatives exchanges',
    icon: '📈',
    projectCount: 12,
    reviewCount: 234,
    totalStaked: '320000000000000000000000',
    color: '#8B5CF6', // purple
  },
  {
    id: 'k/ai',
    name: 'AI Agents',
    description: 'AI-powered crypto projects and agent tokens',
    icon: '🤖',
    projectCount: 45,
    reviewCount: 567,
    totalStaked: '180000000000000000000000',
    color: '#F59E0B', // amber
  },
]

// GET /api/categories
export async function GET() {
  return NextResponse.json({
    categories,
    total: categories.length,
  })
}
