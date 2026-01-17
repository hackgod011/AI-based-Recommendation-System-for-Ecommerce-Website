import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchProductsByCategory, searchProducts, fetchProductById } from '@/api/products';
import type { FilterOptions } from '@/types/product';

/**
 * Hook to fetch products by category (single page)
 * Use this when you don't need infinite scroll
 * 
 * @example
 * const { data, isLoading, isError } = useProducts('furniture', { minPrice: 1000 });
 */
export function useProducts(category: string, filters?: FilterOptions) {
  return useQuery({
    queryKey: ['products', category, filters],
    queryFn: () => fetchProductsByCategory(category, 1, filters),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (previously cacheTime)
  });
}

/**
 * Hook for infinite scroll products by category
 * Use this for CategoryPage with infinite scroll
 * 
 * @example
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
 *   useInfiniteProducts('furniture', filters);
 */
export function useInfiniteProducts(category: string, filters?: FilterOptions) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', category, filters],
    queryFn: ({ pageParam = 1 }) => 
      fetchProductsByCategory(category, pageParam, filters),
    getNextPageParam: (lastPage, allPages) => {
      // If we got products, there might be more on next page
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search products (single page)
 * 
 * @example
 * const { data, isLoading } = useSearchProducts('laptop', filters);
 */
export function useSearchProducts(query: string, filters?: FilterOptions) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => searchProducts(query, 1, filters),
    enabled: query.length >= 2, // Only search if query is 2+ characters
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite search results
 * Use this for SearchResultsPage with infinite scroll
 * 
 * @example
 * const { data, fetchNextPage, hasNextPage } = useInfiniteSearch('laptop', filters);
 */
export function useInfiniteSearch(query: string, filters?: FilterOptions) {
  return useInfiniteQuery({
    queryKey: ['search-infinite', query, filters],
    queryFn: ({ pageParam = 1 }) => searchProducts(query, pageParam, filters),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: query.length >= 2, // Only search if query is 2+ characters
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch single product by ID
 * Use this for ProductDetailPage
 * 
 * @example
 * const { data: product, isLoading } = useProduct('B08XYZ123');
 */
export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId, // Only fetch if productId exists
    staleTime: 10 * 60 * 1000, // Individual products stay fresh longer (10 minutes)
  });
}