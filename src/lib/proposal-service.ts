/**
 * Proposal Service
 * 
 * Single entry point for all proposal creation.
 * Handles: cap gates → auto-approve → mission creation → step generation
 * 
 * All paths (API, triggers, reactions) must use this.
 */

import { prisma } from '@/lib/prisma'

export interface ProposalServiceInput {
  source: 'api' | 'trigger' | 'reaction'
  title: string
  description?: string
  step_kinds: string[]
  auto_approve?: boolean
  created_by?: string
}

export interface ProposalServiceResult {
  status: 'approved' | 'rejected' | 'pending'
  proposal_id: string
  mission_id?: string
  reason?: string
}

/**
 * Cap Gates: Prevent queue buildup by rejecting early
 */
async function checkCapGates(step_kinds: string[]): Promise<{ ok: boolean; reason?: string }> {
  try {
    // Check if system is at capacity
    const policies = await prisma.opsPolicy.findMany({
      where: {
        name: {
          in: ['agent_daily_cap_steve', 'agent_daily_cap_patrick', 'agent_daily_cap_buffett'],
        },
      },
    })

    // Count tasks completed today per agent
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const completedToday = await prisma.opsMissionStep.groupBy({
      by: ['reserved_by'],
      where: {
        status: 'completed',
        completed_at: {
          gte: today,
        },
      },
      _count: true,
    })

    // Build count map
    const agentCounts: Record<string, number> = {
      steve: 0,
      patrick: 0,
      buffett: 0,
    }

    for (const count of completedToday) {
      if (count.reserved_by) {
        agentCounts[count.reserved_by] = count._count
      }
    }

    // Check if any agent is over capacity
    for (const policy of policies) {
      const agentId = policy.name.replace('agent_daily_cap_', '')
      const value = JSON.parse(policy.value)
      const cap = value.max_tasks
      const count = agentCounts[agentId] || 0

      if (count >= cap) {
        return {
          ok: false,
          reason: `Agent ${agentId} has reached daily task cap (${count}/${cap})`,
        }
      }
    }

    return { ok: true }
  } catch (error) {
    console.error('Cap gate check error:', error)
    return { ok: false, reason: 'Cap gate check failed' }
  }
}

/**
 * Evaluate Auto-Approve
 * Check if proposal should be auto-approved based on policies
 */
async function evaluateAutoApprove(
  step_kinds: string[]
): Promise<{ approved: boolean; reason?: string }> {
  try {
    const policy = await prisma.opsPolicy.findUnique({
      where: { name: 'auto_approve_step_kinds' },
    })

    if (!policy) {
      return { approved: false, reason: 'No auto-approve policy found' }
    }

    const value = JSON.parse(policy.value)
    const allowed = value.allowed || []
    const allAllowed = step_kinds.every((kind) => allowed.includes(kind))

    if (!allAllowed) {
      const disallowed = step_kinds.filter((kind) => !allowed.includes(kind))
      return {
        approved: false,
        reason: `Steps not in auto-approve list: ${disallowed.join(', ')}`,
      }
    }

    return { approved: true }
  } catch (error) {
    console.error('Auto-approve evaluation error:', error)
    return { approved: false, reason: 'Auto-approve evaluation failed' }
  }
}

/**
 * Create Mission & Steps
 * Called only after proposal is approved
 */
async function createMissionAndSteps(
  proposal_id: string,
  title: string,
  step_kinds: string[]
): Promise<{ mission_id: string; step_count: number }> {
  try {
    // Create mission
    const mission = await prisma.opsMission.create({
      data: {
        proposal_id,
        title: `${title} - Mission`,
        status: 'pending',
        step_count: step_kinds.length,
        completed_count: 0,
        failed_count: 0,
      },
    })

    // Create steps
    const steps = step_kinds.map((kind, idx) => ({
      mission_id: mission.id,
      step_kind: kind,
      step_order: idx + 1,
      status: 'queued' as const,
    }))

    await prisma.opsMissionStep.createMany({
      data: steps,
    })

    // Emit event
    await emitEvent('system', 'mission_created', {
      mission_id: mission.id,
      proposal_id,
      step_count: step_kinds.length,
    })

    return { mission_id: mission.id, step_count: step_kinds.length }
  } catch (error) {
    console.error('Create mission error:', error)
    throw error
  }
}

/**
 * Main Entry Point
 */
export async function createProposalAndMaybeAutoApprove(
  input: ProposalServiceInput
): Promise<ProposalServiceResult> {
  try {
    // 1. Check cap gates
    const gateCheck = await checkCapGates(input.step_kinds)
    if (!gateCheck.ok) {
      // Reject proposal, don't queue it
      const proposal = await prisma.opsProposal.create({
        data: {
          title: input.title,
          description: input.description,
          step_kinds: input.step_kinds,
          source: input.source,
          created_by: input.created_by,
          status: 'rejected',
          rejection_reason: gateCheck.reason,
        },
      })

      return {
        status: 'rejected',
        proposal_id: proposal.id,
        reason: gateCheck.reason,
      }
    }

    // 2. Create proposal
    const proposal = await prisma.opsProposal.create({
      data: {
        title: input.title,
        description: input.description,
        step_kinds: input.step_kinds,
        source: input.source,
        created_by: input.created_by,
        status: 'pending',
      },
    })

    // 3. Evaluate auto-approve
    const approvalCheck = await evaluateAutoApprove(input.step_kinds)

    if (approvalCheck.approved) {
      // 4. Auto-approve
      await prisma.opsProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'approved',
          approved_at: new Date(),
        },
      })

      // 5. Create mission & steps
      const { mission_id, step_count } = await createMissionAndSteps(
        proposal.id,
        input.title,
        input.step_kinds
      )

      // Emit event
      await emitEvent('system', 'proposal_approved', {
        proposal_id: proposal.id,
        mission_id,
        step_count,
      })

      return {
        status: 'approved',
        proposal_id: proposal.id,
        mission_id,
      }
    } else {
      // Proposal stays pending, needs manual review
      await emitEvent('system', 'proposal_pending_review', {
        proposal_id: proposal.id,
        reason: approvalCheck.reason,
      })

      return {
        status: 'pending',
        proposal_id: proposal.id,
        reason: approvalCheck.reason,
      }
    }
  } catch (error) {
    console.error('Proposal service error:', error)
    throw error
  }
}

/**
 * Emit Event to Event Stream
 */
export async function emitEvent(
  agent_id: string,
  event_type: string,
  event_data: Record<string, any>
): Promise<void> {
  try {
    await prisma.opsAgentEvent.create({
      data: {
        agent_id,
        event_type,
        event_data: JSON.stringify(event_data),
      },
    })
  } catch (error) {
    console.error('Emit event error:', error)
  }
}

/**
 * Check Mission Completion
 * Called after each step completes
 */
export async function maybeFinalizeMissionIfDone(mission_id: string): Promise<void> {
  try {
    const mission = await prisma.opsMission.findUnique({
      where: { id: mission_id },
      include: { steps: true },
    })

    if (!mission) return

    const completed = mission.steps.filter((s) => s.status === 'completed').length
    const failed = mission.steps.filter((s) => s.status === 'failed').length
    const total = mission.steps.length

    // If all done, finalize
    if (completed + failed === total) {
      const finalStatus = failed === 0 ? 'succeeded' : 'failed'

      await prisma.opsMission.update({
        where: { id: mission_id },
        data: {
          status: finalStatus,
          completed_count: completed,
          failed_count: failed,
          finalized_at: new Date(),
        },
      })

      await emitEvent('system', 'mission_finalized', {
        mission_id,
        status: finalStatus,
        completed,
        failed,
        total,
      })
    }
  } catch (error) {
    console.error('Finalize mission error:', error)
  }
}

/**
 * API Route Handler
 */
export async function handleCreateProposal(req: any, res: any) {
  try {
    const input = req.body as ProposalServiceInput
    const result = await createProposalAndMaybeAutoApprove(input)

    res.status(result.status === 'rejected' ? 400 : 200).json(result)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
