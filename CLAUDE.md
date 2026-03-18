# ecommerce-ai — CLAUDE.md

## Project Overview
AI-based Recommendation System for an E-commerce Website. Amazon-like UI with product browsing, cart, auth, and an upcoming AI recommendation service.

## Monorepo Structure
```
ecommerce-ai/
├── ecommerce-frontend/   # React + Vite + TypeScript (port 5173)
├── backend/              # Next.js 16 API routes only (port 3000)
└── ai-service/           # Python AI/ML service (to be built)
```

## Dev Commands

### Frontend (ecommerce-frontend/)
```bash
cd ecommerce-frontend
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # tsc + vite build
npm run lint       # eslint
```

### Backend (backend/)
```bash
cd backend
npm run dev        # Next.js dev server → http://localhost:3000
npm run build      # next build
npm run lint       # eslint
```

**Important**: Frontend proxies `/api/*` → `http://localhost:3000` via Vite proxy config. Both services must run simultaneously during development.

## Frontend Stack
- **React 19** + **TypeScript** + **Vite 7**
- **TailwindCSS 4** (via `@tailwindcss/vite` plugin — no config file needed)
- **React Router DOM 7** for routing
- **TanStack React Query** for server state / data fetching
- **Redux Toolkit** + **Zustand** for client state
- **Supabase** (`@supabase/supabase-js`) for auth and database
- **Radix UI** primitives + **shadcn-style** components in `src/components/ui/`
- **Framer Motion** for animations
- **i18next** / **react-i18next** with EN and HI (Hindi) translations in `src/i18n/`
- **Axios** for HTTP calls
- **react-hot-toast** for notifications
- Path alias: `@` → `src/`

## Backend Stack
- **Next.js 16** (App Router, API routes only — no UI pages used)
- **Supabase** for database
- **RapidAPI** (Real-time Amazon Data API) for live product data
- In-memory Map cache (5 min TTL, max 100 entries)

## Backend API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products?category=&page=` | Products by category (RapidAPI) |
| GET | `/api/product/[productId]` | Single product detail |
| GET | `/api/search?q=` | Search products (currently mock data) |
| GET | `/api/reviews` | Product reviews |

## Key Architecture Patterns

### Product Data Flow
- Backend fetches from RapidAPI → caches in memory → returns to frontend
- Search endpoint currently uses **mock data** (RapidAPI code is commented out)
- Product IDs are Amazon ASINs

### Price Handling
- Backend returns USD prices as strings (e.g., `"$29.99"`)
- Frontend converts USD → INR using fixed rate `USD_TO_INR = 83` in `cleanProduct()` ([src/types/product.ts](ecommerce-frontend/src/types/product.ts))
- Displayed prices are in INR (₹)

### Categories
`electronics`, `furniture`, `fashion`, `home-decor`, `kitchen`, `books`, `sports`, `toys`

### Auth (Supabase)
- Email/password via `supabase.auth`
- `AuthContext` ([src/context/AuthContext.tsx](ecommerce-frontend/src/context/AuthContext.tsx)) wraps the entire app
- On sign-up: creates auth user → inserts into `users` table → creates `user_preferences` row

### Supabase Tables
`users`, `user_preferences`, `cart_items`, `orders`, `order_items`, `addresses`, `payment_methods`, `wishlist`

## Frontend Directory Structure
```
src/
├── api/           # API call functions
├── components/
│   ├── carousels/ # HeroCarousel, HorizontalScroller, ProductCard
│   ├── cart/      # CartDrawer
│   ├── filters/   # FilterSidebar, FilterChip
│   ├── footer/    # Footer
│   ├── grids/     # FeaturedGrid, Grid, GridCard
│   ├── modals/    # QuickViewModal
│   ├── navbar/    # Navbar, SearchBar, CartIcon, UserMenu, LanguageSwitcher
│   ├── pages/     # HomePage, CategoryPage, ProductDetailPage, SearchResultsPage, etc.
│   ├── sections/  # Section
│   └── ui/        # Radix/shadcn primitives + ToastNotification, LoadingSkeleton
├── context/       # AuthContext, CartContext
├── data/          # Static data: categories, featured, heroSlides, recommendations
├── hooks/         # useProducts, useInfiniteScroll, useWishlist
├── i18n/          # en.json, hi.json, index.ts
├── layouts/       # MainLayout
├── lib/           # supabase.ts, utils.ts
├── services/      # searchService.ts
├── store/         # authSlice.ts, cartSlice.ts (Redux)
└── types/         # product.ts (Product, CleanProduct, FilterOptions, cleanProduct())
```

## Environment Variables

### Frontend (`ecommerce-frontend/.env.local`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Backend (`backend/.env.local`)
```
RAPIDAPI_KEY=
RAPIDAPI_HOST=real-time-amazon-data.p.rapidapi.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

## Notes
- The `ai-service/` directory is currently empty — it is the planned Python ML service for recommendations
- TailwindCSS v4 does NOT use `tailwind.config.js`; configuration is in CSS via `@theme`
- Frontend brand color (Amazon-like yellow): `#ffd814` / hover `#f7ca00`
