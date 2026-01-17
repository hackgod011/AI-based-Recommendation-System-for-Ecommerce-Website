// Product type from RapidAPI (what your backend returns)
export interface Product {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price?: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_photo: string;
  product_url?: string;
  product_minimum_offer_price?: string;
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  climate_pledge_friendly?: boolean;
}

// Cleaned product type for frontend use
export interface CleanProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  url?: string;
  isBestSeller?: boolean;
  isAmazonChoice?: boolean;
  discount?: number;
}

// Filter options type
export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating';
  onlyBestSeller?: boolean;
  onlyAmazonChoice?: boolean;
}

// API Response type
export interface ProductsResponse {
  data: {
    products: Product[];
    total_products?: number;
  };
}

// Category type
export type Category = 
  | 'electronics'
  | 'furniture' 
  | 'fashion'
  | 'home-decor'
  | 'kitchen'
  | 'books'
  | 'sports'
  | 'toys';

/**
 * Helper function to clean product data from API
 * Converts API format to frontend-friendly format
 * Converts USD prices to INR (₹)
 */
export function cleanProduct(product: Product): CleanProduct {
  // USD to INR conversion rate (approximate, can be updated)
  const USD_TO_INR = 83;
  
  // Extract price (remove currency symbols, convert to number)
  // Check if price contains $ or USD to determine if conversion is needed
  const priceStr = product.product_price || '';
  const isUSD = priceStr.includes('$') || priceStr.toLowerCase().includes('usd');
  
  let price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
  
  // Convert USD to INR if needed
  if (isUSD && price > 0) {
    price = Math.round(price * USD_TO_INR);
  }
  
  // Handle original price
  const originalPriceStr = product.product_original_price || '';
  const isOriginalUSD = originalPriceStr.includes('$') || originalPriceStr.toLowerCase().includes('usd');
  let originalPrice = parseFloat(originalPriceStr.replace(/[^0-9.]/g, '') || '0');
  
  if (isOriginalUSD && originalPrice > 0) {
    originalPrice = Math.round(originalPrice * USD_TO_INR);
  }
  
  const rating = parseFloat(product.product_star_rating || '0');
  
  // Calculate discount percentage
  const discount = originalPrice && price && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return {
    id: product.asin,
    title: product.product_title,
    price,
    originalPrice: originalPrice > 0 ? originalPrice : undefined,
    rating,
    reviewCount: product.product_num_ratings || 0,
    image: product.product_photo,
    url: product.product_url,
    isBestSeller: product.is_best_seller,
    isAmazonChoice: product.is_amazon_choice,
    discount
  };
}