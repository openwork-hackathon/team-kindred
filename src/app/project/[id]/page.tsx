import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProjectRedirectPage({ params }: PageProps) {
  const projectId = params.id.toLowerCase().trim()

  // 1. Try to find project in DB by address OR name (case-insensitive)
  let project = await prisma.project.findUnique({
    where: { address: projectId },
    select: { address: true, category: true }
  })

  // 2. If not found by address, try by name (for restaurants, etc.)
  if (!project) {
    const projectsByName = await prisma.project.findMany({
      where: {
        name: { contains: projectId, mode: 'insensitive' }
      },
      select: { address: true, category: true, name: true },
      orderBy: { reviewCount: 'desc' },
      take: 1
    })
    
    if (projectsByName.length > 0) {
      project = projectsByName[0]
    }
  }

  // 3. Determine target category and address
  // If found, use its category and address. 
  // If not found, default to 'k/defi' (Ma'at will analyze it there) 
  const category = project?.category || 'k/defi'
  const targetAddress = project?.address || projectId

  // 4. Redirect to the canonical URL
  redirect(`/${category}/${targetAddress}`)
}
