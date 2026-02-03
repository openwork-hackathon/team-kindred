'use client'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ 
  className = '', 
  width, 
  height,
  rounded = 'md'
}: SkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  return (
    <div 
      className={`animate-pulse bg-[#1f1f23] ${roundedClasses[rounded]} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl space-y-4">
      <Skeleton height={20} width="60%" />
      <Skeleton height={32} width="80%" />
      <div className="flex gap-2">
        <Skeleton height={16} width={60} />
        <Skeleton height={16} width={80} />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton width={40} height={40} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} width="40%" />
        <Skeleton height={12} width="60%" />
      </div>
      <Skeleton height={24} width={60} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {[...Array(rows)].map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={20} width={120} />
        <Skeleton height={32} width={100} />
      </div>
      <Skeleton height={height} width="100%" rounded="lg" />
    </div>
  )
}
