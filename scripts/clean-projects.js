const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanProjects() {
  console.log('Searching for garbage projects...\n');

  // Find and delete garbage projects
  const garbage = await prisma.project.findMany({
    where: {
      OR: [
        { name: { contains: '%' } },
        { name: { contains: 'cmllbb' } },
        { address: { contains: 'cmllbb' } },
      ]
    }
  });

  console.log(`Found ${garbage.length} garbage projects:`, garbage.map(p => ({ name: p.name, address: p.address })));

  if (garbage.length > 0) {
    for (const p of garbage) {
      await prisma.project.delete({ where: { id: p.id } });
      console.log(`✅ Deleted: ${p.name}`);
    }
  }

  await prisma.$disconnect();
}

cleanProjects().catch(console.error);
