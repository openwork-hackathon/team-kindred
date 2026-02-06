/**
 * x402 Payment Protocol Implementation
 * 
 * HTTP 402 Payment Required for gated content
 * Based on Coinbase x402 spec: https://x402.org
 * 
 * Flow:
 * 1. GET /api/x402?contentId=xxx → Returns 402 with payment requirements
 * 2. POST /api/x402 { contentId, paymentProof } → Verify payment, return content
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMessage } from 'viem'

export const dynamic = 'force-dynamic'

// Treasury address for receiving payments
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'

// Minimum payment amount (in wei) - 0.001 ETH
const MIN_PAYMENT = BigInt('1000000000000000')

// Content types that can be gated
type GatedContentType = 'review' | 'analysis' | 'report'

interface PaymentRequirements {
  accepts: 'ethereum' | 'base'
  chainId: number
  payTo: string
  maxAmountRequired: string
  asset: string // native or token address
  assetDecimals: number
  expires: number // Unix timestamp
  contentId: string
  contentType: GatedContentType
  extra?: {
    scheme: string
    network: string
    version: string
  }
}

/**
 * GET - Request to access gated content
 * Returns 402 with payment requirements if not paid
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get('contentId')
  const contentType = searchParams.get('type') as GatedContentType || 'review'
  const userAddress = searchParams.get('address')?.toLowerCase()

  if (!contentId) {
    return NextResponse.json({ error: 'Missing contentId' }, { status: 400 })
  }

  try {
    // Check if user already has access
    if (userAddress) {
      const existingAccess = await prisma.contentAccess.findUnique({
        where: {
          contentId_userAddress: {
            contentId,
            userAddress,
          },
        },
      })

      if (existingAccess) {
        // User has access, return the content
        const content = await getContent(contentId, contentType)
        return NextResponse.json({
          status: 'unlocked',
          content,
        })
      }
    }

    // Get pricing from content
    const price = await getContentPrice(contentId, contentType)
    
    // Generate payment requirements (x402 spec)
    const requirements: PaymentRequirements = {
      accepts: 'base',
      chainId: 8453, // Base Mainnet
      payTo: TREASURY_ADDRESS,
      maxAmountRequired: price.toString(),
      asset: 'native', // ETH on Base
      assetDecimals: 18,
      expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      contentId,
      contentType,
      extra: {
        scheme: 'x402',
        network: 'base',
        version: '1.0',
      },
    }

    // Return 402 Payment Required
    return new NextResponse(
      JSON.stringify({
        status: 'payment_required',
        requirements,
        message: `Payment of ${formatEther(BigInt(price))} ETH required to access this content`,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-402-Payment': JSON.stringify(requirements),
        },
      }
    )
  } catch (error) {
    console.error('[x402] Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

/**
 * POST - Submit payment proof and unlock content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentType, paymentProof, userAddress, txHash } = body

    if (!contentId || !userAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedAddress = userAddress.toLowerCase()

    // Verify payment
    // Option 1: Verify transaction on-chain
    if (txHash) {
      const isValid = await verifyTransaction(txHash, contentId, normalizedAddress)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment transaction' }, { status: 400 })
      }
    }
    // Option 2: Verify signed message (for off-chain proofs)
    else if (paymentProof) {
      const message = `Unlock content: ${contentId}`
      const isValid = await verifyMessage({
        address: normalizedAddress as `0x${string}`,
        message,
        signature: paymentProof as `0x${string}`,
      })
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Missing payment proof or tx hash' }, { status: 400 })
    }

    // Grant access
    await prisma.contentAccess.upsert({
      where: {
        contentId_userAddress: {
          contentId,
          userAddress: normalizedAddress,
        },
      },
      update: {
        txHash,
        updatedAt: new Date(),
      },
      create: {
        contentId,
        contentType: contentType || 'review',
        userAddress: normalizedAddress,
        txHash,
        paidAmount: MIN_PAYMENT.toString(),
      },
    })

    // Update unlock count on content
    if (contentType === 'review') {
      await prisma.review.update({
        where: { id: contentId },
        data: { 
          // Increment unlock count if field exists
          // unlockCount: { increment: 1 }
        },
      }).catch(() => {}) // Ignore if field doesn't exist
    }

    // Return unlocked content
    const content = await getContent(contentId, contentType || 'review')

    return NextResponse.json({
      status: 'unlocked',
      content,
      message: 'Content unlocked successfully',
    })
  } catch (error) {
    console.error('[x402] Payment verification error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}

// Helper functions

async function getContentPrice(contentId: string, contentType: GatedContentType): Promise<bigint> {
  // Default price: 0.001 ETH
  let price = MIN_PAYMENT

  if (contentType === 'review') {
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      select: { stakeAmount: true },
    })
    // Price based on stake: higher stake = higher unlock price
    if (review?.stakeAmount) {
      const stake = BigInt(review.stakeAmount)
      // Unlock price = 10% of stake, min 0.001 ETH
      price = stake / BigInt(10)
      if (price < MIN_PAYMENT) price = MIN_PAYMENT
    }
  }

  return price
}

async function getContent(contentId: string, contentType: GatedContentType) {
  if (contentType === 'review') {
    const review = await prisma.review.findUnique({
      where: { id: contentId },
      include: {
        reviewer: {
          select: {
            address: true,
            displayName: true,
            reputationScore: true,
          },
        },
        project: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })
    return review
  }

  // Add other content types as needed
  return null
}

async function verifyTransaction(
  txHash: string, 
  contentId: string, 
  userAddress: string
): Promise<boolean> {
  // TODO: Implement actual on-chain verification
  // 1. Fetch transaction from RPC
  // 2. Verify it's to our treasury
  // 3. Verify amount >= required
  // 4. Verify sender matches userAddress
  
  // For now, accept any non-empty txHash (will implement proper verification later)
  return txHash.length > 0
}

function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6)
}
