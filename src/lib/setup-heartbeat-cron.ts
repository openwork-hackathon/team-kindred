/**
 * Setup Heartbeat Cron Job
 * 
 * Invokes /api/ops/heartbeat every 5 minutes to:
 * 1. Evaluate triggers
 * 2. Process reaction queue
 * 3. Recover stale steps
 * 
 * This is typically set up during app initialization or via OpenClaw cron.
 */

import { CronJob } from 'cron'

let heartbeatJob: CronJob | null = null

/**
 * Start the heartbeat cron job
 * Runs every 5 minutes (*/5 * * * *)
 */
export function startHeartbeatCron(apiBaseUrl: string = 'http://localhost:3000') {
  if (heartbeatJob) {
    console.log('⚠️  Heartbeat cron already running')
    return
  }

  try {
    // Create cron job: every 5 minutes
    heartbeatJob = new CronJob(
      '*/5 * * * *', // Every 5 minutes
      async () => {
        try {
          console.log('💓 Heartbeat: Checking system health...')

          const response = await fetch(`${apiBaseUrl}/api/ops/heartbeat`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })

          const data = await response.json()

          if (data.success) {
            console.log(`✅ Heartbeat OK (${data.duration_ms}ms)`)
            console.log(
              `   - Triggers: ${data.triggers_evaluated}`,
              `- Reactions: ${data.reactions_processed}`,
              `- Recovered: ${data.stale_recovered}`
            )
          } else {
            console.error('❌ Heartbeat failed:', data.error)
          }
        } catch (error) {
          console.error('Heartbeat request failed:', error)
        }
      },
      null, // onComplete
      false, // start
      'UTC'
    )

    // Start the job
    heartbeatJob.start()
    console.log('🚀 Heartbeat cron started (every 5 minutes)')
  } catch (error) {
    console.error('Failed to start heartbeat cron:', error)
  }
}

/**
 * Stop the heartbeat cron job
 */
export function stopHeartbeatCron() {
  if (heartbeatJob) {
    heartbeatJob.stop()
    heartbeatJob = null
    console.log('⏹️  Heartbeat cron stopped')
  }
}

/**
 * Check if heartbeat cron is running
 */
export function isHeartbeatCronRunning(): boolean {
  return heartbeatJob?.running ?? false
}

/**
 * Get next run time
 */
export function getHeartbeatNextRunTime(): Date | null {
  return heartbeatJob?.nextDate().toDate() ?? null
}
