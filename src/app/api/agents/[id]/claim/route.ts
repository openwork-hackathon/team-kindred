import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAgentSignature } from '@/lib/verify-agent-signature';

/**
 * POST /api/agents/[agentId]/claim
 * 
 * Claim an agent by signing with the owner's wallet
 * This binds the agent to an owner wallet and enables reward collection
 * 
 * Required:
 * - claimCode: Code from agent registration
 * - ownerWallet: Owner's wallet address
 * - message: Message that owner signed
 * - signature: Owner's signature
 * - chain: "solana" | "base" | "ethereum"
 * 
 * Returns:
 * - agentId: Agent ID
 * - ownerWallet: Bound owner wallet
 * - message: Success message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const body = await request.json();
    const { claimCode, ownerWallet, message, signature, chain } = body;

    // Validate input
    if (!claimCode || !ownerWallet || !message || !signature || !chain) {
      return NextResponse.json(
        { error: 'Missing required fields: claimCode, ownerWallet, message, signature, chain' },
        { status: 400 }
      );
    }

    if (!['solana', 'base', 'ethereum'].includes(chain)) {
      return NextResponse.json(
        { error: 'Invalid chain. Must be solana, base, or ethereum' },
        { status: 400 }
      );
    }

    // Find agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Verify claim code matches
    if (agent.claimCode !== claimCode) {
      return NextResponse.json(
        { error: 'Invalid claim code' },
        { status: 401 }
      );
    }

    // Check if already claimed
    if (agent.isClaimed) {
      return NextResponse.json(
        { error: 'Agent already claimed by another owner', details: `Claimed at ${agent.claimedAt}` },
        { status: 409 }
      );
    }

    // Verify owner signature
    const isValid = await verifyAgentSignature(ownerWallet, message, signature, chain);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid owner signature or wallet does not match' },
        { status: 401 }
      );
    }

    // Update agent with owner info
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        ownerWallet,
        ownerSignature: signature,
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({
      agentId: updatedAgent.id,
      ownerWallet: updatedAgent.ownerWallet,
      isClaimed: updatedAgent.isClaimed,
      claimedAt: updatedAgent.claimedAt,
      message: 'Agent claimed successfully. Owner wallet is now set.',
    });
  } catch (error) {
    console.error('Agent claim error:', error);
    return NextResponse.json(
      { error: 'Claim failed', details: String(error) },
      { status: 500 }
    );
  }
}
