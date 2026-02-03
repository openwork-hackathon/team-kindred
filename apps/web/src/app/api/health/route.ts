import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/health
export async function GET() {
  const health = {
    status: 'ok',
    service: 'kindred-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    checks: {
      api: true,
      // Add more health checks as we add dependencies
      // database: await checkDatabase(),
      // polymarket: await checkPolymarket(),
    },
  }

  return NextResponse.json(health)
}
