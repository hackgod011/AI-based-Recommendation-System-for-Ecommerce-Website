"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Clock, X, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Product {
  asin: string;
  product_title: string;
  product_photo: string;
  product_price?: string;
  product_star_rating?: string;
  product_num_ratings?: string;
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // Cache to store previous search results
  const cacheRef = useRef<Map<string, Product[]>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Recent searches (stored in localStorage in real app)
  const [recentSearches] = useState<string[]>([
    "Wireless Headphones",
    "Smart Watch",
    "Laptop"
  ]);
  
  const [trendingSearches] = useState<string[]>([
    "Gaming Mouse",
    "Phone Cases",
    "Power Banks"
  ]);

  /* =========================
     FETCH SEARCH RESULTS WITH CACHING
  ========================== */
  async function fetchResults(search: string) {
    // Check cache first
    const cached = cacheRef.current.get(search.toLowerCase());
    if (cached) {
      setResults(cached);
      setIsOpen(true);
      setActiveIndex(-1);
      return;
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      const products = data.products || [];
      
      // Cache the results
      cacheRef.current.set(search.toLowerCase(), products);
      
      setResults(products);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     DEBOUNCE INPUT
  ========================== */
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Show loading immediately
    setLoading(true);

    debounceRef.current = setTimeout(() => {
      fetchResults(query.trim());
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  /* =========================
     KEYBOARD NAVIGATION
  ========================== */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectItem(results[activeIndex]);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  /* =========================
     SELECT ITEM
  ========================== */
  function selectItem(item: Product) {
    console.log("Selected product:", item);
    // Navigate to product detail page
    navigate(`/product/${item.asin}`);
    setQuery(item.product_title);
    setIsOpen(false);
  }

  /* =========================
     SELECT SUGGESTION
  ========================== */
  function selectSuggestion(suggestion: string) {
    setQuery(suggestion);
    fetchResults(suggestion);
  }

  /* =========================
     CLEAR SEARCH
  ========================== */
  function clearSearch() {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  /* =========================
     HIGHLIGHT MATCH - FIXED
  ========================== */
  function highlight(text: string, q: string) {
    // Safety check for undefined/null text
    if (!text || typeof text !== 'string') return text || '';
    if (!q || !q.trim()) return text;
    
    try {
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
      const parts = text.split(regex);
      
      return parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="font-semibold text-amber-400">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch (error) {
      console.error('Highlight error:', error);
      return text;
    }
  }

  // Add search submit handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  // Format price: Convert USD to INR and format with commas
  function formatPrice(priceStr: string): string {
    if (!priceStr) return '0';
    
    const USD_TO_INR = 83;
    // Check if price contains $ or USD
    const isUSD = priceStr.includes('$') || priceStr.toLowerCase().includes('usd');
    let price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
    
    if (isUSD && price > 0) {
      price = Math.round(price * USD_TO_INR);
    } else if (price > 0) {
      // If already a number string, parse it
      price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
    }
    
    return price.toLocaleString('en-IN');
  }

  return (
    <div className="relative w-full">
      {/* SEARCH INPUT */}
      <form onSubmit={handleSearch}>
      <div className="flex items-center bg-white rounded-md overflow-hidden shadow-sm">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search Amazon products..."
          className="flex-1 px-3 py-2.5 text-sm text-black outline-none"
        />

        {/* Loading Spinner or Clear Button */}
        {loading ? (
          <Loader2 className="w-5 h-5 text-gray-400 mr-3 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={clearSearch}
            className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        ) : null}

        <button type="submit" className="bg-amber-400 px-5 py-2.5 hover:bg-amber-500 transition-colors">
          <Search className="w-5 h-5 text-gray-900" />
        </button>
      </div>
      </form>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-[9999] w-full bg-white mt-2 rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Show suggestions when no query */}
            {!query && (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onMouseDown={() => selectSuggestion(search)}
                          className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          {search}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {trendingSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Trending Searches
                    </div>
                    <div className="space-y-1">
                      {trendingSearches.map((search, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onMouseDown={() => selectSuggestion(search)}
                          className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          {search}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show results when searching */}
            {query && results.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto">
                {results.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.asin}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onMouseDown={() => selectItem(item)}
                    className={`flex gap-3 p-3 cursor-pointer transition-colors ${
                      index === activeIndex
                        ? "bg-amber-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 bg-white border border-gray-200 rounded overflow-hidden">
                      <img
                        src={item.product_photo}
                        alt={item.product_title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                        {highlight(item.product_title, query)}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.product_price && (
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{formatPrice(item.product_price)}
                          </span>
                        )}
                        {item.product_star_rating && (
                          <span className="text-xs text-gray-500">
                            ⭐ {item.product_star_rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && !loading && results.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                No products found for "{query}"
              </div>
            )}

            {/* Loading State */}
            {loading && query && (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}