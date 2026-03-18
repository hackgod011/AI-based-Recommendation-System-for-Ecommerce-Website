import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/carousels/ProductCard';
import Footer from '@/components/footer/Footer';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { recommendedProducts } from '@/data/recommendations';
import { furnitureCategories } from '@/data/categories';
import { useAuth } from '@/context/AuthContext';

// ─── Category showcase data ───────────────────────────────────────────────────

const CATEGORY_GRID = [
  {
    slug: 'electronics',
    label: 'Electronics',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    slug: 'fashion',
    label: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    span: '',
  },
  {
    slug: 'furniture',
    label: 'Furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    span: '',
  },
  {
    slug: 'sports',
    label: 'Sports',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    span: '',
  },
  {
    slug: 'home-decor',
    label: 'Home Décor',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    span: '',
  },
];

const PROMO_BANNERS = [
  {
    slug: 'electronics',
    label: 'Electronics Sale',
    sub: 'Up to 70% off on latest gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    bg: 'bg-neutral-900',
  },
  {
    slug: 'fashion',
    label: 'New Season',
    sub: 'Trending styles arriving weekly',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    bg: 'bg-teal-900',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          {action} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative h-[420px] sm:h-[520px] bg-neutral-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-6 max-w-[1280px] mx-auto">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
            AI-Powered Recommendations
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight max-w-xl">
            Shop smarter, <br />not harder.
          </h1>
          <p className="mt-3 text-white/70 text-base max-w-md">
            Millions of products curated for you by our AI engine.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => navigate('/category/electronics')}
              className="h-10 px-5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Shop Electronics
            </button>
            <button
              onClick={() => navigate('/category/fashion')}
              className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
              Explore Fashion
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-14">

        {/* ── Category grid ── */}
        <section>
          <SectionHeader title="Shop by Category" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORY_GRID.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className={`group relative rounded-xl overflow-hidden aspect-[4/3] ${cat.span}`}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-sm font-semibold">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── AI Recommended ── */}
        {user && (
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-500" />
                Recommended for you
              </h2>
              <button
                onClick={() => navigate('/profile?tab=recommendations')}
                className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                See all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : recommendedProducts.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      image={item.image}
                      title={item.title}
                      price={item.price}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* ── Promo banners ── */}
        <section className="grid sm:grid-cols-2 gap-4">
          {PROMO_BANNERS.map((b) => (
            <button
              key={b.slug}
              onClick={() => navigate(`/category/${b.slug}`)}
              className={`group relative h-44 rounded-xl overflow-hidden text-left ${b.bg}`}
            >
              <img
                src={b.image}
                alt={b.label}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
              />
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <p className="text-white text-xl font-semibold">{b.label}</p>
                <p className="text-white/70 text-sm mt-1">{b.sub}</p>
                <span className="flex items-center gap-1 text-teal-400 text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                  Shop now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </section>

        {/* ── Furniture spotlight ── */}
        <section>
          <SectionHeader
            title="Up to 60% off — Furniture"
            action="See all"
            onAction={() => navigate('/category/furniture')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {furnitureCategories.slice(0, 4).map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(`/category/${item.category}`)}
                className="group text-left"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/300';
                    }}
                  />
                </div>
                <p className="text-sm font-medium text-neutral-800">{item.title}</p>
                <p className="text-xs text-teal-600 mt-0.5">Explore →</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Trending products ── */}
        <section>
          <SectionHeader
            title="Trending now"
            action="See all"
            onAction={() => navigate('/category/electronics')}
          />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : recommendedProducts.slice(0, 8).map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    price={item.price}
                  />
                ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
