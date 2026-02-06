import { Metadata } from 'next'

interface Project {
  id: string
  name: string
  category: string
  aiSummary: string
  aiScore: number
  reviewCount?: number
}

/**
 * Generate dynamic metadata for project pages
 * Used by Next.js for SEO (title, description, OpenGraph)
 */
export async function generateProjectMetadata(
  projectId: string
): Promise<Metadata> {
  // TODO: Fetch from DB instead of mock
  // For now, return basic metadata
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kindred.community'
  
  return {
    title: `${projectId} Review - Kindred`,
    description: `Community reviews and ratings for ${projectId}. Stake tokens, vote, and earn from quality content.`,
    openGraph: {
      title: `${projectId} Review - Kindred`,
      description: `Community reviews and ratings for ${projectId}`,
      url: `${baseUrl}/k/defi/${projectId}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Kindred - Community Reviews',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${projectId} Review - Kindred`,
      description: `Community reviews and ratings for ${projectId}`,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

/**
 * Generate Schema.org JSON-LD for project page
 * Shows star rating in Google search results
 */
export function generateProjectSchema(project: {
  name: string
  aiScore: number
  reviewCount: number
  aiSummary: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: project.name,
    description: project.aiSummary,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: project.aiScore.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      reviewCount: project.reviewCount || 0,
    },
  }
}
