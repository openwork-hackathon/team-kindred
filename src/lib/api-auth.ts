import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, Agent } from '@/lib/agents'

// Extract API key from Authorization header
export function getApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null
  
  // Support both "Bearer <key>" and just "<key>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return authHeader
}

// Middleware to validate API key and attach agent to request
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, agent: Agent) => Promise<NextResponse>
): Promise<NextResponse> {
  const apiKey = getApiKey(request)
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key', code: 'unauthorized' },
      { status: 401 }
    )
  }

  const agent = validateApiKey(apiKey)
  
  if (!agent) {
    return NextResponse.json(
      { error: 'Invalid API key', code: 'invalid_key' },
      { status: 401 }
    )
  }

  return handler(request, agent)
}

// CORS headers for API routes
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Helper to create JSON response with CORS
export function apiResponse(
  data: unknown,
  status = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}

// Helper for error responses
export function apiError(
  message: string,
  code: string,
  status = 400
): NextResponse {
  return NextResponse.json(
    { error: message, code },
    { status, headers: corsHeaders }
  )
}
