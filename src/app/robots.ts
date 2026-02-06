import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't index API endpoints
          '/actions/',       // Server actions
          '/examples/',      // Development examples
          '/_next/',         // Next.js internals
          '/private/',       // Any private routes
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',          // Allow AI crawlers for visibility
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,       // Be nice to Google
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
