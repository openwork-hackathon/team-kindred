import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS } from '@/lib/contracts'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

/**
 * GET /api/leaderboard/agents
 * Returns leaderboard of registered AI agents
 */
export async function GET() {
  try {
    const hookAddress = CONTRACTS.baseSepolia.kindredHookV2.address
    const hookABI = CONTRACTS.baseSepolia.kindredHookV2.abi as any
    const oracleAddress = CONTRACTS.baseSepolia.reputationOracle.address
    const oracleABI = CONTRACTS.baseSepolia.reputationOracle.abi as any

    // Known agents (from events or registration)
    // In production, index SwapWithPriority events where isAgent=true
    const knownAgents = [
      '0x872989F7fCd4048acA370161989d3904E37A3cB3', // Treasury (example)
    ]

    // Fetch data for each agent
    const agentData = await Promise.all(
      knownAgents.map(async (address) => {
        try {
          // Fetch each value separately to handle errors gracefully
          let isAgent = false
          let reputation = BigInt(0)
          let referralCount = BigInt(0)
          let pendingRewards = BigInt(0)

          try {
            isAgent = await client.readContract({
              address: hookAddress,
              abi: hookABI,
              functionName: 'isAgent',
              args: [address as `0x${string}`],
            }) as boolean
          } catch { /* Use default */ }

          if (!isAgent) return null

          try {
            reputation = await client.readContract({
              address: oracleAddress,
              abi: oracleABI,
              functionName: 'getScore',
              args: [address as `0x${string}`],
            }) as bigint
          } catch { /* Use default */ }

          try {
            const referralInfo = await client.readContract({
              address: hookAddress,
              abi: hookABI,
              functionName: 'getReferralInfo',
              args: [address as `0x${string}`],
            }) as [string, bigint, bigint]
            if (Array.isArray(referralInfo) && referralInfo.length >= 3) {
              referralCount = referralInfo[1]
              pendingRewards = referralInfo[2]
            }
          } catch { /* Use default */ }

          // Calculate priority
          const score = Number(reputation)
          let priority = 1
          if (score >= 850) priority = 3
          else if (score >= 600) priority = 2

          return {
            address,
            reputation: score,
            priority,
            referralCount: Number(referralCount),
            pendingRewards: pendingRewards.toString(),
            rank: 0, // Will be calculated after sorting
          }
        } catch (error) {
          console.error(`Error fetching data for ${address}:`, error)
          return null
        }
      })
    )

    // Filter out nulls and sort by reputation
    const agents = agentData
      .filter((agent): agent is NonNullable<typeof agent> => agent !== null)
      .sort((a, b) => b.reputation - a.reputation)
      .map((agent, index) => ({ ...agent, rank: index + 1 }))

    return NextResponse.json({
      agents,
      total: agents.length,
      updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Agent Leaderboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent leaderboard', details: (error as Error).message },
      { status: 500 }
    )
  }
}
