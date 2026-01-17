import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteSearch } from '@/hooks/useProducts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FilterOptions } from '@/types/product';
import ProductCard from '@/components/carousels/ProductCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Search, AlertCircle } from 'lucide-react';

export default function SearchResultsPage() {
 const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'relevance'
  });

  // Fetch search results with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteSearch(query, filters);

  // Memoize the callback
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Infinite scroll trigger
  const { targetRef } = useInfiniteScroll(loadMore);

  // Flatten all pages into single array
  const allProducts = data?.pages.flat() || [];

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({ sortBy: 'relevance' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <a href="/" className="hover:text-[#007185]">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Search Results</span>
        </div>

        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Search results for "{query}"
          </h1>
          {!isLoading && allProducts.length > 0 && (
            <p className="text-gray-600">
              {allProducts.length} results found
            </p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            productCount={allProducts.length}
          />

          {/* Search Results Grid */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Loading Results
                </h3>
                <p className="text-red-700 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load search results'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results */}
            {!isLoading && !isError && (
              <>
                {allProducts.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      We couldn't find any products matching "{query}"
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Try:</p>
                      <ul className="list-disc list-inside">
                        <li>Checking your spelling</li>
                        <li>Using more general keywords</li>
                        <li>Using fewer keywords</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="mt-6 text-[#007185] hover:text-[#C7511F] font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          title={product.title}
                          price={product.price}
                          image={product.image}
                          onClick={() => {
                            window.location.href = `/product/${product.id}`;
                          }}
                        />
                      ))}
                    </div>

                    {/* Loading More Indicator */}
                    {isFetchingNextPage && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <ProductCardSkeleton key={`loading-${i}`} />
                        ))}
                      </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    {hasNextPage && (
                      <div ref={targetRef} className="h-20 flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Loading more...</div>
                      </div>
                    )}

                    {/* End Message */}
                    {!hasNextPage && allProducts.length > 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>You've viewed all search results</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}