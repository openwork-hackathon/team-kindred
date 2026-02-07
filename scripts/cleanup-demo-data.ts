import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up demo data...\n')
  
  // 1. Delete demo restaurants (Din Tai Fung, Ichiran, Shake Shack)
  const demoRestaurants = ['din-tai-fung', 'ichiran-ramen', 'shake-shack']
  
  for (const slug of demoRestaurants) {
    const restaurant = await prisma.project.findFirst({
      where: { address: slug, category: 'k/gourmet' },
    })
    
    if (restaurant) {
      console.log(`❌ Deleting ${restaurant.name}...`)
      
      // Delete reviews first (foreign key constraint)
      await prisma.review.deleteMany({
        where: { projectId: restaurant.id },
      })
      
      // Delete project
      await prisma.project.delete({
        where: { id: restaurant.id },
      })
    }
  }
  
  // 2. Delete demo user
  await prisma.user.deleteMany({
    where: { address: '0xdemo1234567890abcdef' },
  })
  console.log('❌ Deleted demo user\n')
  
  // 3. List remaining restaurants (real searches)
  const remaining = await prisma.project.findMany({
    where: { category: 'k/gourmet' },
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      address: true,
      reviewCount: true,
      createdAt: true,
    },
  })
  
  console.log('✅ Remaining restaurants (real user searches):')
  remaining.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name} (${r.address})`)
    console.log(`   Reviews: ${r.reviewCount}, Created: ${r.createdAt.toISOString().split('T')[0]}`)
  })
  
  console.log(`\nTotal: ${remaining.length} restaurants`)
  console.log('✨ Cleanup complete! All data is now real user activity.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
