'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Users, TrendingUp, ArrowLeft, ExternalLink, Award, Utensils, Camera } from 'lucide-react'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewCard } from '@/components/reviews/ReviewCard'

interface Review {
  id: string
  targetAddress: string
  targetName: string
  reviewerAddress: string
  rating: number
  content: string
  category: string
  predictedRank: number | null
  stakeAmount: string
  photoUrls: string[]
  upvotes: number
  downvotes: number
  createdAt: string
  nftTokenId?: string
}

interface Restaurant {
  id: string
  name: string
  address: string
  description: string | null
  website: string | null
  avgRating: number
  reviewCount: number
  totalStaked: string
  reviews: Review[]
}

interface RestaurantPageProps {
  restaurant: Restaurant
}

export function RestaurantPage({ restaurant }: RestaurantPageProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const averageRating = restaurant.avgRating

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/k/gourmet"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gourmet
        </Link>

        {/* Restaurant Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="w-8 h-8 text-orange-400" />
                <h1 className="text-4xl font-bold">{restaurant.name}</h1>
              </div>

              {restaurant.description && (
                <p className="text-gray-300 text-lg mb-4">{restaurant.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm">
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-yellow-400">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {restaurant.reviewCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{restaurant.reviewCount} {restaurant.reviewCount === 1 ? 'review' : 'reviews'}</span>
                  </div>
                )}

                {Number(restaurant.totalStaked) > 0 && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Award className="w-4 h-4" />
                    <span>{(Number(restaurant.totalStaked) / 1e18).toFixed(0)} $OPEN staked</span>
                  </div>
                )}
              </div>

              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mt-4 transition"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Write Review
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm />
              </div>
            )}

            {/* Reviews List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>

              {restaurant.reviews.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                  <Utensils className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-6">
                    No reviews yet. Be the first to review {restaurant.name}!
                  </p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Write the First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {restaurant.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                Restaurant Stats
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="font-semibold text-yellow-400">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'No ratings'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="font-semibold">{restaurant.reviewCount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="font-semibold text-purple-400">
                    {(Number(restaurant.totalStaked) / 1e18).toFixed(0)} $OPEN
                  </span>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm text-gray-500">
                    Kindred Gourmet uses stake-weighted reviews to ensure authentic, high-quality ratings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
