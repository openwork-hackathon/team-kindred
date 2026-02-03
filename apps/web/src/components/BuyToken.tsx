'use client'

import { Coins, ExternalLink } from 'lucide-react'

// TODO: Update URL after Patrick deploys token
const MINT_CLUB_URL = 'https://mint.club/token/base/KIND'

interface BuyTokenProps {
  variant?: 'primary' | 'secondary' | 'small'
  className?: string
}

export function BuyToken({ variant = 'primary', className = '' }: BuyTokenProps) {
  const baseStyles = 'inline-flex items-center gap-2 font-medium transition-all'
  
  const variantStyles = {
    primary: 'px-6 py-3 rounded-lg text-sm bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30',
    secondary: 'px-5 py-2.5 rounded-lg text-sm bg-transparent border border-purple-500/50 text-purple-400 hover:bg-purple-500/10',
    small: 'px-3 py-1.5 rounded-md text-xs bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
  }

  return (
    <a 
      href={MINT_CLUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <Coins className={variant === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>Buy $KIND</span>
      <ExternalLink className={variant === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
    </a>
  )
}

// Price display component for header/sidebar
export function KindPrice() {
  // TODO: Fetch from Mint Club API or on-chain
  const price = '0.001' // Placeholder
  const change = '+12.5%'
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111113] border border-[#1f1f23] rounded-lg">
      <Coins className="w-4 h-4 text-purple-400" />
      <span className="text-sm font-mono text-white">{price}</span>
      <span className="text-xs text-green-500">{change}</span>
    </div>
  )
}
