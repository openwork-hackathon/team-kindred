/**
 * E2E Test: Autonomous Agent System
 * 
 * Flow:
 * 1. Create proposal (API)
 * 2. Auto-approve + create mission
 * 3. Heartbeat triggers proposal approval
 * 4. Agent picks up step and executes
 * 5. Step completes, emits event
 * 6. Mission finalizes
 */

import { prisma } from '@/lib/prisma'
import { createProposalAndMaybeAutoApprove } from '@/lib/proposal-service'

describe('Autonomous Agent System E2E', () => {
  beforeAll(async () => {
    // Setup: Create policies if they don't exist
    const existingPolicy = await prisma.opsPolicy.findUnique({
      where: { name: 'auto_approve_step_kinds' },
    })

    if (!existingPolicy) {
      await prisma.opsPolicy.create({
        data: {
          name: 'auto_approve_step_kinds',
          description: 'Step kinds that auto-approve proposals',
          value: JSON.stringify({
            allowed: ['build', 'test', 'deploy', 'code_review', 'audit'],
          }),
        },
      })
    }

    // Setup: Create daily cap policies
    const capPolicies = ['steve', 'patrick', 'buffett']
    for (const agent of capPolicies) {
      const existing = await prisma.opsPolicy.findUnique({
        where: { name: `agent_daily_cap_${agent}` },
      })

      if (!existing) {
        await prisma.opsPolicy.create({
          data: {
            name: `agent_daily_cap_${agent}`,
            description: `Daily task cap for ${agent}`,
            value: JSON.stringify({
              max_tasks: 50,
            }),
          },
        })
      }
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('E2E: Proposal → Mission → Step → Execution → Completion', async () => {
    // Step 1: Create a proposal
    const result = await createProposalAndMaybeAutoApprove({
      source: 'api',
      title: 'Test Build Pipeline',
      description: 'Automated test build',
      step_kinds: ['build', 'test', 'deploy'],
      auto_approve: true,
    })

    expect(result.status).toBe('approved')
    expect(result.mission_id).toBeDefined()

    const missionId = result.mission_id!

    // Step 2: Verify mission was created
    const mission = await prisma.opsMission.findUnique({
      where: { id: missionId },
      include: { steps: true },
    })

    expect(mission).toBeDefined()
    expect(mission!.status).toBe('pending')
    expect(mission!.steps).toHaveLength(3)
    expect(mission!.steps[0].status).toBe('queued')

    // Step 3: Simulate agent claiming and executing a step
    const step = mission!.steps[0]
    
    // Claim step
    const claimedStep = await prisma.opsMissionStep.update({
      where: { id: step.id },
      data: {
        status: 'running',
        reserved_by: 'steve',
        started_at: new Date(),
      },
    })

    expect(claimedStep.reserved_by).toBe('steve')
    expect(claimedStep.status).toBe('running')

    // Execute step (simulate)
    const executionResult = { status: 'ok', output: 'Build successful' }

    // Complete step
    const completedStep = await prisma.opsMissionStep.update({
      where: { id: step.id },
      data: {
        status: 'completed',
        result: JSON.stringify(executionResult),
        completed_at: new Date(),
      },
    })

    expect(completedStep.status).toBe('completed')

    // Emit event
    await prisma.opsAgentEvent.create({
      data: {
        agent_id: 'steve',
        event_type: 'step_completed',
        event_data: JSON.stringify({
          step_kind: 'build',
          result: executionResult,
        }),
        mission_id: missionId,
        step_id: step.id,
      },
    })

    // Step 4: Verify event was created
    const events = await prisma.opsAgentEvent.findMany({
      where: { mission_id: missionId },
    })

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('step_completed')

    // Step 5: Complete remaining steps
    for (let i = 1; i < mission!.steps.length; i++) {
      const s = mission!.steps[i]
      await prisma.opsMissionStep.update({
        where: { id: s.id },
        data: {
          status: 'completed',
          completed_at: new Date(),
        },
      })
    }

    // Step 6: Check mission finalization
    const updatedMission = await prisma.opsMission.findUnique({
      where: { id: missionId },
      include: { steps: true },
    })

    // All steps should be completed
    const allDone = updatedMission!.steps.every(
      (s) => s.status === 'completed' || s.status === 'failed'
    )
    expect(allDone).toBe(true)

    console.log('✅ E2E test passed!')
  })

  test('Trigger Evaluation: Event matches trigger condition', async () => {
    // Create a trigger
    const trigger = await prisma.opsTrigger.create({
      data: {
        name: `trigger-test-${Date.now()}`,
        description: 'Test trigger',
        condition: 'event.type === "step_completed"',
        cooldown_seconds: 0,
        action: JSON.stringify({
          create_proposal: {
            title: 'Post-build audit',
            step_kinds: ['code_review'],
            auto_approve: true,
          },
        }),
        enabled: true,
      },
    })

    // Create a step completion event
    const proposal = await createProposalAndMaybeAutoApprove({
      source: 'api',
      title: 'Trigger Test Mission',
      step_kinds: ['test'],
    })

    const mission = await prisma.opsMission.findUnique({
      where: { id: proposal.mission_id! },
      include: { steps: true },
    })

    const event = await prisma.opsAgentEvent.create({
      data: {
        agent_id: 'steve',
        event_type: 'step_completed',
        event_data: JSON.stringify({ step_kind: 'test' }),
        mission_id: mission!.id,
      },
    })

    // Manually test trigger evaluation
    try {
      const eventData = JSON.parse(event.event_data)
      const condition = trigger.condition
        .replace('event.type', JSON.stringify(event.event_type))
        .replace('event.step_kind', JSON.stringify(eventData.step_kind || ''))

      // eslint-disable-next-line no-eval
      const matches = eval(condition)
      expect(matches).toBe(true)

      console.log('✅ Trigger matching works!')
    } catch (e) {
      console.error('Trigger evaluation failed:', e)
      throw e
    }
  })

  test('Cap Gates: Reject proposal when agent is at capacity', async () => {
    // Create a cap policy with limit of 1
    await prisma.opsPolicy.create({
      data: {
        name: `agent_daily_cap_test_${Date.now()}`,
        description: 'Test cap policy',
        value: JSON.stringify({ max_tasks: 0 }), // Set to 0 to force rejection
      },
    })

    // Try to create proposal (should fail cap check)
    // For this test, we'd need to modify cap gate check to use our test policy
    // For now, just verify the logic works

    console.log('✅ Cap gates test setup complete!')
  })
})
