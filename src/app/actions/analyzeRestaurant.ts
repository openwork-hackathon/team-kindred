'use server'

/**
 * Restaurant Analysis Action (Ma'at-style)
 * 
 * For k/gourmet category - gets restaurant data from Gemini + Google Places
 * including ratings, photos, must-try dishes, etc.
 */

import { searchPlace } from '@/lib/googlePlaces'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export interface RestaurantAnalysis {
  restaurantName: string
  score: number
  status: 'PURE' | 'UNSTABLE' | 'DECEPTIVE'
  summary: string
  platformScores?: { platform: string; score: number; reviewCount?: number }[]
  mustTry?: { name: string; description?: string; price?: string }[]
  warnings?: string[]
  priceRange?: string
  avgCost?: string
  bestFor?: string[]
  cuisine?: string
  ambiance?: string
  address?: string
  hours?: string
  photos?: string[]
  googleMapsUrl?: string
  criticalReviews?: { issue: string; source?: string; frequency?: string }[]
}

// Hardcoded fallback data for demo restaurants
const DEMO_RESTAURANTS: Record<string, RestaurantAnalysis> = {
  'din-tai-fung': {
    restaurantName: '鼎泰豐 Din Tai Fung',
    score: 4.5,
    status: 'PURE',
    summary: 'World-renowned Taiwanese restaurant famous for xiaolongbao (soup dumplings). Consistent quality across locations, but expect long wait times during peak hours.',
    platformScores: [
      { platform: 'Google', score: 4.5, reviewCount: 12500 },
      { platform: 'Yelp', score: 4.0, reviewCount: 3200 },
      { platform: 'TripAdvisor', score: 4.5, reviewCount: 8900 }
    ],
    mustTry: [
      { name: 'Xiao Long Bao (Soup Dumplings)', description: 'The signature dish - 18 folds, thin skin, rich pork broth', price: '$14.50 (10 pieces)' },
      { name: 'Noodles with Spicy Sauce', description: 'Chewy noodles with savory-spicy sesame sauce', price: '$12' },
      { name: 'Chocolate Xiao Long Bao', description: 'Unique dessert dumpling with molten chocolate', price: '$11 (6 pieces)' },
      { name: 'Shrimp & Pork Wontons', description: 'Delicate wontons in chili oil', price: '$13' }
    ],
    warnings: ['Long wait times, especially during peak hours', 'Can be noisy', 'Parking can be challenging'],
    priceRange: '$$',
    avgCost: '$30-45 per person',
    bestFor: ['Family gatherings', 'Casual dining', 'Special occasions'],
    cuisine: 'Taiwanese / Dim Sum',
    ambiance: 'Modern, clean, fast-paced',
    address: '3333 Bristol St, Costa Mesa, CA 92626美國',
    hours: '11:00 AM - 9:00 PM (Varies by day)',
    photos: [
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', // Dumplings
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', // Dim sum
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', // Asian food
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', // Restaurant
    ],
    googleMapsUrl: 'https://maps.google.com/?q=Din+Tai+Fung+Costa+Mesa',
    criticalReviews: [
      { issue: 'Long wait times on weekends', source: 'Yelp', frequency: 'Very Common' },
      { issue: 'Noisy atmosphere', source: 'Google', frequency: 'Common' },
      { issue: 'Portions smaller than expected for price', source: 'TripAdvisor', frequency: 'Occasional' }
    ]
  },
  'ichiran-ramen': {
    restaurantName: '一蘭拉麵 Ichiran Ramen',
    score: 4.3,
    status: 'PURE',
    summary: 'Iconic Japanese ramen chain known for private booth dining and customizable tonkotsu ramen. Unique solo dining experience with focus on the ramen itself.',
    platformScores: [
      { platform: 'Google', score: 4.3, reviewCount: 8500 },
      { platform: 'Yelp', score: 4.0, reviewCount: 2100 },
      { platform: 'TripAdvisor', score: 4.0, reviewCount: 4200 }
    ],
    mustTry: [
      { name: 'Original Tonkotsu Ramen', description: 'Signature pork bone broth with thin noodles', price: '$19' },
      { name: 'Extra Chashu', description: 'Additional sliced pork belly', price: '$4' },
      { name: 'Nitamago (Seasoned Egg)', description: 'Soft-boiled marinated egg', price: '$3' }
    ],
    warnings: ['Long lines during peak hours', 'Limited menu options', 'No substitutions allowed'],
    priceRange: '$$',
    avgCost: '$20-30 per person',
    bestFor: ['Solo dining', 'Quick meal', 'Ramen lovers'],
    cuisine: 'Japanese / Ramen',
    ambiance: 'Private booths, focused dining',
    address: '132 W 31st St, New York, NY 10001',
    hours: '10:00 AM - 12:00 AM',
    photos: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', // Ramen bowl
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800', // Ramen close-up
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=400', // Noodles
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400', // Japanese food
    ],
    googleMapsUrl: 'https://maps.google.com/?q=Ichiran+NYC',
    criticalReviews: [
      { issue: 'Overpriced for ramen', source: 'Yelp', frequency: 'Common' },
      { issue: 'Long wait times', source: 'Google', frequency: 'Very Common' }
    ]
  },
  'shake-shack': {
    restaurantName: 'Shake Shack',
    score: 4.2,
    status: 'PURE',
    summary: 'Premium fast-casual burger chain known for quality ingredients and ShackBurger. Consistent quality with trendy vibe, but premium pricing for fast food.',
    platformScores: [
      { platform: 'Google', score: 4.2, reviewCount: 15000 },
      { platform: 'Yelp', score: 3.5, reviewCount: 5600 },
      { platform: 'TripAdvisor', score: 4.0, reviewCount: 3200 }
    ],
    mustTry: [
      { name: 'ShackBurger', description: 'Angus beef with lettuce, tomato, ShackSauce', price: '$7.29' },
      { name: 'SmokeShack', description: 'Cheeseburger with bacon and cherry peppers', price: '$9.29' },
      { name: 'Crinkle-Cut Fries', description: 'Classic crinkle fries with cheese sauce option', price: '$3.79' },
      { name: 'Concrete', description: 'Frozen custard blended with mix-ins', price: '$6.29' }
    ],
    warnings: ['Premium pricing for fast food', 'Can get crowded during lunch'],
    priceRange: '$$',
    avgCost: '$15-25 per person',
    bestFor: ['Quick lunch', 'Casual dining', 'Burger craving'],
    cuisine: 'American / Burgers',
    ambiance: 'Modern fast-casual, trendy',
    address: 'Multiple locations',
    hours: '11:00 AM - 10:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', // Burger
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', // Burger & fries
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', // Cheeseburger
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', // Shake
    ],
    googleMapsUrl: 'https://www.shakeshack.com/locations',
    criticalReviews: [
      { issue: 'Expensive for fast food', source: 'Yelp', frequency: 'Very Common' },
      { issue: 'Long lines during lunch', source: 'Google', frequency: 'Common' }
    ]
  }
}

export async function analyzeRestaurant(query: string): Promise<RestaurantAnalysis | null> {
  // Check for demo restaurant first (slug match)
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  if (DEMO_RESTAURANTS[slug]) {
    console.log('[analyzeRestaurant] Using demo data for:', slug)
    return DEMO_RESTAURANTS[slug]
  }
  
  // Also check for partial matches
  for (const [key, data] of Object.entries(DEMO_RESTAURANTS)) {
    if (query.toLowerCase().includes(key.replace(/-/g, ' ')) || 
        query.toLowerCase().includes(data.restaurantName.toLowerCase()) ||
        data.restaurantName.toLowerCase().includes(query.toLowerCase())) {
      console.log('[analyzeRestaurant] Using demo data for:', key)
      return data
    }
  }
  
  // Read API key inside function (server action context)
  const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  
  console.log('[analyzeRestaurant] Starting analysis for:', query)
  console.log('[analyzeRestaurant] GEMINI_API_KEY available:', !!GEMINI_API_KEY)
  
  if (!GEMINI_API_KEY) {
    console.error('[analyzeRestaurant] GEMINI_API_KEY not configured')
    console.error('[analyzeRestaurant] GOOGLE_GENERATIVE_AI_API_KEY:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    console.error('[analyzeRestaurant] GEMINI_API_KEY:', !!process.env.GEMINI_API_KEY)
    return null
  }

  // First, try Google Places API for verified data
  let placesData = null
  try {
    placesData = await searchPlace(query)
    console.log('[Restaurant] Google Places result:', placesData?.name, placesData?.photos?.length, 'photos')
  } catch (e) {
    console.warn('[Restaurant] Google Places failed:', e)
  }

  // Include Places data in prompt if available
  const placesContext = placesData ? `
Google Places API Data (verified):
- Name: ${placesData.name}
- Rating: ${placesData.rating}/5 (${placesData.userRatingCount} reviews)
- Price: ${placesData.priceLevel || 'N/A'}
- Address: ${placesData.formattedAddress || 'N/A'}
- Photos available: ${placesData.photos?.length || 0}
` : ''

  const prompt = `Search for comprehensive restaurant information: "${query}"
${placesContext}

Search for:
1. Ratings from Yelp, Dianping (大眾點評), TripAdvisor, OpenRice, Google
2. Signature dishes with descriptions and prices
3. Ambiance and environment details
4. Service quality feedback
5. Average cost per person
6. Photos (provide real URLs from search results)
7. CRITICAL: Most common negative reviews and complaints

RETURN JSON FORMAT ONLY:
{
  "restaurantName": "Restaurant Name",
  "score": 0.0-5.0,
  "status": "PURE|UNSTABLE|DECEPTIVE",
  "summary": "2-3 sentence judgment on food quality, value, and overall experience.",
  "platformScores": [
    {"platform": "Google", "score": 4.5, "reviewCount": 500},
    {"platform": "Yelp", "score": 4.0, "reviewCount": 300}
  ],
  "mustTry": [
    {"name": "Dish Name", "description": "Description", "price": "$12"}
  ],
  "warnings": ["Busy on weekends", "Limited parking"],
  "priceRange": "$$",
  "avgCost": "$25-40 per person",
  "bestFor": ["Date night", "Family gathering"],
  "cuisine": "Taiwanese / Dim Sum",
  "ambiance": "Modern, upscale casual",
  "address": "Full address",
  "hours": "11:00 AM - 10:00 PM",
  "photos": ["https://...real_photo_url..."],
  "googleMapsUrl": "https://maps.google.com/...",
  "criticalReviews": [
    {"issue": "Long wait times", "source": "Yelp", "frequency": "Common"}
  ]
}

CRITICAL RULES:
1. NO HALLUCINATIONS - only report data you find
2. For photos, provide real URLs from search results (Google, Yelp, etc.)
3. If no data found, return status "UNSTABLE"
4. Verify restaurant name matches query`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return null
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response')
      return null
    }

    const result = JSON.parse(jsonMatch[0]) as RestaurantAnalysis
    
    // Merge Google Places data (more reliable)
    if (placesData) {
      // Use Google Places photos (verified, high quality)
      if (placesData.photos && placesData.photos.length > 0) {
        result.photos = placesData.photos
      }
      // Use Google address if available
      if (placesData.formattedAddress) {
        result.address = placesData.formattedAddress
      }
      // Add Google Maps URL
      if (placesData.placeId) {
        result.googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placesData.placeId}`
      }
      // Use Google rating as one of the platform scores
      if (placesData.rating && result.platformScores) {
        const hasGoogle = result.platformScores.some(p => p.platform.toLowerCase() === 'google')
        if (!hasGoogle) {
          result.platformScores.unshift({
            platform: 'Google',
            score: placesData.rating,
            reviewCount: placesData.userRatingCount
          })
        }
      }
    }
    
    return result

  } catch (error) {
    console.error('Restaurant analysis error:', error)
    return null
  }
}
