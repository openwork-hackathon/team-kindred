import { BarChart3, Award, TrendingUp, Flame, Clock } from 'lucide-react'

export type Category = 'all' | 'k/defi' | 'k/perp-dex' | 'k/ai' | 'k/memecoin'

export interface Project {
  id: string
  name: string
  ticker: string
  category: Category
  color: string
  // Market Stats
  rank: number
  mindshare: number
  mindshareChange: number
  staked: number
  sentiment: number
  reviewsCount: number
  price: string
  volume24h: string
  marketCap: string
  // AI Analysis
  aiVerdict: 'bullish' | 'bearish' | 'neutral'
  aiScore: number
  aiSummary: string
  keyPoints: string[]
}

export interface Review {
  id: string
  projectId: string
  author: string
  authorReputation: number
  avatar?: string
  content: string
  rating: number
  title?: string
  upvotes: number
  comments: number
  timestamp: string // ISO string
  stakedAmount?: string
  isNFT: boolean
  nftPrice?: string
}

export const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: BarChart3 },
  { id: 'k/defi' as Category, label: 'DeFi', icon: Award },
  { id: 'k/perp-dex' as Category, label: 'Perp DEX', icon: TrendingUp },
  { id: 'k/ai' as Category, label: 'AI Agents', icon: Flame },
  { id: 'k/memecoin' as Category, label: 'Memecoins', icon: Clock },
]

export const PROJECTS: Project[] = [
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    ticker: 'HYPE',
    category: 'k/perp-dex',
    color: '#8B5CF6',
    rank: 1,
    mindshare: 18.4,
    mindshareChange: 3.2,
    staked: 180000,
    sentiment: 92,
    reviewsCount: 312,
    price: '$7.42',
    volume24h: '$420M',
    marketCap: '$2.8B',
    aiVerdict: 'bullish',
    aiScore: 92,
    aiSummary: 'Hyperliquid has established itself as the leading on-chain perp DEX with CEX-like performance. User sentiment is overwhelmingly positive due to low fees, high throughput, and the new spot trading features.',
    keyPoints: [
      'Fastest execution speed in class (L1)',
      'Community loves the points program and airdrop speculation',
      'Volume consistently flipping major competitors',
      'Minor concerns about centralization of the validator set'
    ]
  },
  {
    id: 'aave',
    name: 'Aave V3',
    ticker: 'AAVE',
    category: 'k/defi',
    color: '#6366F1',
    rank: 2,
    mindshare: 14.2,
    mindshareChange: -0.8,
    staked: 125000,
    sentiment: 88,
    reviewsCount: 234,
    price: '$124.50',
    volume24h: '$150M',
    marketCap: '$1.8B',
    aiVerdict: 'neutral',
    aiScore: 85,
    aiSummary: 'Aave remains the DeFi lending standard but faces competition from newer isolated lending markets. Governance is active but slow.',
    keyPoints: [
      'Unchallenged TVL dominance',
      'Solid risk management track record',
      'GHO stablecoin adoption is slow but steady'
    ]
  },
  {
    id: 'uniswap',
    name: 'Uniswap V4',
    ticker: 'UNI',
    category: 'k/defi',
    color: '#EC4899',
    rank: 3,
    mindshare: 12.1,
    mindshareChange: 1.5,
    staked: 98000,
    sentiment: 85,
    reviewsCount: 189,
    price: '$7.80',
    volume24h: '$300M',
    marketCap: '$4.6B',
    aiVerdict: 'neutral',
    aiScore: 85,
    aiSummary: 'Uniswap remains the AMM king but faces stiff competition and fee fatigue. v4 hooks are highly anticipated but v3 concentration management remains a pain point.',
    keyPoints: [
      'Unchallenged TVL dominance',
      'v4 Hooks generating developer excitement',
      'Governance proposals causing some friction',
      'User experience still relies heavily on aggregators'
    ]
  },
  {
    id: 'ai16z',
    name: 'ai16z',
    ticker: 'AI16Z',
    category: 'k/ai',
    color: '#10B981',
    rank: 4,
    mindshare: 9.8,
    mindshareChange: 5.1,
    staked: 92000,
    sentiment: 78,
    reviewsCount: 167,
    price: '$0.45',
    volume24h: '$12M',
    marketCap: '$45M',
    aiVerdict: 'bullish',
    aiScore: 88,
    aiSummary: 'Leading the AI agent narrative. Their framework is being adopted across the ecosystem. The team ships fast and the community is engaged.',
    keyPoints: [
        'First mover in AI agent DAOs',
        'Strong developer community',
        'Eliza framework adoption is growing'
    ]
  },
  {
    id: 'popcat',
    name: 'POPCAT',
    ticker: 'POPCAT',
    category: 'k/memecoin',
    color: '#F59E0B',
    rank: 5,
    mindshare: 8.3,
    mindshareChange: -2.1,
    staked: 76000,
    sentiment: 71,
    reviewsCount: 298,
    price: '$0.88',
    volume24h: '$85M',
    marketCap: '$880M',
    aiVerdict: 'bullish',
    aiScore: 78,
    aiSummary: 'Pure vibes. Community is resilient and distribution is well-spread. No utility, just pop.',
    keyPoints: [
        'Culturally significant meme',
        'Resilient price action',
        'High social engagement'
    ]
  },
  {
    id: 'pepe',
    name: 'PEPE',
    ticker: 'PEPE',
    category: 'k/memecoin',
    color: '#EF4444',
    rank: 10, // Assuming rank 10 based on mindshare board mock
    mindshare: 4.7,
    mindshareChange: -3.5,
    staked: 54000,
    sentiment: 65,
    reviewsCount: 187,
    price: '$0.000008',
    volume24h: '$400M',
    marketCap: '$3.5B',
    aiVerdict: 'bullish',
    aiScore: 88,
    aiSummary: 'PEPE has solidified its status as a blue-chip meme. The community is resilient and distribution is well-spread.',
    keyPoints: [
      'Strongest culturally relevant meme since DOGE',
      'Holder count growing steadily',
      'No utility, purely vibes',
      'Whale accumulation detected on-chain'
    ]
  },
  {
      id: 'gmx',
      name: 'GMX V2',
      ticker: 'GMX',
      category: 'k/perp-dex',
      color: '#3B82F6',
      rank: 6,
      mindshare: 7.6,
      mindshareChange: -0.3,
      staked: 156000,
      sentiment: 90,
      reviewsCount: 278,
      price: '$45.20',
      volume24h: '$80M',
      marketCap: '$400M',
      aiVerdict: 'bullish',
      aiScore: 86,
      aiSummary: 'Solid perp DEX with great tokenomics. The GLP/GM model is innovative.',
      keyPoints: ['Real yield generation', 'Strong community trust', 'V2 improved capital efficiency']
  },
    {
      id: 'virtuals',
      name: 'Virtuals',
      ticker: 'VIRTUAL',
      category: 'k/ai',
      color: '#14B8A6',
      rank: 7,
      mindshare: 6.4,
      mindshareChange: 8.7,
      staked: 45000,
      sentiment: 82,
      reviewsCount: 89,
      price: '$1.20',
      volume24h: '$25M',
      marketCap: '$120M',
      aiVerdict: 'bullish',
      aiScore: 82,
      aiSummary: 'Emerging protocol for virtual assets. High growth potential.',
      keyPoints: ['Novel asset class', 'Rapidly growing ecosystem']
  },
  {
      id: 'lido',
      name: 'Lido',
      ticker: 'LDO',
      category: 'k/defi',
      color: '#F97316',
      rank: 8,
      mindshare: 5.9,
      mindshareChange: -1.2,
      staked: 65000,
      sentiment: 84,
      reviewsCount: 142,
      price: '$2.10',
      volume24h: '$60M',
      marketCap: '$1.8B',
      aiVerdict: 'neutral',
      aiScore: 80,
      aiSummary: 'Dominant liquid staking provider. Governance concerns persist.',
      keyPoints: ['Market leader', 'Centralization risks debated']
  },
  {
      id: 'dydx',
      name: 'dYdX V4',
      ticker: 'DYDX',
      category: 'k/perp-dex',
      color: '#6D28D9',
      rank: 9,
      mindshare: 5.1,
      mindshareChange: 0.4,
      staked: 134000,
      sentiment: 87,
      reviewsCount: 245,
      price: '$3.50',
      volume24h: '$200M',
      marketCap: '$1.5B',
      aiVerdict: 'neutral',
      aiScore: 78,
      aiSummary: 'Migration to Cosmos chain complete. Good performance but segregated liquidity.',
      keyPoints: ['High performance chain', 'User migration friction']
  }
]

export const REVIEWS: Review[] = [
  {
    id: '1',
    projectId: 'hyperliquid',
    author: '0x742d...fE23',
    authorReputation: 1250,
    content: 'Best perp DEX I\'ve used. The execution speed is incredible - feels like a CEX but fully on-chain. UI is clean, fees are competitive. The only downside is the learning curve for new users. Overall, this is the future of derivatives trading.',
    rating: 4.8,
    upvotes: 847,
    comments: 156,
    timestamp: '2025-02-02T10:30:00Z',
    stakedAmount: '2,500',
    isNFT: true,
    nftPrice: '0.15'
  },
  {
    id: '2',
    projectId: 'pepe',
    author: '0x8ba1...b27',
    authorReputation: 890,
    content: 'The OG memecoin of 2023. Community is still strong, volume is consistent. Not financial advice but this one has staying power compared to most memes. The memes are fire too 🔥',
    rating: 4.2,
    upvotes: 623,
    comments: 89,
    timestamp: '2025-02-02T08:15:00Z',
    stakedAmount: '1,000',
    isNFT: true
  },
  {
    id: '3',
    projectId: 'aave',
    author: '0x5aAe...BeAed',
    authorReputation: 2100,
    content: 'Battle-tested DeFi infrastructure. Highest TVL, best risk management in the space. The V3 upgrade brought efficiency mode and isolation mode which are game changers. This is the gold standard for lending protocols.',
    rating: 4.9,
    upvotes: 1243,
    comments: 234,
    timestamp: '2025-02-01T22:00:00Z',
    stakedAmount: '5,000',
    isNFT: true,
    nftPrice: '0.25'
  },
  {
    id: '4',
    projectId: 'ai16z',
    author: '0x1234...7890',
    authorReputation: 450,
    content: 'Leading the AI agent narrative. Their framework is being adopted across the ecosystem. The team ships fast and the community is engaged. Watching this space closely.',
    rating: 4.5,
    upvotes: 456,
    comments: 67,
    timestamp: '2025-02-02T06:45:00Z',
    stakedAmount: '1,500',
    isNFT: false
  },
  {
    id: '5',
    projectId: 'gmx',
    author: '0x9876...3210',
    authorReputation: 780,
    content: 'Solid perp DEX with great tokenomics. The GLP model is innovative - LPs providing liquidity while earning fees. V2 improvements make it more capital efficient. Competition is heating up but GMX has first mover advantage.',
    rating: 4.6,
    upvotes: 389,
    comments: 45,
    timestamp: '2025-02-02T04:20:00Z',
    stakedAmount: '800',
    isNFT: true
  }
]
