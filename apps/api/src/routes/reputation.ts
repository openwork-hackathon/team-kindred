import { Router } from 'express';
import { Reputation } from '../types';

const router = Router();

// In-memory reputation store (replace with on-chain reads later)
const reputations: Map<string, Reputation> = new Map();

// Calculate level based on score
function calculateLevel(score: number): Reputation['level'] {
  if (score >= 1000) return 'authority';
  if (score >= 500) return 'expert';
  if (score >= 100) return 'trusted';
  return 'newcomer';
}

// GET /reputation/:address - Get reputation for address
router.get('/:address', (req, res) => {
  const address = req.params.address.toLowerCase();
  
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }
  
  let reputation = reputations.get(address);
  
  // Return default if not found
  if (!reputation) {
    reputation = {
      address,
      score: 0,
      totalReviews: 0,
      totalUpvotes: 0,
      totalStaked: '0',
      level: 'newcomer',
    };
  }
  
  res.json(reputation);
});

// POST /reputation/:address/update - Update reputation (internal use)
router.post('/:address/update', (req, res) => {
  const address = req.params.address.toLowerCase();
  const { reviewCount, upvoteCount, stakedAmount } = req.body;
  
  let reputation = reputations.get(address) || {
    address,
    score: 0,
    totalReviews: 0,
    totalUpvotes: 0,
    totalStaked: '0',
    level: 'newcomer' as const,
  };
  
  // Update metrics
  if (reviewCount !== undefined) reputation.totalReviews = reviewCount;
  if (upvoteCount !== undefined) reputation.totalUpvotes = upvoteCount;
  if (stakedAmount !== undefined) reputation.totalStaked = stakedAmount;
  
  // Recalculate score
  // Formula: (reviews * 10) + (upvotes * 5) + (staked / 1e18 * 2)
  reputation.score = 
    (reputation.totalReviews * 10) + 
    (reputation.totalUpvotes * 5) + 
    Math.floor(Number(BigInt(reputation.totalStaked) / BigInt(1e18)) * 2);
  
  reputation.level = calculateLevel(reputation.score);
  
  reputations.set(address, reputation);
  
  res.json(reputation);
});

// GET /reputation/leaderboard - Top reputations
router.get('/leaderboard', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  
  const leaderboard = Array.from(reputations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  res.json({ leaderboard });
});

export { router as reputationRoutes };
