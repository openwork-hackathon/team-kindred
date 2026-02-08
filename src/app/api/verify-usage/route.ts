import { NextRequest, NextResponse } from 'next/server'

// 協議配置 - 包含合約地址和支援的鏈
interface ProtocolConfig {
  name: string
  contracts: {
    [chainId: number]: string[]
  }
}

const PROTOCOLS: Record<string, ProtocolConfig> = {
  uniswap: {
    name: 'Uniswap',
    contracts: {
      1: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', '0xE592427A0AEce92De3Edee1F18E0157C05861564'], // Mainnet Router
      8453: ['0x2626664c2603336E57B271c5C0b26F421741e481'], // Base Universal Router
      84532: ['0x050E797f3625EC8785265e1d9BDd4799b97528A1'], // Base Sepolia
    },
  },
  aave: {
    name: 'Aave',
    contracts: {
      1: ['0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'], // Aave V2 Pool
      8453: ['0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'], // Aave V3 on Base
    },
  },
  compound: {
    name: 'Compound',
    contracts: {
      1: ['0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'], // Comptroller
      8453: ['0x46e6b214b524310239732D51387075E0e70970bf'], // Base Comet
    },
  },
  curve: {
    name: 'Curve',
    contracts: {
      1: ['0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'], // 3Pool
    },
  },
}

// 支援的鏈 ID 和名稱
const CHAIN_NAMES: Record<number, string> = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  84532: 'base-sepolia',
}

// 驗證用戶是否在指定協議上有使用記錄
export async function POST(request: NextRequest) {
  try {
    const { address, protocol, chainId = 8453 } = await request.json()

    if (!address || !protocol) {
      return NextResponse.json(
        { error: 'Missing address or protocol' },
        { status: 400 }
      )
    }

    const protocolConfig = PROTOCOLS[protocol.toLowerCase()]
    if (!protocolConfig) {
      return NextResponse.json(
        { verified: false, reason: `Unknown protocol: ${protocol}` },
        { status: 400 }
      )
    }

    const contractAddresses = protocolConfig.contracts[chainId] || []
    if (contractAddresses.length === 0) {
      return NextResponse.json(
        { verified: false, reason: `${protocol} not supported on chain ${chainId}` },
        { status: 400 }
      )
    }

    // 檢查協議使用
    const result = await checkProtocolUsage(address, contractAddresses, chainId)

    return NextResponse.json({
      verified: result.hasUsed,
      address,
      protocol: protocolConfig.name,
      chainId,
      txCount: result.txCount,
      lastTx: result.lastTx,
      message: result.hasUsed
        ? `✅ Verified: You have ${result.txCount} transaction(s) on ${protocolConfig.name}`
        : `❌ Not verified: No usage history on ${protocolConfig.name}. Please use the protocol first.`,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

interface UsageResult {
  hasUsed: boolean
  txCount: number
  lastTx?: string
}

// 使用 Alchemy API 檢查協議使用 (免費且快速)
async function checkProtocolUsage(
  address: string,
  contractAddresses: string[],
  chainId: number
): Promise<UsageResult> {
  try {
    // 使用 viem 的 publicClient 查詢交易
    // 這裡用簡化版：查詢 Basescan/Etherscan API
    const chainName = CHAIN_NAMES[chainId] || 'base-mainnet'

    // 嘗試用 Basescan API (免費)
    const apiUrl = getExplorerApiUrl(chainId)

    for (const contractAddress of contractAddresses) {
      const result = await checkTransactionsWithContract(
        apiUrl,
        address,
        contractAddress
      )

      if (result.hasUsed) {
        return result
      }
    }

    return { hasUsed: false, txCount: 0 }
  } catch (error) {
    console.error('Error checking protocol usage:', error)
    // 如果 API 失敗，返回 false 而不是默認 true
    return { hasUsed: false, txCount: 0 }
  }
}

function getExplorerApiUrl(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'https://api.etherscan.io/api'
    case 8453:
      return 'https://api.basescan.org/api'
    case 84532:
      return 'https://api-sepolia.basescan.org/api'
    default:
      return 'https://api.basescan.org/api'
  }
}

async function checkTransactionsWithContract(
  apiUrl: string,
  address: string,
  contractAddress: string
): Promise<UsageResult> {
  try {
    // 查詢用戶對該合約的交易
    const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=100`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Explorer API error:', response.status)
      return { hasUsed: false, txCount: 0 }
    }

    const data = await response.json()

    if (data.status !== '1' || !Array.isArray(data.result)) {
      // No transactions found or API error
      return { hasUsed: false, txCount: 0 }
    }

    // 過濾出與目標合約互動的交易
    const relevantTxs = data.result.filter((tx: any) =>
      tx.to?.toLowerCase() === contractAddress.toLowerCase() ||
      tx.from?.toLowerCase() === contractAddress.toLowerCase()
    )

    if (relevantTxs.length > 0) {
      return {
        hasUsed: true,
        txCount: relevantTxs.length,
        lastTx: relevantTxs[0].hash,
      }
    }

    return { hasUsed: false, txCount: 0 }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { hasUsed: false, txCount: 0 }
  }
}

// GET 端點：檢查支援的協議列表
export async function GET() {
  return NextResponse.json({
    protocols: Object.entries(PROTOCOLS).map(([key, config]) => ({
      id: key,
      name: config.name,
      chains: Object.keys(config.contracts).map(Number),
    })),
  })
}
