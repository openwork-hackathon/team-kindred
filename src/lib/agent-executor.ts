import { prisma } from '@/lib/prisma'

/**
 * Generic Agent Execution Loop
 * 
 * All agents (Steve, Patrick, Buffett) use this template
 * Just change step_kinds and execution function
 * 
 * Usage:
 * - Steve: step_kinds = ['build', 'test', 'deploy']
 * - Patrick: step_kinds = ['code_review', 'audit', 'security_check']
 * - Buffett: step_kinds = ['analyze', 'vote', 'research']
 */

interface AgentConfig {
  agent_id: string // 'steve' | 'patrick' | 'buffett'
  step_kinds: string[] // Types of steps this agent can execute
  executors: Record<string, (step: any) => Promise<any>>
  loop_interval_ms?: number
}

export class AgentExecutor {
  private config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = {
      loop_interval_ms: 30000, // Check every 30s
      ...config,
    }
  }

  /**
   * Main execution loop
   * Should run continuously in background
   */
  async startLoop() {
    console.log(`🤖 ${this.config.agent_id} starting execution loop...`)

    while (true) {
      try {
        // 1. Find next queued step
        const step = await this.claimNextStep()

        if (!step) {
          // No work, sleep
          await this.sleep(this.config.loop_interval_ms)
          continue
        }

        // 2. Execute step
        const result = await this.executeStep(step)

        // 3. Mark complete + emit event
        await this.completeStep(step, result)
      } catch (error) {
        console.error(`${this.config.agent_id} loop error:`, error)
        await this.sleep(this.config.loop_interval_ms)
      }
    }
  }

  /**
   * Find and claim next step
   */
  private async claimNextStep() {
    try {
      // Look for queued steps matching this agent's capabilities
      const step = await prisma.ops_mission_steps.findFirst({
        where: {
          status: 'queued',
          step_kind: { in: this.config.step_kinds },
        },
        orderBy: { created_at: 'asc' },
      })

      if (!step) return null

      // Claim it
      await prisma.ops_mission_steps.update({
        where: { id: step.id },
        data: {
          status: 'running',
          reserved_by: this.config.agent_id,
          reserved_at: new Date(),
          started_at: new Date(),
        },
      })

      return step
    } catch (error) {
      console.error(`${this.config.agent_id} claim error:`, error)
      return null
    }
  }

  /**
   * Execute the step using appropriate executor
   */
  private async executeStep(step: any) {
    try {
      const executor = this.config.executors[step.step_kind]

      if (!executor) {
        throw new Error(`No executor for step_kind: ${step.step_kind}`)
      }

      console.log(
        `${this.config.agent_id} executing ${step.step_kind}#${step.id}...`
      )

      const result = await executor(step)

      return {
        success: true,
        result,
      }
    } catch (error) {
      console.error(
        `${this.config.agent_id} execution error for ${step.step_kind}:`,
        error
      )
      return {
        success: false,
        error: String(error),
      }
    }
  }

  /**
   * Mark step as complete and emit event
   */
  private async completeStep(step: any, execution: any) {
    try {
      const status = execution.success ? 'completed' : 'failed'

      await prisma.ops_mission_steps.update({
        where: { id: step.id },
        data: {
          status,
          result: execution.result,
          error: execution.error || null,
          completed_at: new Date(),
        },
      })

      // Emit event
      await prisma.ops_agent_events.create({
        data: {
          agent_id: this.config.agent_id,
          event_type: status === 'completed' ? 'step_completed' : 'step_failed',
          event_data: {
            step_kind: step.step_kind,
            duration_ms: Date.now() - step.started_at?.getTime(),
            ...execution,
          },
          step_id: step.id,
          mission_id: step.mission_id,
          created_at: new Date(),
        },
      })

      // Check if mission is done
      await this.maybeFinalizeMission(step.mission_id)

      console.log(
        `✅ ${this.config.agent_id} completed ${step.step_kind}#${step.id}`
      )
    } catch (error) {
      console.error(`${this.config.agent_id} completion error:`, error)
    }
  }

  /**
   * Check if all steps in mission are complete
   */
  private async maybeFinalizeMission(mission_id: string) {
    try {
      const mission = await prisma.ops_missions.findUnique({
        where: { id: mission_id },
        include: {
          steps: true,
        },
      })

      if (!mission) return

      const all_done = mission.steps.every(
        (s) => s.status === 'completed' || s.status === 'failed'
      )

      if (all_done) {
        const failed_count = mission.steps.filter(
          (s) => s.status === 'failed'
        ).length

        await prisma.ops_missions.update({
          where: { id: mission_id },
          data: {
            status: failed_count > 0 ? 'failed' : 'succeeded',
            finalized_at: new Date(),
          },
        })

        console.log(
          `🎯 Mission ${mission_id} finalized (${failed_count} failures)`
        )
      }
    } catch (error) {
      console.error(`${this.config.agent_id} finalize error:`, error)
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Example configurations for each agent
 */

export const STEVE_CONFIG: AgentConfig = {
  agent_id: 'steve',
  step_kinds: ['build', 'test', 'deploy'],
  executors: {
    build: async (step) => {
      // Steve implements: run build process
      // Example: npm run build
      return { status: 'ok' }
    },
    test: async (step) => {
      // Steve implements: run tests
      // Example: npm test
      return { status: 'ok' }
    },
    deploy: async (step) => {
      // Steve implements: deploy to Base Sepolia
      // Example: vercel deploy --prod
      return { status: 'ok' }
    },
  },
}

export const PATRICK_CONFIG: AgentConfig = {
  agent_id: 'patrick',
  step_kinds: ['code_review', 'audit', 'security_check'],
  executors: {
    code_review: async (step) => {
      // Patrick implements: review code
      return { status: 'ok' }
    },
    audit: async (step) => {
      // Patrick implements: audit contracts
      // Example: slither + manual review
      return { status: 'ok' }
    },
    security_check: async (step) => {
      // Patrick implements: security check
      return { status: 'ok' }
    },
  },
}

export const BUFFETT_CONFIG: AgentConfig = {
  agent_id: 'buffett',
  step_kinds: ['analyze', 'vote', 'research'],
  executors: {
    analyze: async (step) => {
      // Buffett implements: market analysis
      return { status: 'ok' }
    },
    vote: async (step) => {
      // Buffett implements: vote on market
      return { status: 'ok' }
    },
    research: async (step) => {
      // Buffett implements: research
      return { status: 'ok' }
    },
  },
}
