import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSeoMetadata, generateProjectSchema, generateBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProjectPageContent } from './ProjectPageContent'

// Dynamic metadata generation for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; id: string }> 
}): Promise<Metadata> {
  const { category, id } = await params
  const projectId = id.toLowerCase()
  
  // Try to fetch project from DB
  let project = null
  try {
    project = await prisma.project.findUnique({
      where: { address: projectId },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching project for metadata:', error)
  }

  const projectName = project?.name || id.charAt(0).toUpperCase() + id.slice(1)
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
  
  // Generate SEO-optimized metadata
  const title = `${projectName} Review - Is ${projectName} Safe?`
  const description = project?.aiSummary 
    ? project.aiSummary.slice(0, 155) + '...'
    : `Read verified reviews of ${projectName}. Community-driven ratings, security analysis, and expert opinions. Find out if ${projectName} is worth investing in.`

  return generateSeoMetadata({
    title,
    description,
    path: `/k/${category}/${id}`,
    keywords: [
      `${projectName} review`,
      `${projectName} safe`,
      `${projectName} scam`,
      `${projectName} rating`,
      `is ${projectName} legit`,
      `${categoryName} protocol`,
      'crypto review',
      'defi security',
    ],
    type: 'article',
  })
}

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ category: string; id: string }> 
}) {
  const { category, id } = await params
  const projectId = id.toLowerCase()
  
  // Fetch initial data server-side for SEO
  let project = null
  let reviews: any[] = []
  let aggregateRating = null
  
  try {
    const [projectData, reviewsData] = await Promise.all([
      prisma.project.findUnique({
        where: { address: projectId },
      }),
      prisma.review.findMany({
        where: { projectAddress: projectId },
        orderBy: { upvotes: 'desc' },
        take: 20,
      }),
    ])
    
    project = projectData
    reviews = reviewsData
    
    // Calculate aggregate rating if we have reviews
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      aggregateRating = {
        ratingValue: (totalRating / reviews.length).toFixed(1),
        ratingCount: reviews.length,
        reviewCount: reviews.length,
      }
    }
  } catch (error) {
    console.error('Error fetching project data:', error)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  const projectName = project?.name || id

  return (
    <>
      {/* Product Schema for rich snippets */}
      <JsonLd 
        data={generateProjectSchema({
          name: projectName,
          description: project?.aiSummary || `Reviews and analysis of ${projectName}`,
          category: `k/${category}`,
          address: projectId,
          aggregateRating: aggregateRating ? {
            ratingValue: parseFloat(aggregateRating.ratingValue),
            ratingCount: aggregateRating.ratingCount,
            reviewCount: aggregateRating.reviewCount,
          } : undefined,
          image: project?.logo || undefined,
        })} 
      />
      
      {/* Breadcrumb Schema */}
      <JsonLd 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: category.charAt(0).toUpperCase() + category.slice(1), url: `/k/${category}` },
          { name: projectName, url: `/k/${category}/${id}` },
        ])} 
      />
      
      {/* Hidden SEO content for crawlers */}
      <div className="sr-only">
        <h1>{projectName} Review - Kindred Trust Platform</h1>
        <p>
          Read {reviews.length} verified reviews of {projectName}. 
          {aggregateRating && ` Average rating: ${aggregateRating.ratingValue}/5 based on ${aggregateRating.ratingCount} reviews.`}
          {project?.aiSummary && ` Summary: ${project.aiSummary}`}
        </p>
        {reviews.length > 0 && (
          <div>
            <h2>Recent Reviews</h2>
            {reviews.slice(0, 5).map((review: any) => (
              <article key={review.id}>
                <p>Rating: {review.rating}/5 - {review.content.slice(0, 200)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
      
      {/* Client Component for Interactive Content */}
      <ProjectPageContent 
        projectId={projectId}
        category={category}
        initialProject={project}
        initialReviews={reviews}
      />
    </>
  )
}
