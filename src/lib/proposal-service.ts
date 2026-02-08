/**
 * Proposal Service
 * 
 * Single entry point for all proposal creation.
 * Handles: cap gates → auto-approve → mission creation → step generation
 * 
 * All paths (API, triggers, reactions) must use this.
 */

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ProposalServiceInput {
  source: 'api' | 'trigger' | 'reaction';
  title: string;
  description?: string;
  step_kinds: string[];
  auto_approve?: boolean;
  created_by?: string;
}

export interface ProposalServiceResult {
  status: 'approved' | 'rejected' | 'pending';
  proposal_id: string;
  mission_id?: string;
  reason?: string;
}

/**
 * Cap Gates: Prevent queue buildup by rejecting early
 */
async function checkCapGates(step_kinds: string[]): Promise<{ ok: boolean; reason?: string }> {
  // Check if system is at capacity
  const { data: policies } = await sb
    .from('ops_policy')
    .select('name, value')
    .in('name', [
      'agent_daily_cap_steve',
      'agent_daily_cap_patrick',
      'agent_daily_cap_buffett',
    ]);

  // For each agent, check their daily task count
  const { data: stepsToday } = await sb
    .from('ops_mission_steps')
    .select('reserved_by')
    .gte('created_at', getTodayStart())
    .eq('status', 'completed');

  // Count tasks per agent
  const agentCounts = {
    steve: stepsToday?.filter((s) => s.reserved_by === 'steve').length || 0,
    patrick: stepsToday?.filter((s) => s.reserved_by === 'patrick').length || 0,
    buffett: stepsToday?.filter((s) => s.reserved_by === 'buffett').length || 0,
  };

  // Check if any agent is over capacity
  for (const policy of policies || []) {
    const agentId = policy.name.replace('agent_daily_cap_', '');
    const cap = policy.value.max_tasks;
    const count = agentCounts[agentId as keyof typeof agentCounts];

    if (count >= cap) {
      return {
        ok: false,
        reason: `Agent ${agentId} has reached daily task cap (${count}/${cap})`,
      };
    }
  }

  return { ok: true };
}

/**
 * Evaluate Auto-Approve
 * Check if proposal should be auto-approved based on policies
 */
async function evaluateAutoApprove(
  step_kinds: string[]
): Promise<{ approved: boolean; reason?: string }> {
  const { data: policy } = await sb
    .from('ops_policy')
    .select('value')
    .eq('name', 'auto_approve_step_kinds')
    .single();

  if (!policy) {
    return { approved: false, reason: 'No auto-approve policy found' };
  }

  const allowed = policy.value.allowed || [];
  const allAllowed = step_kinds.every((kind) => allowed.includes(kind));

  if (!allAllowed) {
    const disallowed = step_kinds.filter((kind) => !allowed.includes(kind));
    return {
      approved: false,
      reason: `Steps not in auto-approve list: ${disallowed.join(', ')}`,
    };
  }

  return { approved: true };
}

/**
 * Create Mission & Steps
 * Called only after proposal is approved
 */
async function createMissionAndSteps(
  proposal_id: string,
  step_kinds: string[]
): Promise<{ mission_id: string; step_count: number }> {
  // Create mission
  const { data: mission, error: missionError } = await sb
    .from('ops_missions')
    .insert({
      proposal_id,
      title: `Mission from ${proposal_id}`,
      status: 'pending',
      step_count: step_kinds.length,
      completed_count: 0,
      failed_count: 0,
    })
    .select('id')
    .single();

  if (missionError) throw missionError;

  // Create steps
  const steps = step_kinds.map((kind, idx) => ({
    mission_id: mission.id,
    step_kind: kind,
    step_order: idx + 1,
    status: 'queued',
  }));

  const { error: stepsError } = await sb.from('ops_mission_steps').insert(steps);

  if (stepsError) throw stepsError;

  // Emit event
  await emitEvent('mission_created', {
    mission_id: mission.id,
    proposal_id,
    step_count: step_kinds.length,
  });

  return { mission_id: mission.id, step_count: step_kinds.length };
}

/**
 * Main Entry Point
 */
export async function createProposalAndMaybeAutoApprove(
  input: ProposalServiceInput
): Promise<ProposalServiceResult> {
  try {
    // 1. Check cap gates
    const gateCheck = await checkCapGates(input.step_kinds);
    if (!gateCheck.ok) {
      // Reject proposal, don't queue it
      const { data: proposal } = await sb
        .from('ops_proposals')
        .insert({
          ...input,
          status: 'rejected',
          rejection_reason: gateCheck.reason,
        })
        .select('id')
        .single();

      return {
        status: 'rejected',
        proposal_id: proposal?.id || 'unknown',
        reason: gateCheck.reason,
      };
    }

    // 2. Create proposal
    const { data: proposal, error: propError } = await sb
      .from('ops_proposals')
      .insert({
        ...input,
        status: 'pending',
      })
      .select('id')
      .single();

    if (propError) throw propError;

    // 3. Evaluate auto-approve
    const approvalCheck = await evaluateAutoApprove(input.step_kinds);

    if (approvalCheck.approved) {
      // 4. Auto-approve + create mission
      const { error: updateError } = await sb
        .from('ops_proposals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', proposal.id);

      if (updateError) throw updateError;

      // 5. Create mission & steps
      const { mission_id, step_count } = await createMissionAndSteps(
        proposal.id,
        input.step_kinds
      );

      // Emit event
      await emitEvent('proposal_approved', {
        proposal_id: proposal.id,
        mission_id,
        step_count,
      });

      return {
        status: 'approved',
        proposal_id: proposal.id,
        mission_id,
      };
    } else {
      // Proposal stays pending, needs manual review
      await emitEvent('proposal_pending_review', {
        proposal_id: proposal.id,
        reason: approvalCheck.reason,
      });

      return {
        status: 'pending',
        proposal_id: proposal.id,
        reason: approvalCheck.reason,
      };
    }
  } catch (error) {
    console.error('Proposal service error:', error);
    throw error;
  }
}

/**
 * Emit Event to Event Stream
 */
export async function emitEvent(
  event_type: string,
  event_data: Record<string, any>,
  agent_id: string = 'system'
): Promise<void> {
  await sb.from('ops_agent_events').insert({
    agent_id,
    event_type,
    event_data,
    created_at: new Date().toISOString(),
  });
}

/**
 * Check Mission Completion
 * Called after each step completes
 */
export async function maybeFinalizeMissionIfDone(mission_id: string): Promise<void> {
  const { data: steps } = await sb
    .from('ops_mission_steps')
    .select('status')
    .eq('mission_id', mission_id);

  if (!steps) return;

  const completed = steps.filter((s) => s.status === 'completed').length;
  const failed = steps.filter((s) => s.status === 'failed').length;
  const total = steps.length;

  // If all done, finalize
  if (completed + failed === total) {
    const finalStatus = failed === 0 ? 'succeeded' : 'failed';

    await sb
      .from('ops_missions')
      .update({
        status: finalStatus,
        completed_count: completed,
        failed_count: failed,
        finalized_at: new Date().toISOString(),
      })
      .eq('id', mission_id);

    await emitEvent('mission_finalized', {
      mission_id,
      status: finalStatus,
      completed,
      failed,
      total,
    });
  }
}

/**
 * Get Today's Start (UTC)
 */
function getTodayStart(): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
}

/**
 * API Route Handler
 */
export async function handleCreateProposal(req: any, res: any) {
  try {
    const input = req.body as ProposalServiceInput;
    const result = await createProposalAndMaybeAutoApprove(input);

    res.status(result.status === 'rejected' ? 400 : 200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
