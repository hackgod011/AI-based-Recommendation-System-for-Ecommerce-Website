import { NextResponse } from "next/server";

// In-memory cache (use Redis in production)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/product/[productId]
 * Fetches a single product by ASIN/productId from RapidAPI
 */
export async function GET(req, { params }) {
  // Handle both Next.js 14 and 15+ (params might be a promise in Next.js 15+)
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const productId = resolvedParams?.productId;

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID is required", message: "Please provide a valid product ID in the URL path" },
      { status: 400 }
    );
  }

  const cacheKey = `product-${productId}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Backend cache hit: ${cacheKey}`);
    return NextResponse.json({ product: cached.data });
  }

  try {
    // Try to fetch product details by ASIN
    // Note: RapidAPI may have a product detail endpoint, but for now we'll search
    // In a real scenario, you might want to use a product detail API endpoint
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-details-lite?asin=${encodeURIComponent(productId)}&country=US`;

    console.log(`🔍 Backend fetching product: ${productId}`);

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // If product detail endpoint doesn't work, try searching
      console.log(`⚠️ Product detail endpoint failed, trying search...`);
      return await fetchProductBySearch(productId, cacheKey);
    }

    const data = await response.json();

    // Map product data
    const product = {
      asin: data?.data?.asin || productId,
      product_title: data?.data?.product_title || data?.data?.title || 'Product',
      product_price: data?.data?.product_price || data?.data?.price || '0',
      product_original_price: data?.data?.product_original_price || data?.data?.original_price,
      product_star_rating: data?.data?.product_star_rating || data?.data?.rating || '0',
      product_num_ratings: data?.data?.product_num_ratings || data?.data?.review_count || 0,
      product_photo: data?.data?.product_photo || data?.data?.image || data?.data?.main_image || '',
      product_url: data?.data?.product_url || data?.data?.url,
      is_best_seller: data?.data?.is_best_seller || false,
      is_amazon_choice: data?.data?.is_amazon_choice || false,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: product,
      timestamp: Date.now(),
    });

    console.log(`✅ Backend cached: ${cacheKey}`);

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Backend product API error:", err);
    // Fallback to search
    return await fetchProductBySearch(productId, cacheKey);
  }
}

/**
 * Fallback: Search for product by ASIN
 */
async function fetchProductBySearch(productId, cacheKey) {
  try {
    // Search for the product using ASIN as query
    const searchUrl = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(productId)}&page=1&country=US`;

    const response = await fetch(searchUrl, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();
    const products = data?.data?.products || [];

    // Find product matching the ASIN
    const foundProduct = products.find(p => p.asin === productId);

    if (!foundProduct) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `Product with ID ${productId} not found`,
        },
        { status: 404 }
      );
    }

    // Map product data
    const product = {
      asin: foundProduct.asin,
      product_title: foundProduct.product_title,
      product_price: foundProduct.product_price,
      product_original_price: foundProduct.product_original_price,
      product_star_rating: foundProduct.product_star_rating,
      product_num_ratings: foundProduct.product_num_ratings,
      product_photo: foundProduct.product_photo,
      product_url: foundProduct.product_url,
      is_best_seller: foundProduct.is_best_seller,
      is_amazon_choice: foundProduct.is_amazon_choice,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: product,
      timestamp: Date.now(),
    });

    console.log(`✅ Backend cached (via search): ${cacheKey}`);

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Backend product search error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
