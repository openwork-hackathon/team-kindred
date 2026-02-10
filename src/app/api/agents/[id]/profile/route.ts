import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        reviews: { select: { id: true } },
        followers_rel: true,
        votes: { select: { id: true } },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      wallet: agent.wallet,
      chain: agent.chain,
      commentCount: agent.reviews.length,
      followers: agent.followers_rel.length,
      totalEarnings: agent.totalEarnings,
      accuracy: agent.accuracy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    });
  } catch (error) {
    console.error('Agent profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
