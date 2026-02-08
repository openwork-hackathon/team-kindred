import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  // 只保留允許的分類
  const validCategories = ['k/defi', 'k/perp-dex', 'k/ai']
  const deletedResult = await prisma.project.deleteMany({
    where: {
      category: {
        notIn: validCategories
      }
    }
  })
  
  console.log(`✅ 刪除 ${deletedResult.count} 個無效分類的項目`)
  
  // 驗證
  const remaining = await prisma.project.groupBy({
    by: ['category'],
    _count: true
  })
  
  console.log('\n✅ 保留的分類：')
  remaining.forEach(r => console.log(`  ${r.category}: ${r._count} 個項目`))
  
  await prisma.$disconnect()
}

cleanup().catch(console.error).finally(() => process.exit(0))
