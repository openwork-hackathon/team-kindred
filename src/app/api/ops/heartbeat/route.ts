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
  try {
    // Get all enabled triggers
    const triggers = await prisma.opsTrigger.findMany({
      where: { enabled: true },
    })

    // Get recent events that might match triggers
    const recentEvents = await prisma.opsAgentEvent.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 60000), // Last 60 seconds
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    })

    let triggered = 0

    // Check each event against each trigger
    for (const event of recentEvents) {
      for (const trigger of triggers) {
        // Check cooldown
        if (trigger.last_triggered) {
          const cooldownMs = trigger.cooldown_seconds * 1000
          if (Date.now() - trigger.last_triggered.getTime() < cooldownMs) {
            continue // Still in cooldown
          }
        }

        // Evaluate condition
        try {
          const eventData = JSON.parse(event.event_data)
          const condition = trigger.condition
            .replace('event.type', JSON.stringify(event.event_type))
            .replace('event.step_kind', JSON.stringify(eventData.step_kind || ''))

          // eslint-disable-next-line no-eval
          if (eval(condition)) {
            // Trigger matched! Create proposal
            const action = JSON.parse(trigger.action)
            
            await prisma.opsProposal.create({
              data: {
                title: action.create_proposal.title,
                step_kinds: action.create_proposal.step_kinds,
                source: 'trigger',
                created_by: trigger.id,
                auto_approve: action.create_proposal.auto_approve ?? false,
              },
            })

            // Update trigger cooldown
            await prisma.opsTrigger.update({
              where: { id: trigger.id },
              data: { last_triggered: new Date() },
            })

            triggered++
          }
        } catch (e) {
          console.error(`Trigger evaluation error for ${trigger.id}:`, e)
        }
      }
    }

    return triggered
  } catch (error) {
    console.error('Trigger evaluation failed:', error)
    return 0
  }
}

/**
 * Stage 2: Process Reaction Queue
 * 
 * When a step completes, check reaction matrix:
 * - If event matches pattern → trigger next proposal (probabilistic)
 */
async function processReactionQueue(): Promise<number> {
  try {
    // Get all pending reactions
    const reactions = await prisma.opsReactionQueue.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
      take: 10, // Process max 10 per heartbeat
    })

    let processed = 0

    for (const reaction of reactions) {
      try {
        // Get source event
        const sourceEvent = await prisma.opsAgentEvent.findUnique({
          where: { id: reaction.source_event_id },
        })

        if (!sourceEvent) {
          // Mark as failed if source event is missing
          await prisma.opsReactionQueue.update({
            where: { id: reaction.id },
            data: { status: 'failed' },
          })
          continue
        }

        // Parse event data
        const eventData = JSON.parse(sourceEvent.event_data)

        // For now: simple reaction logic
        // If a step completes, check if we should trigger next proposal
        if (sourceEvent.event_type === 'step_completed') {
          // Mark as processed
          await prisma.opsReactionQueue.update({
            where: { id: reaction.id },
            data: {
              status: 'completed',
              processed_at: new Date(),
            },
          })
          processed++
        } else {
          // Mark as completed even if no action taken
          await prisma.opsReactionQueue.update({
            where: { id: reaction.id },
            data: { status: 'completed' },
          })
          processed++
        }
      } catch (e) {
        console.error(`Reaction processing error for ${reaction.id}:`, e)
        await prisma.opsReactionQueue.update({
          where: { id: reaction.id },
          data: { status: 'failed' },
        })
      }
    }

    return processed
  } catch (error) {
    console.error('Reaction queue processing failed:', error)
    return 0
  }
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
