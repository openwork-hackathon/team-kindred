import { useState } from 'react'
import { Review } from '@/data/mock' // Keep type mock for now, or update to store type
import { useStore } from '@/lib/store'
import { Coins, Loader2 } from 'lucide-react'

// Adapting to either Store Review or Mock Review structure
interface ReviewCardProps {
  review: any 
}

const CATEGORY_ICONS: Record<string, string> = {
  'k/memecoin': '🐸',
  'k/defi': '🏦',
  'k/perp-dex': '📈',
  'k/ai': '🤖',
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isBuying, setIsBuying] = useState(false)
  const buyReview = useStore(state => state.buyReview)
  
  const stakeValue = review.stakedAmount ? Number(review.stakedAmount.toString().replace(/,/g, '')) : 0
  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Anon'
  
  const handleBuyShare = async () => {
    if (isBuying) return
    setIsBuying(true)
    
    // Simulate Transaction Delay
    await new Promise(r => setTimeout(r, 800))
    
    buyReview(review.id)
    setIsBuying(false)
  }
  
  return (
    <div className="bg-kindred-dark border border-gray-800 rounded-xl p-6 hover:border-kindred-primary/50 transition relative overflow-hidden group">
      {/* ERC404 Background Indicator */}
      {review.isERC404 && (
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
          <Coins className="w-24 h-24 text-kindred-primary" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-kindred-primary to-purple-800 rounded-full flex items-center justify-center text-lg text-white font-bold">
            {review.author?.slice(0, 2).toUpperCase() || 'AN'}
          </div>
          <div>
            <div className="font-mono text-sm text-[#d9d4e8]">{truncateAddress(review.author)}</div>
            <div className="text-xs text-gray-500">
              {review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Just now'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-700'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="text-lg">{review.category ? CATEGORY_ICONS[review.category] : '📄'}</span>
        <span className="text-sm text-gray-400">Reviewing:</span>
        <code className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded font-mono capitalize text-purple-300">
          {review.projectId || review.projectName}
        </code>
      </div>

      {/* Content */}
      <p className="text-[#d9d4e8]/80 mb-4 line-clamp-3 relative z-10 leading-relaxed">{review.content}</p>

      {/* Footer / Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBuyShare}
            disabled={isBuying}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition group/buy"
            title="Buy Share (Upvote)"
          >
            {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>▲</span>}
            <span className="text-sm font-bold group-hover/buy:text-green-400 transition-colors">
              {isBuying ? 'Buying...' : `Buy Share (${review.upvotes || 0})`}
            </span>
          </button>
          
          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition">
            <span>💬</span>
            <span className="text-sm">{review.comments || 0}</span>
          </button>
        </div>

        {/* Stake Badge */}
        {(stakeValue > 0 || review.stakedAmount) && (
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 text-kindred-primary bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20">
                 <Coins className="w-3.5 h-3.5" />
                 <span className="text-xs font-semibold">{stakeValue || 50} $KIND Staked</span>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
