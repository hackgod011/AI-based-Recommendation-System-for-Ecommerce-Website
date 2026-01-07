import { useState, useEffect } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ProductCard from '@/components/carousels/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CategoryPage({ category }: { category: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    if (!hasMore) return;
    
    // Simulate API call
    setTimeout(() => {
      const newProducts = Array.from({ length: 10 }, (_, i) => ({
        id: `${page}-${i}`,
        title: `Product ${page * 10 + i}`,
        price: Math.floor(Math.random() * 5000) + 1000,
        image: `/images/products/product-${i}.jpg`
      }));
      
      setProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
      
      if (page >= 5) setHasMore(false); // Stop after 5 pages
    }, 1000);
  };

  const { targetRef, isFetching } = useInfiniteScroll(loadMore);

  useEffect(() => {
    loadMore(); // Initial load
  }, []);

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{category}</h1>
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
        
        {/* Loading Skeletons */}
        {isFetching && Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={targetRef} className="h-10" />}
      
      {/* End Message */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end
        </div>
      )}
    </div>
  );
}