import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteProducts } from '@/hooks/useProducts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FilterOptions } from '@/types/product';
import ProductCard from '@/components/carousels/ProductCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertCircle } from 'lucide-react';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'relevance'
  });

  // Fetch products with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteProducts(category || '', filters);

  // Memoize the callback to prevent re-creating on every render
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

  // Format category name for display
  const categoryTitle = category
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Products';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <a href="/" className="hover:text-teal-600">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{categoryTitle}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {categoryTitle}
        </h1>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            productCount={allProducts.length}
          />

          {/* Products Grid */}
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
                  Error Loading Products
                </h3>
                <p className="text-red-700 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load products'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products */}
            {!isLoading && !isError && (
              <>
                {allProducts.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg mb-2">No products found</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="text-teal-600 hover:text-teal-700 font-medium"
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
                        <p>You've viewed all products in this category</p>
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