/**
 * GET /api/recommendations?userId=<uuid>
 *
 * Flow:
 *   1. Fetch user data from Supabase (orders, order_items, user_preferences, users.created_at)
 *   2. Derive ML features from real data; use defaults for untracked fields
 *   3. Call ai-service POST /predict  →  ranked category list
 *   4. Return top recommended categories + mock products per category
 *
 * Falls back gracefully if ai-service is down (rule-based in ai-service handles it).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key server-side to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const ALL_CATEGORIES = ["electronics", "furniture", "fashion", "sports", "home-decor", "kitchen", "books", "toys"];

// ─── Mock products per category (same data as products route) ─────────────────
const MOCK_PRODUCTS = {
  electronics: [
    { asin: "B08PZHYWJS", product_title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones", product_price: "$348.00", product_original_price: "$399.00", product_star_rating: "4.7", product_num_ratings: 47382, product_photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", is_best_seller: true },
    { asin: "B0CXQKHL53", product_title: "Apple AirPods Pro (2nd Generation) Wireless Ear Buds", product_price: "$249.00", product_original_price: "$299.00", product_star_rating: "4.8", product_num_ratings: 156789, product_photo: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80", is_best_seller: true },
    { asin: "B0CHX3TW26", product_title: "Apple Watch Series 9 GPS 45mm", product_price: "$429.00", product_original_price: "$499.00", product_star_rating: "4.8", product_num_ratings: 12453, product_photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", is_best_seller: true },
    { asin: "B07VPBH3HG", product_title: "Logitech G502 HERO Gaming Mouse", product_price: "$39.99", product_original_price: "$79.99", product_star_rating: "4.7", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80", is_best_seller: true },
  ],
  furniture: [
    { asin: "FURN001", product_title: "IKEA KALLAX Shelf Unit White 77x77cm", product_price: "$89.99", product_original_price: "$109.99", product_star_rating: "4.5", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", is_best_seller: false },
    { asin: "FURN003", product_title: "Flash Furniture Mid-Back Mesh Chair Adjustable", product_price: "$139.99", product_original_price: "$179.99", product_star_rating: "4.4", product_num_ratings: 12345, product_photo: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80", is_best_seller: false },
    { asin: "FURN005", product_title: "Zinus 12 Inch Green Tea Memory Foam Mattress Queen", product_price: "$299.00", product_original_price: "$399.00", product_star_rating: "4.5", product_num_ratings: 56789, product_photo: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80", is_best_seller: true },
    { asin: "FURN006", product_title: "SONGMICS 3-Tier Bookshelf Industrial Wood & Metal", product_price: "$69.99", product_original_price: "$89.99", product_star_rating: "4.6", product_num_ratings: 9876, product_photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", is_best_seller: false },
  ],
  fashion: [
    { asin: "FASH001", product_title: "Amazon Essentials Men's Regular-Fit T-Shirt", product_price: "$9.90", product_original_price: "$14.99", product_star_rating: "4.4", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", is_best_seller: true },
    { asin: "FASH003", product_title: "Hanes Men's EcoSmart Pullover Hoodie", product_price: "$19.00", product_original_price: "$26.00", product_star_rating: "4.6", product_num_ratings: 123456, product_photo: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80", is_best_seller: true },
    { asin: "FASH004", product_title: "Nike Men's Dri-FIT Training T-Shirt", product_price: "$25.00", product_original_price: "$35.00", product_star_rating: "4.7", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", is_best_seller: false },
    { asin: "FASH006", product_title: "New Balance Men's Fresh Foam Arishi v3 Running Shoe", product_price: "$55.99", product_original_price: "$74.99", product_star_rating: "4.4", product_num_ratings: 18765, product_photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", is_best_seller: false },
  ],
  sports: [
    { asin: "SPRT001", product_title: "Fit Simplify Resistance Loop Exercise Bands Set of 5", product_price: "$9.95", product_original_price: "$14.95", product_star_rating: "4.7", product_num_ratings: 234567, product_photo: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80", is_best_seller: true },
    { asin: "SPRT002", product_title: "Gaiam Essentials Thick Yoga Mat 2/5 Inch", product_price: "$21.98", product_original_price: "$29.99", product_star_rating: "4.5", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", is_best_seller: false },
    { asin: "SPRT003", product_title: "CAP Barbell Adjustable Dumbbell Set 40lbs", product_price: "$89.99", product_original_price: "$119.99", product_star_rating: "4.6", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80", is_best_seller: false },
    { asin: "SPRT004", product_title: "Hydro Flask 32 oz Wide Mouth Insulated Bottle", product_price: "$44.95", product_original_price: "$54.95", product_star_rating: "4.8", product_num_ratings: 78901, product_photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", is_best_seller: true },
  ],
  "home-decor": [
    { asin: "HOME001", product_title: "Umbra Trigg Floating Wall Shelves Set of 2", product_price: "$38.00", product_original_price: "$48.00", product_star_rating: "4.4", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", is_best_seller: false },
    { asin: "HOME003", product_title: "VINAEMO LED Edison Bulb String Lights 33ft", product_price: "$18.99", product_original_price: "$26.99", product_star_rating: "4.5", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", is_best_seller: true },
    { asin: "HOME005", product_title: "LEVOIT Air Purifier for Home Large Room 1095 sq ft", product_price: "$149.99", product_original_price: "$199.99", product_star_rating: "4.7", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80", is_best_seller: true },
  ],
  kitchen: [
    { asin: "KTCN001", product_title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker 6 Qt", product_price: "$89.95", product_original_price: "$109.99", product_star_rating: "4.7", product_num_ratings: 234567, product_photo: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80", is_best_seller: true },
    { asin: "KTCN003", product_title: "KitchenAid Artisan Stand Mixer 5 Qt Empire Red", product_price: "$379.99", product_original_price: "$449.99", product_star_rating: "4.8", product_num_ratings: 89012, product_photo: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", is_best_seller: true },
    { asin: "KTCN004", product_title: "Ninja Professional Plus Blender Auto-iQ", product_price: "$99.99", product_original_price: "$129.99", product_star_rating: "4.7", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80", is_best_seller: false },
  ],
  books: [
    { asin: "BOOK001", product_title: "Atomic Habits: Build Good Habits & Break Bad Ones", product_price: "$14.99", product_original_price: "$27.00", product_star_rating: "4.8", product_num_ratings: 345678, product_photo: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", is_best_seller: true },
    { asin: "BOOK002", product_title: "The Psychology of Money: Timeless Lessons on Wealth", product_price: "$16.99", product_original_price: "$22.00", product_star_rating: "4.7", product_num_ratings: 123456, product_photo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80", is_best_seller: true },
    { asin: "BOOK003", product_title: "Deep Work: Rules for Focused Success", product_price: "$15.29", product_original_price: "$19.00", product_star_rating: "4.6", product_num_ratings: 67890, product_photo: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80", is_best_seller: false },
  ],
  toys: [
    { asin: "TOYS001", product_title: "LEGO Classic Creative Color Fun 1500 Pieces", product_price: "$59.99", product_original_price: "$79.99", product_star_rating: "4.8", product_num_ratings: 23456, product_photo: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80", is_best_seller: true },
    { asin: "TOYS003", product_title: "Hot Wheels 20-Car Gift Pack 1:64 Scale", product_price: "$22.99", product_original_price: "$29.99", product_star_rating: "4.8", product_num_ratings: 34567, product_photo: "https://images.unsplash.com/photo-1506022221163-68bb84b54f7e?w=400&q=80", is_best_seller: true },
  ],
};

// ─── Helper: derive features from Supabase user data ─────────────────────────
async function deriveFeatures(userId) {
  const now = Date.now();

  // Fetch user, orders, prefs in parallel
  const [userRes, ordersRes, prefsRes] = await Promise.allSettled([
    supabase.from("users").select("created_at").eq("id", userId).single(),
    supabase
      .from("orders")
      .select("created_at, order_items(product_id, product_title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_preferences")
      .select("categories, brands")
      .eq("user_id", userId)
      .single(),
  ]);

  const user   = userRes.status === "fulfilled"   ? userRes.value.data   : null;
  const orders = ordersRes.status === "fulfilled" ? ordersRes.value.data : [];
  const prefs  = prefsRes.status === "fulfilled"  ? prefsRes.value.data  : null;

  // Derived numeric features
  const numberOfPurchases = orders?.length ?? 0;

  const customerTenureYears = user?.created_at
    ? (now - new Date(user.created_at).getTime()) / (365.25 * 24 * 3600 * 1000)
    : 0;

  const lastPurchaseDaysAgo =
    orders?.length > 0
      ? Math.floor((now - new Date(orders[0].created_at).getTime()) / (24 * 3600 * 1000))
      : 365;

  // Derive top product category from order_items
  const categoryCounts = {};
  for (const order of orders ?? []) {
    for (const item of order.order_items ?? []) {
      const title = (item.product_title ?? "").toLowerCase();
      const detected = detectCategory(title);
      categoryCounts[detected] = (categoryCounts[detected] ?? 0) + 1;
    }
  }

  // Merge with user preference categories
  const favCategories = prefs?.categories ?? [];

  // Build priority list: user's purchase history first, then preferences, then all
  const priorityCategories = [
    ...Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat),
    ...favCategories.filter((c) => !categoryCounts[c]),
  ];

  // Fill up to 6 categories, always evaluate all if fewer
  const categoriesToScore = priorityCategories.length > 0
    ? [...new Set([...priorityCategories, ...ALL_CATEGORIES])].slice(0, 8)
    : ALL_CATEGORIES;

  return {
    features: {
      number_of_purchases:    numberOfPurchases,
      customer_tenure_years:  parseFloat(customerTenureYears.toFixed(3)),
      last_purchase_days_ago: lastPurchaseDaysAgo,
      product_categories:     categoriesToScore,
    },
    meta: {
      numberOfPurchases,
      topCategories: priorityCategories.slice(0, 3),
      favCategories,
    },
  };
}

function detectCategory(title) {
  if (/laptop|phone|tablet|headphone|earbud|watch|mouse|keyboard|speaker|camera|tv|monitor|charger/.test(title)) return "electronics";
  if (/sofa|chair|table|shelf|bookcase|mattress|wardrobe|desk|couch|bed/.test(title)) return "furniture";
  if (/shirt|jeans|dress|shoe|sneaker|hoodie|jacket|pant|skirt|watch/.test(title)) return "fashion";
  if (/dumbbell|yoga|treadmill|bicycle|gym|exercise|sports|fitness|band/.test(title)) return "sports";
  if (/vase|lamp|curtain|pillow|decor|candle|frame|rug|plant/.test(title)) return "home-decor";
  if (/pot|pan|blender|mixer|knife|cookware|pressure cooker/.test(title)) return "kitchen";
  if (/book|novel|guide|autobiography|textbook/.test(title)) return "books";
  if (/toy|lego|game|puzzle|doll|car|action figure/.test(title)) return "toys";
  return "electronics"; // default
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // 1. Derive features from user's real data
    const { features, meta } = await deriveFeatures(userId);

    // 2. Call ai-service
    let predictions = [];
    let aiPowered = false;

    try {
      const aiRes = await fetch(`${AI_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
        signal: AbortSignal.timeout(5000),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        predictions = aiData.predictions ?? [];
        aiPowered = aiData.ai_powered ?? false;
      } else {
        console.warn("AI service returned non-ok:", aiRes.status);
      }
    } catch (aiErr) {
      console.warn("AI service unreachable:", aiErr.message, "— using fallback");
    }

    // 3. Fallback: if ai-service is down, use simple rule-based scoring
    if (predictions.length === 0) {
      const recency = Math.max(0, (30 - features.last_purchase_days_ago) / 30);
      predictions = (features.product_categories ?? ALL_CATEGORIES).map((cat) => ({
        category: cat,
        purchase_probability: parseFloat((0.5 + recency * 0.2 + Math.random() * 0.1).toFixed(4)),
        should_recommend: true,
        reason: "rule_based_client_fallback",
      }));
      predictions.sort((a, b) => b.purchase_probability - a.purchase_probability);
    }

    // 4. Pick top recommended categories (recommend=true, max 3)
    const recommended = predictions.filter((p) => p.should_recommend).slice(0, 3);
    if (recommended.length === 0) {
      // If nothing clears the threshold, just take top 2
      recommended.push(...predictions.slice(0, 2));
    }

    // 5. Attach mock products to each recommended category
    const results = recommended.map((pred) => ({
      ...pred,
      products: (MOCK_PRODUCTS[pred.category] ?? MOCK_PRODUCTS.electronics).slice(0, 4),
    }));

    return NextResponse.json({
      recommendations: results,
      ai_powered: aiPowered,
      user_context: {
        total_orders: meta.numberOfPurchases,
        top_categories: meta.topCategories,
        fav_categories: meta.favCategories,
      },
    });

  } catch (err) {
    console.error("Recommendations error:", err);
    // Ultimate fallback: return top categories without personalization
    const fallback = ["electronics", "sports", "books"].map((cat) => ({
      category: cat,
      purchase_probability: 0.75,
      should_recommend: true,
      reason: "default_fallback",
      products: (MOCK_PRODUCTS[cat] ?? []).slice(0, 4),
    }));
    return NextResponse.json({ recommendations: fallback, ai_powered: false });
  }
}
