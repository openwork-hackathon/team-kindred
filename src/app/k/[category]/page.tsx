import { Metadata } from 'next'
import { getCategoryMetadata, CATEGORY_META } from '@/lib/seo'
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd'
import { CategoryPageClient } from './CategoryPageClient'

// Static params for pre-rendering known categories
export function generateStaticParams() {
  return [
    { category: 'defi' },
    { category: 'perp-dex' },
    { category: 'memecoin' },
    { category: 'ai' },
    { category: 'gourmet' },
    { category: 'saas' },
    { category: 'crypto' },
    { category: 'agents' },
    { category: 'all' },
  ]
}

// Dynamic metadata generation for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}): Promise<Metadata> {
  const { category } = await params
  return getCategoryMetadata(category)
}

const CATEGORY_INFO: Record<string, { icon: string; description: string }> = {
  'defi': { icon: '🏦', description: 'DeFi protocols - Lending, DEXs, Yield' },
  'perp-dex': { icon: '📈', description: 'Perpetual DEXs - Derivatives trading' },
  'memecoin': { icon: '🐕', description: 'Memecoins - The degen corner' },
  'ai': { icon: '🤖', description: 'AI projects - ML, Agents, Data' },
  'gourmet': { icon: '🍽️', description: 'Restaurant reviews - Verified dining' },
  'saas': { icon: '💻', description: 'SaaS tools - Software reviews' },
  'crypto': { icon: '₿', description: 'Crypto tokens - Token analysis' },
  'agents': { icon: '🤖', description: 'AI Agents - Autonomous tools' },
  'all': { icon: '🌐', description: 'All categories' },
}

// Category-specific FAQs for rich snippets
const CATEGORY_FAQS: Record<string, { question: string; answer: string }[]> = {
  'defi': [
    { 
      question: 'How does Kindred review DeFi protocols?', 
      answer: 'Kindred uses stake-weighted reviews where users must put tokens at risk. This ensures reviewers have skin in the game. Reviews are verified through on-chain transaction history and community voting.' 
    },
    { 
      question: 'Are DeFi reviews on Kindred trustworthy?', 
      answer: 'Yes. Unlike traditional reviews, Kindred reviews require staking tokens. Misleading reviews can result in stake loss, creating strong incentives for honest, accurate assessments.' 
    },
  ],
  'memecoin': [
    { 
      question: 'How can I avoid memecoin rug pulls?', 
      answer: 'Kindred provides community-verified ratings for memecoins. Check the risk score, read staked reviews, and look at the voting history. High-stake reviews from reputable users are more reliable.' 
    },
  ],
}

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params
  const info = CATEGORY_INFO[category] || { icon: '📁', description: 'Community reviews' }
  const faqs = CATEGORY_FAQS[category] || []

  return (
    <>
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: CATEGORY_META[category]?.title || category, url: `/k/${category}` },
        ]} 
      />
      
      {/* FAQ Schema (if available) */}
      {faqs.length > 0 && <FAQJsonLd questions={faqs} />}
      
      {/* Client Component for Interactive Content */}
      <CategoryPageClient 
        category={category}
        categoryIcon={info.icon}
        categoryDescription={info.description}
      />
    </>
  )
}
