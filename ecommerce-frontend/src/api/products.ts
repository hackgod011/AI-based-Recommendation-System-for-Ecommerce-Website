import { cleanProduct,type CleanProduct } from '@/types/product'
import type { FilterOptions } from '@/types/product';

// Frontend API base URL (calls your backend)
const API_BASE = '/api';

// Cache for API responses (5 minutes)
const cache = new Map<string, { data: CleanProduct[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Fetch products by category
 * This calls YOUR backend which then calls RapidAPI
 */
export async function fetchProductsByCategory(
  category: string,
  page: number = 1,
  filters?: FilterOptions
): Promise<CleanProduct[]> {
  const cacheKey = `${category}-${page}-${JSON.stringify(filters)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return applyFilters(cached.data, filters);
  }

  try {
    console.log(`🔍 Fetching: ${category} (page ${page})`);
    
    // Call YOUR backend API
    const response = await fetch(
      `${API_BASE}/products?category=${encodeURIComponent(category)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const products = (data.products || []).map(cleanProduct);

    // Cache the response
    cache.set(cacheKey, { data: products, timestamp: Date.now() });

    return applyFilters(products, filters);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  filters?: FilterOptions
): Promise<CleanProduct[]> {
  const cacheKey = `search-${query}-${page}-${JSON.stringify(filters)}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return applyFilters(cached.data, filters);
  }

  try {
    // Call YOUR backend search API
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const products = (data.products || []).map(cleanProduct);

    // Cache the response
    cache.set(cacheKey, { data: products, timestamp: Date.now() });

    return applyFilters(products, filters);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Fetch single product details
 */
export async function fetchProductById(productId: string): Promise<CleanProduct> {
  const cacheKey = `product-${productId}`;
  
  const cached = cache.get(cacheKey);
  if (cached && cached.data[0]) {
    return cached.data[0];
  }

  try {
    const response = await fetch(`${API_BASE}/product/${productId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const product = cleanProduct(data.product);

    cache.set(cacheKey, { data: [product], timestamp: Date.now() });

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Apply filters to products (CLIENT-SIDE filtering)
 */
function applyFilters(products: CleanProduct[], filters?: FilterOptions): CleanProduct[] {
  if (!filters) return products;

  let filtered = [...products];

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    filtered = filtered.filter(p => p.rating >= filters.minRating!);
  }

  // Best seller filter
  if (filters.onlyBestSeller) {
    filtered = filtered.filter(p => p.isBestSeller);
  }

  // Amazon's Choice filter
  if (filters.onlyAmazonChoice) {
    filtered = filtered.filter(p => p.isAmazonChoice);
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      // 'relevance' is default order from API
    }
  }

  return filtered;
}

/**
 * Clear cache (useful for testing)
 */
export function clearCache() {
  cache.clear();
  console.log('🗑️ Cache cleared');
}