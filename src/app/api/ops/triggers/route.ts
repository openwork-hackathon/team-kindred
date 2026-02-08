import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * /api/ops/triggers
 * 
 * Define & manage system triggers
 * Triggers are conditions that auto-create proposals
 */

// Built-in triggers
const BUILT_IN_TRIGGERS = [
  {
    id: 'trigger-1',
    name: 'new_comment_create_market',
    description: 'When new comment is created, auto-create LMSR market',
    condition: 'event.type === "comment_created"',
    cooldown_seconds: 0,
    action: {
      create_proposal: {
        title: 'Create LMSR market for comment {comment_id}',
        step_kinds: ['create_market'],
        auto_approve: true,
      },
    },
  },
  {
    id: 'trigger-2',
    name: 'code_deployed_trigger_audit',
    description: 'When code is deployed, auto-trigger audit',
    condition: 'event.type === "step_completed" && event.step_kind === "deploy"',
    cooldown_seconds: 60,
    action: {
      create_proposal: {
        title: 'Audit deployed contracts',
        step_kinds: ['code_review', 'security_check'],
        auto_approve: true,
      },
    },
  },
  {
    id: 'trigger-3',
    name: 'market_expired_trigger_settlement',
    description: 'When market expires, auto-trigger settlement',
    condition: 'event.type === "market_expired"',
    cooldown_seconds: 0,
    action: {
      create_proposal: {
        title: 'Settle market {market_id} and distribute rewards',
        step_kinds: ['settle_market', 'distribute_rewards'],
        auto_approve: true,
      },
    },
  },
]

export async function GET(request: NextRequest) {
  try {
    // For now, return built-in triggers
    // In production, would query ops_triggers table

    return NextResponse.json({
      triggers: BUILT_IN_TRIGGERS,
      total: BUILT_IN_TRIGGERS.length,
    })
  } catch (error) {
    console.error('Failed to fetch triggers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch triggers' },
      { status: 500 }
    )
  }
}

/**
 * Match event against trigger condition
 * Returns matching triggers
 */
export function matchTriggers(event: any): typeof BUILT_IN_TRIGGERS {
  return BUILT_IN_TRIGGERS.filter((trigger) => {
    try {
      // Simple condition matching
      // In production: use expression evaluator (safer)
      const condition = trigger.condition
        .replace('{event_type}', JSON.stringify(event.type))
        .replace('{step_kind}', JSON.stringify(event.step_kind))

      // Dangerous but for MVP:
      return eval(condition)
    } catch (e) {
      console.error(`Trigger condition failed: ${trigger.id}`, e)
      return false
    }
  })
}
