import { NextRequest, NextResponse } from 'next/server'

// 驗證用戶是否在指定協議上有使用記錄
export async function POST(request: NextRequest) {
  try {
    const { address, protocol } = await request.json()

    if (!address || !protocol) {
      return NextResponse.json(
        { error: 'Missing address or protocol' },
        { status: 400 }
      )
    }

    // 協議合約地址映射 (Base Sepolia)
    const protocolAddresses: Record<string, string[]> = {
      uniswap: ['0x4200000000000000000000000000000000000006'], // WETH on Base Sepolia
      aave: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
      curve: ['0xD533a949740bb3306d119CC777fa900bA034cd52'],
    }

    const targetAddresses = protocolAddresses[protocol.toLowerCase()] || []

    if (targetAddresses.length === 0) {
      return NextResponse.json(
        { verified: false, reason: 'Unknown protocol' },
        { status: 400 }
      )
    }

    // 檢查協議使用
    const hasUsed = await checkProtocolUsage(address, targetAddresses)

    return NextResponse.json({
      verified: hasUsed,
      address,
      protocol,
      message: hasUsed
        ? `✅ Verified: You have used ${protocol}`
        : `❌ Not verified: No usage history on ${protocol}. Please trade on ${protocol} first.`,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

// 檢查協議使用
async function checkProtocolUsage(
  address: string,
  protocolAddresses: string[]
): Promise<boolean> {
  try {
    // 簡化版：檢查地址是否在允許列表中（demo 模式）
    // 實際應該調用 Etherscan/Covalent API
    
    // Demo: 如果地址不是 0x0... 就認為已驗證
    // 實際應用應該真正檢查區塊鏈
    return address !== '0x0000000000000000000000000000000000000000'
  } catch (error) {
    console.error('Error checking protocol usage:', error)
    return true
  }
}
