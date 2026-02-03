/**
 * Kindred API Client
 * Frontend helper for calling backend APIs
 */

const API_BASE = '/api'

// Types
export interface Market {
  id: string
  question: string
  slug: string
  category: string
  source: 'polymarket' | 'prediction-market'
  outcomes: { name: string; price: number }[]
  volume: string
  liquidity: string
  endDate: string | null
  resolved: boolean
}

export interface Position {
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
}

export interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number
  content: string
  category: string
  predictedRank: number | null
  stakeAmount: string
  upvotes: number
  downvotes: number
  createdAt: string
}

export interface Stake {
  id: string
  stakerAddress: string
  projectAddress: string
  projectName: string
  predictedRank: number
  amount: string
  status: 'active' | 'won' | 'lost' | 'pending'
}

export interface TokenInfo {
  name: string
  symbol: string
  address: string | null
  deployed: boolean
  currentPrice: string
  bondingCurve: {
    maxSupply: string
    steps: { supply: string; price: string }[]
  }
}

// API Client
class KindredAPI {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // Health
  async health() {
    return this.fetch<{ status: string; timestamp: string }>('/health')
  }

  // Markets
  async getMarkets(params?: { category?: string; limit?: number; q?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.q) searchParams.set('q', params.q)
    
    const query = searchParams.toString()
    return this.fetch<{ markets: Market[]; total: number }>(
      `/markets${query ? `?${query}` : ''}`
    )
  }

  async getMarket(id: string) {
    return this.fetch<{ market: Market; source: string }>(`/markets/${id}`)
  }

  // Positions
  async getPositions(address: string, status?: string) {
    const params = new URLSearchParams({ address })
    if (status) params.set('status', status)
    return this.fetch<{ positions: Position[]; totalValue: string; totalPnl: string }>(
      `/positions?${params}`
    )
  }

  async createPosition(data: {
    userAddress: string
    marketId: string
    marketQuestion: string
    outcome: 'yes' | 'no'
    shares: string
    avgPrice: number
  }) {
    return this.fetch<Position>('/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePosition(positionId: string, action: 'close' | 'update', currentPrice?: number) {
    return this.fetch<Position>('/positions', {
      method: 'PATCH',
      body: JSON.stringify({ positionId, action, currentPrice }),
    })
  }

  // Reviews
  async getReviews(params?: { category?: string; target?: string; sort?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.target) searchParams.set('target', params.target)
    if (params?.sort) searchParams.set('sort', params.sort)
    
    const query = searchParams.toString()
    return this.fetch<{ reviews: Review[]; total: number }>(
      `/reviews${query ? `?${query}` : ''}`
    )
  }

  async createReview(data: {
    targetAddress: string
    targetName: string
    rating: number
    content: string
    category: string
    predictedRank?: number
    stakeAmount?: string
  }) {
    return this.fetch<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async voteReview(reviewId: string, direction: 'up' | 'down', voterAddress: string) {
    return this.fetch<{ success: boolean }>(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction, voterAddress }),
    })
  }

  // Stakes
  async getStakes(params?: { address?: string; project?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.address) searchParams.set('address', params.address)
    if (params?.project) searchParams.set('project', params.project)
    if (params?.status) searchParams.set('status', params.status)
    
    const query = searchParams.toString()
    return this.fetch<{ stakes: Stake[]; totalStaked: string }>(
      `/stakes${query ? `?${query}` : ''}`
    )
  }

  async createStake(data: {
    stakerAddress: string
    projectAddress: string
    projectName: string
    predictedRank: number
    amount: string
    reviewId?: string
  }) {
    return this.fetch<Stake>('/stakes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Leaderboard
  async getLeaderboard(category?: string, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (category) params.set('category', category)
    return this.fetch<{ leaderboard: any[]; total: number }>(`/leaderboard?${params}`)
  }

  // User
  async getUser(address: string) {
    return this.fetch<any>(`/users/${address}`)
  }

  // Token
  async getTokenInfo(includeChart = false) {
    return this.fetch<TokenInfo>(`/token${includeChart ? '?chart=true' : ''}`)
  }

  async getTokenQuote(amount: string, action: 'buy' | 'sell' = 'buy') {
    return this.fetch<{
      amount: string
      total: string
      avgPrice: string
      currency: string
    }>('/token', {
      method: 'POST',
      body: JSON.stringify({ amount, action }),
    })
  }
}

// Export singleton instance
export const api = new KindredAPI()
export default api
