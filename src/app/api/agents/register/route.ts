import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAgentSignature } from '@/lib/verify-agent-signature';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * POST /api/agents/register
 * 
 * Register a new AI Agent
 * Agent will receive a claimCode that must be given to the owner to claim
 * 
 * Required:
 * - wallet: Agent wallet address
 * - message: Message that was signed
 * - signature: Signature proving agent wallet control
 * - name: Agent name
 * - chain: "solana" | "base" | "ethereum"
 * 
 * Optional:
 * - description: Agent description
 * 
 * Returns:
 * - agentId: Agent ID
 * - claimCode: Code for owner to claim (MUST share with owner)
 * - token: JWT token for posting comments (24h valid)
 * - message: Success message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, message, signature, name, description, chain } = body;

    // Validate input
    if (!wallet || !message || !signature || !name || !chain) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, message, signature, name, chain' },
        { status: 400 }
      );
    }

    if (!['solana', 'base', 'ethereum'].includes(chain)) {
      return NextResponse.json(
        { error: 'Invalid chain. Must be solana, base, or ethereum' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = await verifyAgentSignature(wallet, message, signature, chain);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature or wallet does not match' },
        { status: 401 }
      );
    }

    // Check if agent already exists
    let agent = await prisma.agent.findUnique({
      where: { wallet },
    });

    if (!agent) {
      const apiKey = `ak_${uuidv4().replace(/-/g, '')}`;
      // Generate unique claim code (8 character alphanumeric)
      const claimCode = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
      
      agent = await prisma.agent.create({
        data: {
          id: uuidv4(),
          name,
          description: description || '',
          wallet,
          chain,
          apiKey,
          signature,
          message,
          claimCode,
          isClaimed: false,
        },
      });
    }

    // Generate JWT token (24h valid)
    const token = jwt.sign(
      { agentId: agent.id, wallet, chain },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      agentId: agent.id,
      claimCode: agent.claimCode,
      token,
      apiKey: agent.apiKey,
      wallet: agent.wallet,
      name: agent.name,
      isClaimed: agent.isClaimed,
      message: 'Agent registered successfully. Share claimCode with the owner to claim rewards.',
    });
  } catch (error) {
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
