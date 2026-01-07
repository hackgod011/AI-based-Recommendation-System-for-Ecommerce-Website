import { NextResponse } from "next/server";

// Simple in-memory cache (use Redis in production)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const cacheKey = query.toLowerCase().trim();

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for: ${query}`);
    return NextResponse.json({ products: cached.data });
  }

  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US`;

  try {
    console.log(`🔍 Fetching from API: ${query}`);
    
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform and filter data
    const products = (data?.data?.products || [])
      .slice(0, 10) // Limit to 10 results
      .map((p) => ({
        asin: p.asin,
        title: p.product_title,
        price: p.product_price,
        image: p.product_photo,
        rating: p.product_star_rating,
        reviews: p.product_num_ratings,
      }))
      .filter((p) => p.title && p.image); // Filter out incomplete products

    // Store in cache
    cache.set(cacheKey, {
      data: products,
      timestamp: Date.now(),
    });

    // Clean old cache entries (basic cleanup)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return NextResponse.json({ products });

  } catch (err) {
    console.error("Search API error:", err);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        message: err.message 
      },
      { status: 500 }
    );
  }
}