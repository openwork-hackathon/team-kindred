'use client'

import { useParams } from 'next/navigation'
import { CategoryFeed } from '@/components/CategoryFeed'

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string

  return (
    <div className="py-8 px-4">
      <CategoryFeed category={`k/${category}`} />
    </div>
  )
}
