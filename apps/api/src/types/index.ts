import { z } from 'zod';

// Review schemas
export const CreateReviewSchema = z.object({
  targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(2000),
  category: z.enum(['product', 'service', 'protocol', 'nft', 'token']),
  stakeAmount: z.string().optional(), // in wei
});

export const ReviewQuerySchema = z.object({
  targetAddress: z.string().optional(),
  reviewerAddress: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Reputation schema
export const ReputationQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
});

// Stake schema
export const StakeSchema = z.object({
  reviewId: z.string(),
  amount: z.string(), // in wei
  txHash: z.string(),
});

// Types
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type ReviewQuery = z.infer<typeof ReviewQuerySchema>;
export type StakeInput = z.infer<typeof StakeSchema>;

export interface Review {
  id: string;
  targetAddress: string;
  reviewerAddress: string;
  rating: number;
  content: string;
  category: string;
  stakeAmount: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  nftTokenId?: string;
}

export interface Reputation {
  address: string;
  score: number;
  totalReviews: number;
  totalUpvotes: number;
  totalStaked: string;
  level: 'newcomer' | 'trusted' | 'expert' | 'authority';
}
