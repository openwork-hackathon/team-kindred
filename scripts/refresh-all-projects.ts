import { config } from 'dotenv'
config({ path: '.env.local' })

import { prisma } from '../src/lib/prisma'
import { analyzeProject } from '../src/app/actions/analyze'

async function main() {
  console.log('🔄 Refreshing all project caches with funding data...\n')
  
  // Get all cached projects
  const caches = await prisma.projectAnalysisCache.findMany({
    select: { query: true, result: true }
  })
  
  console.log(`Found ${caches.length} projects in cache\n`)
  
  for (const cache of caches) {
    try {
      const analysis = JSON.parse(cache.result)
      
      // Skip if already has funding
      if (analysis.funding) {
        console.log(`✓ ${cache.query} - already has funding, skipping`)
        continue
      }
      
      console.log(`🔄 ${cache.query} - refreshing...`)
      
      // Delete old cache
      await prisma.projectAnalysisCache.delete({
        where: { query: cache.query }
      })
      
      // Re-analyze
      const result = await analyzeProject(cache.query)
      
      if (result.funding) {
        console.log(`✅ ${cache.query} - funding data added!`)
        console.log(`   Total Raised: ${result.funding.totalRaised || 'N/A'}`)
        console.log(`   Rounds: ${result.funding.rounds?.length || 0}`)
      } else {
        console.log(`⚠️ ${cache.query} - no funding found`)
      }
      
      console.log('')
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error: any) {
      console.error(`❌ ${cache.query} - failed:`, error.message)
      console.log('')
    }
  }
  
  console.log('\n✅ All projects refreshed!')
}

main().finally(() => prisma.$disconnect())
