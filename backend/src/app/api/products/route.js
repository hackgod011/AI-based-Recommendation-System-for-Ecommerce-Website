import { NextResponse } from "next/server";

// In-memory cache (use Redis in production)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Category to search query mapping
// Map your category slugs to search terms for RapidAPI
const categoryQueries = {
  electronics: 'electronics',
  furniture: 'furniture',
  fashion: 'fashion clothing',
  'home-decor': 'home decor',
  kitchen: 'kitchen appliances',
  books: 'books',
  sports: 'sports equipment',
  toys: 'toys'
};

/**
 * GET /api/products?category=furniture&page=1
 * Fetches products by category from RapidAPI
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = searchParams.get("page") || "1";

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  // Get search query for category
  const searchQuery = categoryQueries[category] || category;
  const cacheKey = `${category}-${page}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Backend cache hit: ${cacheKey}`);
    return NextResponse.json({ products: cached.data });
  }

  // Fetch from RapidAPI
  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&country=US`;

  try {
    console.log(`🔍 Backend fetching from RapidAPI: ${searchQuery} (page ${page})`);

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();

    // Map and filter products
    const products = (data?.data?.products || [])
      .map((p) => ({
        asin: p.asin,
        product_title: p.product_title,
        product_price: p.product_price,
        product_original_price: p.product_original_price,
        product_star_rating: p.product_star_rating,
        product_num_ratings: p.product_num_ratings,
        product_photo: p.product_photo,
        product_url: p.product_url,
        is_best_seller: p.is_best_seller,
        is_amazon_choice: p.is_amazon_choice,
      }))
      .filter((p) => p.product_title && p.product_photo && p.product_price);

    // Cache the results
    cache.set(cacheKey, {
      data: products,
      timestamp: Date.now(),
    });

    // Clean old cache entries (keep max 100 entries)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    console.log(`✅ Backend cached: ${cacheKey} (${products.length} products)`);

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Backend products API error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
