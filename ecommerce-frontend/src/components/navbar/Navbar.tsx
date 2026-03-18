import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Clock, Tag } from 'lucide-react';
import UserMenu from './UserMenu';
import CartIcon from './CartIcon';

const CATEGORIES = [
  { label: 'Electronics', slug: 'electronics' },
  { label: 'Fashion', slug: 'fashion' },
  { label: 'Furniture', slug: 'furniture' },
  { label: 'Home Décor', slug: 'home-decor' },
  { label: 'Kitchen', slug: 'kitchen' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Books', slug: 'books' },
  { label: 'Toys', slug: 'toys' },
];

const POPULAR_SEARCHES = [
  'headphones', 'laptop', 'smartphone', 'running shoes',
  'yoga mat', 'coffee maker', 'office chair', 'watch',
];

const RECENT_KEY = 'shopai_recent_searches';

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
  catch { return []; }
}

function saveSearch(q: string) {
  const prev = getRecentSearches().filter((s) => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 5)));
}

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent searches whenever dropdown opens
  useEffect(() => {
    if (focused) setRecentSearches(getRecentSearches());
  }, [focused]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCategories = query
    ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredPopular = query
    ? POPULAR_SEARCHES.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_SEARCHES.slice(0, 4);

  const showDropdown = focused && (query.length > 0 || recentSearches.length > 0);

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveSearch(trimmed);
    setFocused(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const goToCategory = (slug: string) => {
    setFocused(false);
    setQuery('');
    navigate(`/category/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      {/* Top bar */}
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0 text-xl font-semibold tracking-tight text-black">
          Shop<span className="text-teal-500">AI</span>
        </Link>

        {/* Search with autocomplete */}
        <div ref={wrapperRef} className="flex-1 max-w-xl relative">
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 border rounded-lg px-3 h-9 transition-colors ${
              focused ? 'border-neutral-900 bg-white' : 'border-neutral-200 bg-neutral-50'
            } ${showDropdown ? 'rounded-b-none' : ''}`}
          >
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-neutral-900 border-t-0 rounded-b-lg shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">

              {/* Recent searches (shown when query empty) */}
              {!query && recentSearches.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    Recent
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => doSearch(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
                    >
                      <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      {s}
                    </button>
                  ))}
                </>
              )}

              {/* Matching categories */}
              {filteredCategories.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    Categories
                  </div>
                  {filteredCategories.map((c) => (
                    <button
                      key={c.slug}
                      onMouseDown={() => goToCategory(c.slug)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
                    >
                      <Tag className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                      {c.label}
                    </button>
                  ))}
                </>
              )}

              {/* Popular / matching search suggestions */}
              {filteredPopular.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    {query ? 'Suggestions' : 'Popular'}
                  </div>
                  {filteredPopular.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => doSearch(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
                    >
                      <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      {s}
                    </button>
                  ))}
                </>
              )}

              {/* Search for exact query */}
              {query.trim() && (
                <button
                  onMouseDown={() => doSearch(query)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 border-t border-neutral-100 text-left"
                >
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  Search for &ldquo;{query}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 ml-auto shrink-0">
          <UserMenu />
          <CartIcon />
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-neutral-100 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide h-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="shrink-0 px-3 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
