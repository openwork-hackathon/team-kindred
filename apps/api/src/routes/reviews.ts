import { Router } from 'express';
import { CreateReviewSchema, ReviewQuerySchema, Review } from '../types';

const router = Router();

// In-memory store (replace with DB later)
const reviews: Review[] = [];

// GET /reviews - Get all reviews with filters
router.get('/', (req, res) => {
  try {
    const query = ReviewQuerySchema.parse(req.query);
    
    let filtered = [...reviews];
    
    if (query.targetAddress) {
      filtered = filtered.filter(r => r.targetAddress.toLowerCase() === query.targetAddress!.toLowerCase());
    }
    if (query.reviewerAddress) {
      filtered = filtered.filter(r => r.reviewerAddress.toLowerCase() === query.reviewerAddress!.toLowerCase());
    }
    if (query.category) {
      filtered = filtered.filter(r => r.category === query.category);
    }
    
    const paginated = filtered.slice(query.offset, query.offset + query.limit);
    
    res.json({
      reviews: paginated,
      total: filtered.length,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid query parameters' });
  }
});

// GET /reviews/:id - Get single review
router.get('/:id', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  res.json(review);
});

// POST /reviews - Create new review
router.post('/', (req, res) => {
  try {
    const input = CreateReviewSchema.parse(req.body);
    
    // TODO: Verify signature / wallet connection
    const reviewerAddress = req.headers['x-wallet-address'] as string || '0x0000000000000000000000000000000000000000';
    
    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetAddress: input.targetAddress,
      reviewerAddress,
      rating: input.rating,
      content: input.content,
      category: input.category,
      stakeAmount: input.stakeAmount || '0',
      photoUrls: input.photoUrls || [],
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };
    
    reviews.push(review);
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: 'Invalid review data' });
  }
});

// POST /reviews/:id/upvote
router.post('/:id/upvote', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  review.upvotes += 1;
  res.json(review);
});

// POST /reviews/:id/downvote
router.post('/:id/downvote', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  review.downvotes += 1;
  res.json(review);
});

export { router as reviewRoutes };
