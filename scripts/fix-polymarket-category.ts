import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔧 Fixing Polymarket category...\n')
  
  const cache = await prisma.projectAnalysisCache.findUnique({
    where: { query: 'polymarket' }
  })
  
  if (!cache) {
    console.log('❌ No cache found for Polymarket')
    return
  }
  
  const analysis = JSON.parse(cache.result)
  console.log('Current type:', analysis.type)
  
  // Update type to Prediction
  analysis.type = 'Prediction'
  
  await prisma.projectAnalysisCache.update({
    where: { query: 'polymarket' },
    data: { result: JSON.stringify(analysis) }
  })
  
  console.log('✅ Updated Polymarket type to "Prediction"')
  console.log('\nNext time you visit Polymarket page, it will be categorized as k/prediction')
  
  await prisma.$disconnect()
}

main()
