import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * /api/ops/heartbeat
 * 
 * System's beating heart (every 5 minutes via cron)
 * Responsibilities:
 * 1. Evaluate triggers (new comment → create market)
 * 2. Process reaction queue (step completed → next step)
 * 3. Promote insights (aggregate data)
 * 4. Recover stale steps (>30min stuck → mark failed)
 */

export const dynamic = 'force-dynamic'

interface Trigger {
  id: string
  condition: string
  cooldown_seconds: number
  action: any
  last_triggered?: Date
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const results = {
      triggers_evaluated: 0,
      reactions_processed: 0,
      stale_recovered: 0,
      errors: [] as string[],
    }

    // 1. EVALUATE TRIGGERS
    try {
      results.triggers_evaluated = await evaluateTriggers()
    } catch (e) {
      results.errors.push(`Trigger evaluation failed: ${e}`)
    }

    // 2. PROCESS REACTION QUEUE
    try {
      results.reactions_processed = await processReactionQueue()
    } catch (e) {
      results.errors.push(`Reaction processing failed: ${e}`)
    }

    // 3. RECOVER STALE STEPS
    try {
      results.stale_recovered = await recoverStaleSteps()
    } catch (e) {
      results.errors.push(`Stale recovery failed: ${e}`)
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: results.errors.length === 0,
      heartbeat_at: new Date().toISOString(),
      duration_ms: duration,
      ...results,
    })
  } catch (error) {
    console.error('Heartbeat failed:', error)
    return NextResponse.json(
      { error: 'Heartbeat failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Stage 1: Evaluate Triggers
 * 
 * Example triggers:
 * - new_comment → create_lmsr_market
 * - deployment_completed → trigger_audit
 * - market_expired → settle_market
 */
async function evaluateTriggers(): Promise<number> {
  // TODO: Query ops_triggers table
  // For now, return 0
  return 0
}

/**
 * Stage 2: Process Reaction Queue
 * 
 * When a step completes, check reaction matrix:
 * - If event matches pattern → trigger next proposal (probabilistic)
 */
async function processReactionQueue(): Promise<number> {
  // TODO: Query ops_reaction_queue
  // For now, return 0
  return 0
}

/**
 * Stage 3: Recover Stale Steps
 * 
 * If a step has been 'running' for >30 minutes:
 * - Mark as failed
 * - Emit failure event
 * - Free up for retry or escalation
 */
async function recoverStaleSteps(): Promise<number> {
  const STALE_THRESHOLD_MS = 30 * 60 * 1000 // 30 minutes

  try {
    const staleSteps = await prisma.ops_mission_steps.findMany({
      where: {
        status: 'running',
        started_at: {
          lt: new Date(Date.now() - STALE_THRESHOLD_MS),
        },
      },
    })

    let recovered = 0

    for (const step of staleSteps) {
      // Mark as failed
      await prisma.ops_mission_steps.update({
        where: { id: step.id },
        data: {
          status: 'failed',
          error: 'Stale timeout: step exceeded 30 minute limit',
          completed_at: new Date(),
        },
      })

      // Emit failure event
      await emitEvent({
        agent_id: step.reserved_by || 'unknown',
        event_type: 'step_failed',
        event_data: {
          reason: 'timeout',
          max_duration_minutes: 30,
        },
        step_id: step.id,
        mission_id: step.mission_id,
      })

      recovered++
    }

    return recovered
  } catch (error) {
    console.error('Stale recovery error:', error)
    return 0
  }
}

/**
 * Emit event to ops_agent_events
 */
async function emitEvent(event: any) {
  try {
    await prisma.ops_agent_events.create({
      data: {
        ...event,
        created_at: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to emit event:', error)
  }
}
