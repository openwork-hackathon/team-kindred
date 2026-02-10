// CoinGecko API Integration for project logos

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export interface CoinGeckoData {
  id: string
  symbol: string
  name: string
  image: {
    large: string
    small: string
    thumb: string
  }
  market_data?: {
    market_cap?: Record<string, number | null>
    current_price?: Record<string, number | null>
  }
}

// Hardcoded mappings for projects
const PROJECT_COINGECKO_IDS: Record<string, string> = {
  'Uniswap': 'uniswap',
  'Aave': 'aave',
  'Curve Finance': 'curve-dao-token',
  'Hyperliquid': 'hyperliquid',
  'Drift Protocol': 'drift-protocol',
  'Jupiter': 'jupiter',
  'Morpho': 'morpho',
  'Lido': 'lido',
  'Ethena': 'ethena',
  'Compound': 'compound-governance-token',
  'Circle': 'usd-coin', // Using USDC as proxy for Circle
  'ether.fi': 'ether-fi',
  'Jito': 'jito',
  'Sanctum': 'sanctum',
  'Lighter': 'lighter-1',
  'Aster': 'aster', // May not exist, will fallback
  'Solayer': 'solayer',
  'EigenLayer': 'eigenlayer',
  'Magic Eden': 'magic-eden',
  'Phantom Wallet': 'phantom', // May not exist
  'MetaMask': 'ethereum', // Using ETH as proxy
  'Polymarket': 'polymarket',
  'Kalshi': 'kalshi',
  'USDC': 'usd-coin',
  'Jupiter Exchange': 'jupiter',
  'Marinade Finance': 'marinade-staked-sol',
  'Orca': 'orca',
  'Raydium': 'raydium',
  'Serum': 'serum',
  'Arweave': 'arweave',
  'Render Network': 'render-token',
  'The Graph': 'the-graph',
  'Helium': 'helium',
  'Starknet': 'starknet',
}

export async function getCoinGeckoLogoUrl(projectName: string): Promise<string | null> {
  try {
    const coingeckoId = PROJECT_COINGECKO_IDS[projectName]
    if (!coingeckoId) {
      console.log(`No CoinGecko mapping for: ${projectName}`)
      return null
    }

    // Use cache-friendly endpoint without rate limiting issues
    const response = await fetch(
      `${COINGECKO_API}/coins/${coingeckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.warn(`CoinGecko API error for ${projectName}: ${response.status}`)
      return null
    }

    const data: CoinGeckoData = await response.json()
    
    // Return large image (512x512)
    return data.image?.large || null
  } catch (error) {
    console.error(`Failed to fetch CoinGecko data for ${projectName}:`, error)
    return null
  }
}

// Batch fetch multiple projects
export async function getCoinGeckoLogos(projectNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {}
  
  // Rate limit: 10-50 calls per minute for free tier
  // Stagger requests to avoid rate limiting
  for (const name of projectNames) {
    results[name] = await getCoinGeckoLogoUrl(name)
    await new Promise(resolve => setTimeout(resolve, 150)) // 150ms between requests
  }
  
  return results
}
