import { NextResponse } from "next/server";

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const categoryQueries = {
  electronics: "electronics",
  furniture: "furniture",
  fashion: "fashion clothing",
  "home-decor": "home decor",
  kitchen: "kitchen appliances",
  books: "books",
  sports: "sports equipment",
  toys: "toys",
};

// ─── Fallback mock data per category ─────────────────────────────────────────
// Used when RapidAPI is unavailable or rate-limited (HTTP 429/403/timeout)
const MOCK_BY_CATEGORY = {
  electronics: [
    { asin: "B08PZHYWJS", product_title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones", product_price: "$348.00", product_original_price: "$399.00", product_star_rating: "4.7", product_num_ratings: 47382, product_photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", product_url: "https://amazon.com/dp/B08PZHYWJS", is_best_seller: true, is_amazon_choice: false },
    { asin: "B07VPBH3HG", product_title: "Logitech G502 HERO High Performance Wired Gaming Mouse", product_price: "$39.99", product_original_price: "$79.99", product_star_rating: "4.7", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80", product_url: "https://amazon.com/dp/B07VPBH3HG", is_best_seller: true, is_amazon_choice: true },
    { asin: "B0CXQKHL53", product_title: "Apple AirPods Pro (2nd Generation) Wireless Ear Buds with USB-C", product_price: "$249.00", product_original_price: "$299.00", product_star_rating: "4.8", product_num_ratings: 156789, product_photo: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80", product_url: "https://amazon.com/dp/B0CXQKHL53", is_best_seller: true, is_amazon_choice: true },
    { asin: "B09JQMJHXY", product_title: "Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones", product_price: "$329.00", product_original_price: "$379.00", product_star_rating: "4.6", product_num_ratings: 23891, product_photo: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80", product_url: "https://amazon.com/dp/B09JQMJHXY", is_best_seller: false, is_amazon_choice: true },
    { asin: "B0CM5JV268", product_title: "Apple MacBook Pro M3 14-inch 8GB 512GB", product_price: "$1,599.00", product_original_price: "$1,799.00", product_star_rating: "4.7", product_num_ratings: 4523, product_photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", product_url: "https://amazon.com/dp/B0CM5JV268", is_best_seller: true, is_amazon_choice: false },
    { asin: "B0BZL4TYH9", product_title: "Dell XPS 13 9315 Laptop 13.4-inch FHD+ i7 16GB 512GB", product_price: "$1,299.99", product_original_price: "$1,499.99", product_star_rating: "4.5", product_num_ratings: 2341, product_photo: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80", product_url: "https://amazon.com/dp/B0BZL4TYH9", is_best_seller: false, is_amazon_choice: true },
    { asin: "B07QXV6N1B", product_title: "Anker PowerCore 10000 Portable Charger", product_price: "$21.99", product_original_price: "$29.99", product_star_rating: "4.7", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80", product_url: "https://amazon.com/dp/B07QXV6N1B", is_best_seller: true, is_amazon_choice: true },
    { asin: "B0CHX3TW26", product_title: "Apple Watch Series 9 GPS 45mm Midnight Aluminum", product_price: "$429.00", product_original_price: "$499.00", product_star_rating: "4.8", product_num_ratings: 12453, product_photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", product_url: "https://amazon.com/dp/B0CHX3TW26", is_best_seller: true, is_amazon_choice: true },
    { asin: "B0C33XXS56", product_title: "TOZO T6 True Wireless Earbuds Bluetooth 5.3 IPX8", product_price: "$29.99", product_original_price: "$49.99", product_star_rating: "4.4", product_num_ratings: 89234, product_photo: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80", product_url: "https://amazon.com/dp/B0C33XXS56", is_best_seller: false, is_amazon_choice: true },
    { asin: "B09H2YC3X8", product_title: "Razer DeathAdder V3 Pro Wireless Gaming Mouse 30K DPI", product_price: "$149.99", product_original_price: "$179.99", product_star_rating: "4.6", product_num_ratings: 3456, product_photo: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80", product_url: "https://amazon.com/dp/B09H2YC3X8", is_best_seller: false, is_amazon_choice: false },
  ],
  furniture: [
    { asin: "FURN001", product_title: "IKEA KALLAX Shelf Unit White 77x77cm", product_price: "$89.99", product_original_price: "$109.99", product_star_rating: "4.5", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "FURN002", product_title: "Furinno Efficient Home Laptop Notebook Computer Desk", product_price: "$45.99", product_original_price: "$59.99", product_star_rating: "4.3", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "FURN003", product_title: "Flash Furniture Mid-Back Mesh Drafting Chair Adjustable", product_price: "$139.99", product_original_price: "$179.99", product_star_rating: "4.4", product_num_ratings: 12345, product_photo: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "FURN004", product_title: "Better Homes & Gardens 3-Cube Organizer Storage Bookcase", product_price: "$47.00", product_original_price: "$59.00", product_star_rating: "4.2", product_num_ratings: 8901, product_photo: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "FURN005", product_title: "Zinus 12 Inch Green Tea Memory Foam Mattress Queen", product_price: "$299.00", product_original_price: "$399.00", product_star_rating: "4.5", product_num_ratings: 56789, product_photo: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "FURN006", product_title: "SONGMICS 3-Tier Bookshelf Industrial Bookcase Wood & Metal", product_price: "$69.99", product_original_price: "$89.99", product_star_rating: "4.6", product_num_ratings: 9876, product_photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "FURN007", product_title: "Novogratz Brittany Sofa Futon Premium Linen Upholstery", product_price: "$399.00", product_original_price: "$499.00", product_star_rating: "4.3", product_num_ratings: 7654, product_photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "FURN008", product_title: "Sauder 3-Shelf Bookcase Highland Oak Finish", product_price: "$62.99", product_original_price: "$79.99", product_star_rating: "4.1", product_num_ratings: 14567, product_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
  ],
  fashion: [
    { asin: "FASH001", product_title: "Amazon Essentials Men's Regular-Fit Short-Sleeve T-Shirt", product_price: "$9.90", product_original_price: "$14.99", product_star_rating: "4.4", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "FASH002", product_title: "Levi's Women's 721 High Rise Skinny Jeans Blue Wave Dark", product_price: "$49.99", product_original_price: "$69.50", product_star_rating: "4.5", product_num_ratings: 45678, product_photo: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "FASH003", product_title: "Hanes Men's EcoSmart Pullover Hoodie Sweatshirt", product_price: "$19.00", product_original_price: "$26.00", product_star_rating: "4.6", product_num_ratings: 123456, product_photo: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "FASH004", product_title: "Nike Men's Dri-FIT Training T-Shirt Short Sleeve", product_price: "$25.00", product_original_price: "$35.00", product_star_rating: "4.7", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "FASH005", product_title: "Adidas Women's Tiro 21 Track Pants", product_price: "$35.00", product_original_price: "$45.00", product_star_rating: "4.5", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "FASH006", product_title: "New Balance Men's Fresh Foam Arishi v3 Running Shoe", product_price: "$55.99", product_original_price: "$74.99", product_star_rating: "4.4", product_num_ratings: 18765, product_photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
  ],
  "home-decor": [
    { asin: "HOME001", product_title: "Umbra Trigg Floating Wall Display Shelves Set of 2", product_price: "$38.00", product_original_price: "$48.00", product_star_rating: "4.4", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "HOME002", product_title: "Mkono Macrame Wall Hanging Tapestry Home Decor", product_price: "$24.99", product_original_price: "$34.99", product_star_rating: "4.6", product_num_ratings: 45678, product_photo: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "HOME003", product_title: "VINAEMO LED Edison Bulb String Lights 33ft Outdoor", product_price: "$18.99", product_original_price: "$26.99", product_star_rating: "4.5", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "HOME004", product_title: "Succulent Plants 20 Pack Fully Rooted Live Indoor Succulents", product_price: "$39.99", product_original_price: "$55.00", product_star_rating: "4.3", product_num_ratings: 12345, product_photo: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "HOME005", product_title: "LEVOIT Air Purifier for Home Large Room 1095 sq ft", product_price: "$149.99", product_original_price: "$199.99", product_star_rating: "4.7", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "HOME006", product_title: "Threshold Decorative Throw Pillow 18x18 Geometric", product_price: "$15.00", product_original_price: "$20.00", product_star_rating: "4.2", product_num_ratings: 8901, product_photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
  ],
  kitchen: [
    { asin: "KTCN001", product_title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker 6 Quart", product_price: "$89.95", product_original_price: "$109.99", product_star_rating: "4.7", product_num_ratings: 234567, product_photo: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "KTCN002", product_title: "Cuisinart 14-Cup Food Processor Brushed Stainless", product_price: "$199.95", product_original_price: "$249.95", product_star_rating: "4.6", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "KTCN003", product_title: "KitchenAid Artisan Tilt-Head Stand Mixer 5 Qt Empire Red", product_price: "$379.99", product_original_price: "$449.99", product_star_rating: "4.8", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "KTCN004", product_title: "Ninja Professional Plus Blender with Auto-iQ BN752", product_price: "$99.99", product_original_price: "$129.99", product_star_rating: "4.7", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "KTCN005", product_title: "OXO Good Grips 3-Piece Mixing Bowl Set", product_price: "$39.99", product_original_price: "$55.00", product_star_rating: "4.8", product_num_ratings: 45678, product_photo: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "KTCN006", product_title: "Pyrex Glass Mixing Bowl Set 3-Piece Round Baking Bowls", product_price: "$17.99", product_original_price: "$24.99", product_star_rating: "4.7", product_num_ratings: 123456, product_photo: "https://images.unsplash.com/photo-1594213783284-dc618c5cc680?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
  ],
  books: [
    { asin: "BOOK001", product_title: "Atomic Habits: An Easy & Proven Way to Build Good Habits", product_price: "$14.99", product_original_price: "$27.00", product_star_rating: "4.8", product_num_ratings: 345678, product_photo: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "BOOK002", product_title: "The Psychology of Money: Timeless Lessons on Wealth", product_price: "$16.99", product_original_price: "$22.00", product_star_rating: "4.7", product_num_ratings: 123456, product_photo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "BOOK003", product_title: "Deep Work: Rules for Focused Success in a Distracted World", product_price: "$15.29", product_original_price: "$19.00", product_star_rating: "4.6", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "BOOK004", product_title: "Ikigai: The Japanese Secret to a Long and Happy Life", product_price: "$12.99", product_original_price: "$17.99", product_star_rating: "4.5", product_num_ratings: 56789, product_photo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
    { asin: "BOOK005", product_title: "The Lean Startup: Continuous Innovation to Create Radically Successful Businesses", product_price: "$13.99", product_original_price: "$18.00", product_star_rating: "4.5", product_num_ratings: 45678, product_photo: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
  ],
  sports: [
    { asin: "SPRT001", product_title: "Fit Simplify Resistance Loop Exercise Bands Set of 5", product_price: "$9.95", product_original_price: "$14.95", product_star_rating: "4.7", product_num_ratings: 234567, product_photo: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "SPRT002", product_title: "Gaiam Essentials Thick Yoga Mat Fitness & Exercise Mat 2/5 Inch", product_price: "$21.98", product_original_price: "$29.99", product_star_rating: "4.5", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "SPRT003", product_title: "CAP Barbell Adjustable Dumbbell Set with Case 40lbs", product_price: "$89.99", product_original_price: "$119.99", product_star_rating: "4.6", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "SPRT004", product_title: "Hydro Flask 32 oz Wide Mouth Insulated Water Bottle", product_price: "$44.95", product_original_price: "$54.95", product_star_rating: "4.8", product_num_ratings: 78901, product_photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "SPRT005", product_title: "TRX GO Suspension Trainer System Beginner to Advanced", product_price: "$109.95", product_original_price: "$149.95", product_star_rating: "4.7", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "SPRT006", product_title: "Callaway Edge 10-Piece Golf Club Set Right Hand Men's", product_price: "$349.00", product_original_price: "$449.99", product_star_rating: "4.5", product_num_ratings: 5678, product_photo: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: false },
  ],
  toys: [
    { asin: "TOYS001", product_title: "LEGO Classic Creative Color Fun 11032 Building Toy Set 1500 Pieces", product_price: "$59.99", product_original_price: "$79.99", product_star_rating: "4.8", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: true },
    { asin: "TOYS002", product_title: "Melissa & Doug Deluxe Wooden Railway Train Set 130+ Pieces", product_price: "$89.99", product_original_price: "$109.99", product_star_rating: "4.7", product_num_ratings: 12345, product_photo: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
    { asin: "TOYS003", product_title: "Hot Wheels 20-Car Gift Pack Assorted 1:64 Scale Vehicles", product_price: "$22.99", product_original_price: "$29.99", product_star_rating: "4.8", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1506022221163-68bb84b54f7e?w=400&q=80", product_url: "https://amazon.com", is_best_seller: true, is_amazon_choice: false },
    { asin: "TOYS004", product_title: "Play-Doh Modeling Compound 10-Pack Case of Colors", product_price: "$9.99", product_original_price: "$14.99", product_star_rating: "4.7", product_num_ratings: 78901, product_photo: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400&q=80", product_url: "https://amazon.com", is_best_seller: false, is_amazon_choice: true },
  ],
};

/**
 * GET /api/products?category=furniture&page=1
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = searchParams.get("page") || "1";

  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  const searchQuery = categoryQueries[category] || category;
  const cacheKey = `${category}-${page}`;

  // Cache hit
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return NextResponse.json({ products: cached.data });
  }

  // No API key configured → use mock directly
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn(`⚠️ RAPIDAPI_KEY not set, serving mock data for: ${category}`);
    return NextResponse.json({ products: MOCK_BY_CATEGORY[category] ?? MOCK_BY_CATEGORY.electronics, source: "mock" });
  }

  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&country=US`;

  try {
    console.log(`🔍 Fetching from RapidAPI: ${searchQuery} (page ${page})`);

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST ?? "real-time-amazon-data.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(10000),
    });

    // Rate limited or blocked — serve mock instead of 500
    if (response.status === 429 || response.status === 403) {
      console.warn(`⚠️ RapidAPI rate limited (HTTP ${response.status}) — falling back to mock data for: ${category}`);
      const mock = MOCK_BY_CATEGORY[category] ?? MOCK_BY_CATEGORY.electronics;
      cache.set(cacheKey, { data: mock, timestamp: Date.now() });
      return NextResponse.json({ products: mock, source: "mock_rate_limited" });
    }

    if (!response.ok) {
      throw new Error(`RapidAPI responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const products = (data?.data?.products ?? [])
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

    if (products.length === 0) {
      console.warn(`⚠️ RapidAPI returned 0 products for ${category} — using mock`);
      return NextResponse.json({ products: MOCK_BY_CATEGORY[category] ?? [], source: "mock_empty" });
    }

    cache.set(cacheKey, { data: products, timestamp: Date.now() });
    if (cache.size > 100) cache.delete(cache.keys().next().value);
    console.log(`✅ Cached: ${cacheKey} (${products.length} products)`);
    return NextResponse.json({ products });

  } catch (err) {
    console.error("Products API error:", err.message);
    // Never 500 — fall back to mock
    const mock = MOCK_BY_CATEGORY[category] ?? MOCK_BY_CATEGORY.electronics;
    return NextResponse.json({ products: mock, source: "mock_error" });
  }
}
