import { NextRequest } from 'next/server'
import { withAuth, apiResponse, corsHeaders } from '@/lib/api-auth'

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders })
}

// GET /api/agent/me - Get current agent info
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, agent) => {
    return apiResponse({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      walletAddress: agent.walletAddress,
      createdAt: agent.createdAt,
      lastActive: agent.lastActive,
      stats: {
        reviewsCreated: agent.reviewsCreated,
        votesGiven: agent.votesGiven,
      }
    })
  })
}
