/**
 * JSON-LD Schema Component
 * Injects structured data for rich snippets in search results
 */

interface JsonLdProps {
  data: object | object[]
}

export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kindred',
    description: 'The trust layer for everything. Decentralized reputation protocol.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'}/logo.jpg`,
    sameAs: [
      'https://twitter.com/KindredProtocol',
      'https://github.com/kindred-protocol',
    ],
  }
  
  return <JsonLd data={schema} />
}

export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kindred',
    url: baseUrl,
    description: 'The trust layer for everything. Stake tokens to review, predict rankings, build reputation.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/k/defi?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  
  return <JsonLd data={schema} />
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
  
  return <JsonLd data={schema} />
}

interface FAQJsonLdProps {
  questions: { question: string; answer: string }[]
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
  
  return <JsonLd data={schema} />
}
