/**
 * Steve (Captain Hook) - Code Executor
 * 
 * Handles: build, test, deploy tasks
 * Called every 30s to check for queued tasks
 */

import { AgentExecutor } from '@/lib/agent-executor'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Steve's specific executors
 */
const STEVE_EXECUTORS = {
  build: async (step: any) => {
    console.log(`[Steve] Building...`)
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: '/Users/jhinresh/clawd/team-kindred',
    })
    return { stdout, stderr }
  },

  test: async (step: any) => {
    console.log(`[Steve] Testing...`)
    const { stdout, stderr } = await execAsync('npm test', {
      cwd: '/Users/jhinresh/clawd/team-kindred',
    })
    return { stdout, stderr }
  },

  deploy: async (step: any) => {
    console.log(`[Steve] Deploying to production...`)
    const { stdout, stderr } = await execAsync('vercel --prod --yes', {
      cwd: '/Users/jhinresh/clawd/team-kindred',
    })
    return { stdout, stderr }
  },
}

export const steveExecutor = new AgentExecutor({
  agent_id: 'steve',
  step_kinds: ['build', 'test', 'deploy'],
  executors: STEVE_EXECUTORS,
})

// Start loop when module loads
// In production: would run in a background worker
if (process.env.ENABLE_STEVE_EXECUTOR === 'true') {
  steveExecutor.startLoop().catch(console.error)
}
