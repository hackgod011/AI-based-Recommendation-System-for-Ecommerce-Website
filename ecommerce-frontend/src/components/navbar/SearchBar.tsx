"use client";

import { useEffect, useRef, useState } from "react";

interface Product {
  asin: string;
  title: string;
  image: string;
  price?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* =========================
     FETCH SEARCH RESULTS
  ========================== */
  async function fetchResults(search: string) {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const res = await fetch(`/api/search?q=${search}`, {
        signal: controller.signal,
      });

      const data = await res.json();
      setResults(data.products || []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error(err);
      setResults([]);
    }
    finally {
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
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(query.trim());
    }, 400);

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
      setActiveIndex((prev) => (prev + 1) % results.length);
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev <= 0 ? results.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      selectItem(results[activeIndex]);
    }
  }

  /* =========================
     SELECT ITEM
  ========================== */
  function selectItem(item: Product) {
    setQuery(item.title);
    setIsOpen(false);
    setResults([]);
  }

  /* =========================
     HIGHLIGHT MATCH
  ========================== */
  function highlight(text: string, q: string) {
    const regex = new RegExp(`(${q})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="font-semibold text-amber-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return (
    <div className="relative w-full max-w-xl">
      {/* SEARCH INPUT */}
      <div className="flex items-center bg-white rounded-md overflow-hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search Amazon products..."
          className="flex-1 px-3 py-2 text-sm text-black outline-none"
        />
        <button className="bg-amber-400 px-4 py-2 hover:bg-amber-500">
          🔍
        </button>
      </div>

      {/* DROPDOWN */}
      {isOpen && !loading && results.length > 0 && (
        <div className="absolute top-full left-0 z-[9999] w-full bg-neutral-900 mt-1 rounded-md shadow-xl">
          {results.slice(0, 5).map((item, index) => (
            <div
              key={item.asin}
              onMouseDown={() => selectItem(item)}
              className={`flex gap-2 p-2 cursor-pointer ${
                index === activeIndex
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-800"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-10 h-10 object-contain"
              />
              <span className="text-sm text-white">
                {highlight(item.title, query)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
