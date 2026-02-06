# SEO Implementation Plan

## 🎯 Goal
Make Kindred pages crawlable by Google and rank for long-tail keywords like "is Aave safe" "best DeFi protocol"

## ✅ Implementation Checklist

### P0 - Critical for Hackathon (Feb 8)

- [ ] **SSR for Project Pages** (`/k/[category]/[id]`)
  - Convert to Server Component
  - Fetch project data on server
  - Pre-render HTML for crawlers
  
- [ ] **Dynamic Metadata**
  - `generateMetadata()` for each project
  - Title: "ProjectName Review - Kindred"
  - Description: AI summary preview
  
- [ ] **Schema.org JSON-LD**
  - Product schema with rating
  - AggregateRating with stars
  - Reviews/comments

### P1 - Nice to Have

- [ ] **Sitemap.xml**
  - Auto-generate from DB
  - All `/k/*` pages
  
- [ ] **robots.txt**
  - Allow all crawlers
  - Point to sitemap
  
- [ ] **Open Graph**
  - Social preview images
  - og:title, og:description, og:image

## 📝 Technical Approach

### 1. Server Component Pattern

```typescript
// src/app/k/[category]/[id]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.id)
  return {
    title: `${project.name} Review - Kindred`,
    description: project.aiSummary,
  }
}

export default async function ProjectPage({ params }) {
  const project = await getProject(params.id)
  return <ProjectView project={project} />
}
```

### 2. Schema.org

```typescript
const schema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": project.name,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": project.aiScore,
    "reviewCount": project.reviewCount
  }
}
```

## 🚀 Next Steps

1. Create new Server Component for project pages
2. Move client-only logic to separate client components
3. Add metadata generation
4. Add Schema.org JSON-LD
5. Test with Google Search Console

---

**Owner:** Steve Jobs (captain-hook)
**Created:** 2026-02-06 8:00 PM PST
**Target:** USDC Hackathon (Feb 8)
