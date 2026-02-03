'use client'

interface ActivityChartProps {
  data: { date: string; reviews: number; upvotes: number }[]
  height?: number
}

export function ActivityChart({ data, height = 120 }: ActivityChartProps) {
  const maxReviews = Math.max(...data.map(d => d.reviews), 1)
  const maxUpvotes = Math.max(...data.map(d => d.upvotes), 1)
  
  return (
    <div className="w-full">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {/* Upvotes bar */}
            <div 
              className="w-full bg-purple-500/30 rounded-t transition-all hover:bg-purple-500/50"
              style={{ height: `${(day.upvotes / maxUpvotes) * (height * 0.4)}px` }}
              title={`${day.upvotes} upvotes`}
            />
            {/* Reviews bar */}
            <div 
              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-400"
              style={{ height: `${(day.reviews / maxReviews) * (height * 0.5)}px` }}
              title={`${day.reviews} reviews`}
            />
          </div>
        ))}
      </div>
      
      {/* X-axis labels */}
      <div className="flex gap-1 mt-2">
        {data.map((day, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-[#6b6b70]">
            {i % 2 === 0 ? day.date.slice(-2) : ''}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#6b6b70]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Reviews</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500/50 rounded" />
          <span>Upvotes</span>
        </div>
      </div>
    </div>
  )
}

// Simplified heatmap for contribution activity
export function ContributionHeatmap({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  
  const getIntensity = (value: number) => {
    const ratio = value / max
    if (ratio === 0) return 'bg-[#1f1f23]'
    if (ratio < 0.25) return 'bg-green-900/50'
    if (ratio < 0.5) return 'bg-green-700/60'
    if (ratio < 0.75) return 'bg-green-500/70'
    return 'bg-green-400'
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${getIntensity(value)} transition-colors hover:ring-1 hover:ring-white/30`}
          title={`${value} contributions`}
        />
      ))}
    </div>
  )
}
