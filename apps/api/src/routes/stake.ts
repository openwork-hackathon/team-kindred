import { Router } from 'express';
import { StakeSchema } from '../types';

const router = Router();

interface Stake {
  id: string;
  reviewId: string;
  stakerAddress: string;
  amount: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'slashed' | 'returned';
  createdAt: Date;
}

// In-memory stake store
const stakes: Stake[] = [];

// POST /stake - Record a stake
router.post('/', (req, res) => {
  try {
    const input = StakeSchema.parse(req.body);
    const stakerAddress = req.headers['x-wallet-address'] as string || '0x0000000000000000000000000000000000000000';
    
    const stake: Stake = {
      id: `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reviewId: input.reviewId,
      stakerAddress,
      amount: input.amount,
      txHash: input.txHash,
      status: 'pending',
      createdAt: new Date(),
    };
    
    stakes.push(stake);
    
    // TODO: Verify on-chain transaction
    // TODO: Update reputation
    
    res.status(201).json(stake);
  } catch (error) {
    res.status(400).json({ error: 'Invalid stake data' });
  }
});

// GET /stake/:reviewId - Get stakes for a review
router.get('/:reviewId', (req, res) => {
  const reviewStakes = stakes.filter(s => s.reviewId === req.params.reviewId);
  
  const totalStaked = reviewStakes.reduce(
    (sum, s) => sum + BigInt(s.amount),
    BigInt(0)
  );
  
  res.json({
    reviewId: req.params.reviewId,
    stakes: reviewStakes,
    totalStaked: totalStaked.toString(),
    stakerCount: reviewStakes.length,
  });
});

// GET /stake/user/:address - Get all stakes by user
router.get('/user/:address', (req, res) => {
  const address = req.params.address.toLowerCase();
  const userStakes = stakes.filter(
    s => s.stakerAddress.toLowerCase() === address
  );
  
  const totalStaked = userStakes.reduce(
    (sum, s) => sum + BigInt(s.amount),
    BigInt(0)
  );
  
  res.json({
    address,
    stakes: userStakes,
    totalStaked: totalStaked.toString(),
  });
});

// POST /stake/:id/confirm - Confirm stake (after on-chain verification)
router.post('/:id/confirm', (req, res) => {
  const stake = stakes.find(s => s.id === req.params.id);
  
  if (!stake) {
    return res.status(404).json({ error: 'Stake not found' });
  }
  
  stake.status = 'confirmed';
  res.json(stake);
});

// POST /stake/:id/slash - Slash stake (for bad reviews)
router.post('/:id/slash', (req, res) => {
  const stake = stakes.find(s => s.id === req.params.id);
  
  if (!stake) {
    return res.status(404).json({ error: 'Stake not found' });
  }
  
  stake.status = 'slashed';
  // TODO: Execute on-chain slash
  
  res.json(stake);
});

export { router as stakeRoutes };
