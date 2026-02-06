'use client'

interface SchemaOrgProps {
  type: 'Product' | 'WebSite' | 'Organization'
  data: any
}

/**
 * Schema.org JSON-LD component
 * Renders structured data for search engines
 * 
 * Usage:
 * <SchemaOrg type="Product" data={{name, rating, reviewCount}} />
 */
export function SchemaOrg({ type, data }: SchemaOrgProps) {
  let schema: any = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  if (type === 'Product') {
    schema = {
      ...schema,
      name: data.name,
      description: data.description || '',
      ...(data.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating.toFixed(1),
          bestRating: '5',
          worstRating: '1',
          reviewCount: data.reviewCount || 0,
        },
      }),
    }
  }

  if (type === 'WebSite') {
    schema = {
      ...schema,
      name: 'Kindred',
      url: 'https://kindred.community',
      description: 'Decentralized trust layer for everything. Stake reviews, vote, earn.',
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
