'use client'

import { useState } from 'react'

interface TrustScoreChartProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export function TrustScoreChart({ 
  score, 
  maxScore = 100, 
  size = 'md',
  showLabel = true,
  animated = true
}: TrustScoreChartProps) {
  const percentage = (score / maxScore) * 100
  
  const sizes = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  }
  
  const { width, stroke, fontSize } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  // Color based on score
  const getColor = () => {
    if (score >= 80) return { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' }
    if (score >= 60) return { stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.3)' }
    if (score >= 40) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' }
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' }
  }
  
  const color = getColor()

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="#1f1f23"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{
            transition: animated ? 'stroke-dashoffset 1s ease-out' : 'none',
            filter: `drop-shadow(0 0 8px ${color.glow})`,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${fontSize}`}>{score}</span>
          <span className="text-xs text-[#6b6b70]">Trust</span>
        </div>
      )}
    </div>
  )
}

// Mini version for tables/lists
export function TrustScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500/20 text-green-500 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
    if (score >= 40) return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
    return 'bg-red-500/20 text-red-500 border-red-500/30'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getColor()}`}>
      {score}
    </span>
  )
}
