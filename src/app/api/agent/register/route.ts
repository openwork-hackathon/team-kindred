import { NextRequest } from 'next/server'
import { registerAgent } from '@/lib/agents'
import { apiResponse, apiError, corsHeaders } from '@/lib/api-auth'

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders })
}

// POST /api/agent/register - Register a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, walletAddress, description } = body

    if (!name) {
      return apiError('Missing required field: name', 'missing_name')
    }
    if (!walletAddress) {
      return apiError('Missing required field: walletAddress', 'missing_wallet')
    }

    const result = registerAgent(
      name,
      walletAddress,
      description || ''
    )

    if ('error' in result) {
      return apiError(result.error, 'registration_failed')
    }

    return apiResponse({
      success: true,
      agentId: result.agent.id,
      apiKey: result.apiKey,
      message: 'Agent registered successfully. Save your API key - it will not be shown again.',
    })
  } catch (error) {
    console.error('Agent registration error:', error)
    return apiError('Internal server error', 'internal_error', 500)
  }
}
