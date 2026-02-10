/**
 * Google Places API integration for restaurant images
 * Fetches representative photos for restaurants
 */

interface PlacesImage {
  url: string;
  attribution: string;
}

/**
 * Get restaurant images from Google Places
 * For MVP, use mock data; production uses Places API
 */
export async function getRestaurantImages(
  restaurantName: string
): Promise<PlacesImage[]> {
  // Mock images for Michelin-star restaurants in SF
  const MOCK_IMAGES: Record<string, PlacesImage[]> = {
    'Ding Tai Fung': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8x8EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8x9EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
    'Benu': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y0EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y1EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
    'Atelier Crenn': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y2EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
    'Lazy Bear': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y3EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
    'State Bird Provisions': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y4EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
    'Quince': [
      {
        url: 'https://lh3.googleusercontent.com/p/AF1QipO8y5EXAMPLE/w400-h300-k-no',
        attribution: 'Google Places',
      },
    ],
  };

  // Return mock images for known restaurants
  if (MOCK_IMAGES[restaurantName]) {
    return MOCK_IMAGES[restaurantName];
  }

  // For production, would call:
  // const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
  //   },
  //   body: JSON.stringify({ textQuery: restaurantName })
  // })

  return [];
}

/**
 * Get restaurant details from Google Places
 */
export async function getRestaurantDetails(
  restaurantName: string
): Promise<{
  name: string;
  rating: number;
  reviewCount: number;
  images: PlacesImage[];
  hours?: string;
} | null> {
  const images = await getRestaurantImages(restaurantName);

  if (images.length === 0) return null;

  return {
    name: restaurantName,
    rating: 4.5, // Mock rating
    reviewCount: 250, // Mock count
    images,
  };
}
