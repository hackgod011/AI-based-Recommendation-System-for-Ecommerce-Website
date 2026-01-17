// import { NextResponse } from "next/server";

// // Simple in-memory cache (use Redis in production)
// const cache = new Map();
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const query = searchParams.get("q");

//   if (!query || query.length < 2) {
//     return NextResponse.json({ products: [] });
//   }

//   const cacheKey = query.toLowerCase().trim();

//   // Check cache first
//   const cached = cache.get(cacheKey);
//   if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//     console.log(`✅ Cache hit for: ${query}`);
//     return NextResponse.json({ products: cached.data });
//   }

//   const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US`;

//   try {
//     console.log(`🔍 Fetching from API: ${query}`);
    
//     const response = await fetch(url, {
//       headers: {
//         "x-rapidapi-key": process.env.RAPIDAPI_KEY,
//         "x-rapidapi-host": process.env.RAPIDAPI_HOST,
//       },
//       // Add timeout
//       signal: AbortSignal.timeout(5000), // 5 second timeout
//     });

//     if (!response.ok) {
//       throw new Error(`API responded with status: ${response.status}`);
//     }

//     const data = await response.json();

//     // Transform and filter data - use same format as products API
//     const products = (data?.data?.products || [])
//       .map((p) => ({
//         asin: p.asin,
//         product_title: p.product_title,
//         product_price: p.product_price,
//         product_original_price: p.product_original_price,
//         product_star_rating: p.product_star_rating,
//         product_num_ratings: p.product_num_ratings,
//         product_photo: p.product_photo,
//         product_url: p.product_url,
//         is_best_seller: p.is_best_seller,
//         is_amazon_choice: p.is_amazon_choice,
//       }))
//       .filter((p) => p.product_title && p.product_photo && p.product_price); // Filter out incomplete products

//     // Store in cache
//     cache.set(cacheKey, {
//       data: products,
//       timestamp: Date.now(),
//     });

//     // Clean old cache entries (basic cleanup)
//     if (cache.size > 100) {
//       const firstKey = cache.keys().next().value;
//       cache.delete(firstKey);
//     }

//     return NextResponse.json({ products });

//   } catch (err) {
//     console.error("Search API error:", err);
    
//     return NextResponse.json(
//       { 
//         error: "Failed to fetch products",
//         message: err.message 
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

// Mock product database
const MOCK_PRODUCTS = {
  "wireless headphones": [
    {
      asin: "B08PZHYWJS",
      product_title: "Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones with Mic for Phone-Call and Alexa Voice Control, Black",
      product_price: "$348.00",
      product_original_price: "$399.00",
      product_star_rating: "4.7",
      product_num_ratings: "47382",
      product_photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      product_url: "https://amazon.com/dp/B08PZHYWJS",
      is_best_seller: true,
      is_amazon_choice: false
    },
    {
      asin: "B09JQMJHXY",
      product_title: "Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones - Triple Black",
      product_price: "$329.00",
      product_original_price: "$379.00",
      product_star_rating: "4.6",
      product_num_ratings: "23891",
      product_photo: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
      product_url: "https://amazon.com/dp/B09JQMJHXY",
      is_best_seller: false,
      is_amazon_choice: true
    },
    {
      asin: "B0BSHF7LKM",
      product_title: "JBL Tune 720BT - Wireless Over-Ear Headphones with Microphone, 76H Battery, Bluetooth 5.3, Lightweight & Foldable",
      product_price: "$79.95",
      product_original_price: "$99.95",
      product_star_rating: "4.5",
      product_num_ratings: "12456",
      product_photo: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&q=80",
      product_url: "https://amazon.com/dp/B0BSHF7LKM",
      is_best_seller: false,
      is_amazon_choice: false
    },
    {
      asin: "B0C33XXS56",
      product_title: "TOZO T6 True Wireless Earbuds Bluetooth 5.3 Headphones Touch Control with Wireless Charging Case IPX8 Waterproof",
      product_price: "$29.99",
      product_original_price: "$49.99",
      product_star_rating: "4.4",
      product_num_ratings: "89234",
      product_photo: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
      product_url: "https://amazon.com/dp/B0C33XXS56",
      is_best_seller: false,
      is_amazon_choice: true
    },
    {
      asin: "B08C4KWM9T",
      product_title: "Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Headphones with Multiple Modes, Hi-Res Sound",
      product_price: "$79.99",
      product_original_price: "$89.99",
      product_star_rating: "4.6",
      product_num_ratings: "34567",
      product_photo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
      product_url: "https://amazon.com/dp/B08C4KWM9T",
      is_best_seller: false,
      is_amazon_choice: false
    },
    {
      asin: "B0CXQKHL53",
      product_title: "Apple AirPods Pro (2nd Generation) Wireless Ear Buds with USB-C Charging, Up to 2X More Active Noise Cancelling",
      product_price: "$249.00",
      product_original_price: "$299.00",
      product_star_rating: "4.8",
      product_num_ratings: "156789",
      product_photo: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CXQKHL53",
      is_best_seller: true,
      is_amazon_choice: true
    }
  ],
  "laptop": [
    {
      asin: "B0CM5JV268",
      product_title: "Apple 2023 MacBook Pro Laptop M3 chip with 8-core CPU, 10-core GPU: 14.2-inch Liquid Retina XDR Display, 8GB Unified Memory, 512GB SSD Storage",
      product_price: "$1,599.00",
      product_original_price: "$1,799.00",
      product_star_rating: "4.7",
      product_num_ratings: "4523",
      product_photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CM5JV268",
      is_best_seller: true,
      is_amazon_choice: false
    },
    {
      asin: "B0BZL4TYH9",
      product_title: "Dell XPS 13 9315 Laptop - 13.4-inch FHD+ Display, Intel Core i7-1250U, 16GB RAM, 512GB SSD, Backlit Keyboard",
      product_price: "$1,299.99",
      product_original_price: "$1,499.99",
      product_star_rating: "4.5",
      product_num_ratings: "2341",
      product_photo: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
      product_url: "https://amazon.com/dp/B0BZL4TYH9",
      is_best_seller: false,
      is_amazon_choice: true
    },
    {
      asin: "B0CCP92Q16",
      product_title: "ASUS VivoBook 15 Thin and Light Laptop, 15.6 FHD Display, Intel Core i5-1135G7, 8GB RAM, 512GB SSD",
      product_price: "$499.99",
      product_original_price: "$599.99",
      product_star_rating: "4.3",
      product_num_ratings: "8934",
      product_photo: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CCP92Q16",
      is_best_seller: false,
      is_amazon_choice: false
    },
    {
      asin: "B0BSHF8KQ3",
      product_title: "HP 2024 Newest 15.6\" HD Laptop, Intel Core i3-1115G4 Processor, 32GB RAM, 1TB SSD, HDMI, Webcam, Wi-Fi",
      product_price: "$589.00",
      product_original_price: "$699.00",
      product_star_rating: "4.4",
      product_num_ratings: "5678",
      product_photo: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80",
      product_url: "https://amazon.com/dp/B0BSHF8KQ3",
      is_best_seller: false,
      is_amazon_choice: true
    }
  ],
  "smart watch": [
    {
      asin: "B0CHX3TW26",
      product_title: "Apple Watch Series 9 [GPS 45mm] Smartwatch with Midnight Aluminum Case with Midnight Sport Band",
      product_price: "$429.00",
      product_original_price: "$499.00",
      product_star_rating: "4.8",
      product_num_ratings: "12453",
      product_photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CHX3TW26",
      is_best_seller: true,
      is_amazon_choice: true
    },
    {
      asin: "B0CC5DY8YN",
      product_title: "Samsung Galaxy Watch 6 40mm Bluetooth Smartwatch, Fitness Tracker, Personalized HR Zones, Advanced Sleep Coaching",
      product_price: "$269.99",
      product_original_price: "$329.99",
      product_star_rating: "4.6",
      product_num_ratings: "8934",
      product_photo: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CC5DY8YN",
      is_best_seller: false,
      is_amazon_choice: false
    },
    {
      asin: "B0CSVFN2BS",
      product_title: "Fitbit Versa 4 Fitness Smartwatch with Daily Readiness, GPS, 24/7 Heart Rate, 40+ Exercise Modes, Sleep Tracking",
      product_price: "$199.95",
      product_original_price: "$229.95",
      product_star_rating: "4.3",
      product_num_ratings: "15678",
      product_photo: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CSVFN2BS",
      is_best_seller: false,
      is_amazon_choice: true
    }
  ],
  "gaming mouse": [
    {
      asin: "B07VPBH3HG",
      product_title: "Logitech G502 HERO High Performance Wired Gaming Mouse, HERO 25K Sensor, 25,600 DPI, RGB, Adjustable Weights",
      product_price: "$39.99",
      product_original_price: "$79.99",
      product_star_rating: "4.7",
      product_num_ratings: "67890",
      product_photo: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",
      product_url: "https://amazon.com/dp/B07VPBH3HG",
      is_best_seller: true,
      is_amazon_choice: true
    },
    {
      asin: "B09H2YC3X8",
      product_title: "Razer DeathAdder V3 Pro Wireless Gaming Mouse: 30K DPI Optical Sensor - Lightest Wireless Ergonomic Esports Mouse",
      product_price: "$149.99",
      product_original_price: "$179.99",
      product_star_rating: "4.6",
      product_num_ratings: "3456",
      product_photo: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80",
      product_url: "https://amazon.com/dp/B09H2YC3X8",
      is_best_seller: false,
      is_amazon_choice: false
    }
  ],
  "phone cases": [
    {
      asin: "B0CXBL7J3D",
      product_title: "Spigen Tough Armor Designed for iPhone 15 Pro Max Case (2023) - Black",
      product_price: "$19.99",
      product_original_price: "$29.99",
      product_star_rating: "4.5",
      product_num_ratings: "23456",
      product_photo: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CXBL7J3D",
      is_best_seller: true,
      is_amazon_choice: false
    },
    {
      asin: "B0CX5T9W8H",
      product_title: "OtterBox Defender Series Case for iPhone 15 Pro - Black",
      product_price: "$49.95",
      product_original_price: "$64.95",
      product_star_rating: "4.7",
      product_num_ratings: "45678",
      product_photo: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80",
      product_url: "https://amazon.com/dp/B0CX5T9W8H",
      is_best_seller: false,
      is_amazon_choice: true
    }
  ],
  "power banks": [
    {
      asin: "B07QXV6N1B",
      product_title: "Anker PowerCore 10000 Portable Charger, One of The Smallest and Lightest 10000mAh Power Bank",
      product_price: "$21.99",
      product_original_price: "$29.99",
      product_star_rating: "4.7",
      product_num_ratings: "89012",
      product_photo: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80",
      product_url: "https://amazon.com/dp/B07QXV6N1B",
      is_best_seller: true,
      is_amazon_choice: true
    },
    {
      asin: "B0C8QRRZ7G",
      product_title: "iWALK Small Portable Charger 9000mAh Ultra-Compact Power Bank Cute Battery Pack Compatible with iPhone 15/14/13/12 Series",
      product_price: "$19.99",
      product_original_price: "$25.99",
      product_star_rating: "4.4",
      product_num_ratings: "12345",
      product_photo: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80",
      product_url: "https://amazon.com/dp/B0C8QRRZ7G",
      is_best_seller: false,
      is_amazon_choice: false
    }
  ]
};

// Generate more products dynamically based on search query
function generateMockProducts(query, count = 20) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check if we have exact match
  if (MOCK_PRODUCTS[normalizedQuery]) {
    return MOCK_PRODUCTS[normalizedQuery];
  }
  
  // Check for partial matches
  for (const [key, products] of Object.entries(MOCK_PRODUCTS)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return products;
    }
  }
  
  // Generate generic products if no match
  return Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    asin: `MOCK${Date.now()}${i}`,
    product_title: `${query} - Product ${i + 1} - High Quality Premium Edition with Advanced Features`,
    product_price: `$${(Math.random() * 500 + 20).toFixed(2)}`,
    product_original_price: `$${(Math.random() * 600 + 50).toFixed(2)}`,
    product_star_rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    product_num_ratings: Math.floor(Math.random() * 50000 + 100).toString(),
    product_photo: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&q=80`,
    product_url: `https://amazon.com/dp/MOCK${i}`,
    is_best_seller: i === 0,
    is_amazon_choice: i === 1
  }));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const products = generateMockProducts(query);

  console.log(`🎭 Mock API: Returning ${products.length} products for "${query}"`);

  return NextResponse.json({ products });
}