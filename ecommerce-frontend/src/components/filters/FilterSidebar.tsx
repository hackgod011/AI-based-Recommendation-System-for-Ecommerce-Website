import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import type { FilterOptions } from '@/types/product';

type FilterSidebarProps = {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  productCount?: number;
};

export default function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  productCount 
}: FilterSidebarProps) {
  
  const priceRanges = [
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    { label: 'Over ₹20,000', min: 20000, max: undefined },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const hasActiveFilters = 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined || 
    filters.minRating !== undefined ||
    filters.onlyBestSeller ||
    filters.onlyAmazonChoice ||
    (filters.sortBy && filters.sortBy !== 'relevance');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 flex-shrink-0 bg-white rounded-lg border border-gray-200 p-4 h-fit sticky top-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-[#007185] hover:text-[#C7511F] flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {productCount !== undefined && (
        <p className="text-sm text-gray-600 mb-4">
          {productCount} results
        </p>
      )}

      {/* Sort By */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3 text-sm">Sort By</h3>
        <select
          value={filters.sortBy || 'relevance'}
          onChange={(e) => onFilterChange({ 
            ...filters, 
            sortBy: e.target.value as FilterOptions['sortBy']
          })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007185]"
        >
          <option value="relevance">Relevance</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => {
            const isSelected = 
              filters.minPrice === range.min && 
              (filters.maxPrice === range.max || (!range.max && !filters.maxPrice));
            
            return (
              <label
                key={index}
                className="flex items-center gap-2 cursor-pointer hover:text-[#007185] transition-colors"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isSelected}
                  onChange={() => onFilterChange({
                    ...filters,
                    minPrice: range.min,
                    maxPrice: range.max
                  })}
                  className="w-4 h-4 text-[#007185] focus:ring-[#007185]"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            );
          })}
        </div>

        {/* Custom Price Range */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-600 mb-2">Custom Range</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#007185]"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#007185]"
            />
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold mb-3 text-sm">Customer Rating</h3>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer hover:text-[#007185] transition-colors"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => onFilterChange({
                  ...filters,
                  minRating: rating
                })}
                className="w-4 h-4 text-[#007185] focus:ring-[#007185]"
              />
              <div className="flex items-center gap-1 text-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating 
                          ? 'fill-orange-400 text-orange-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </div>
            </label>
          ))}
        </div>
        {filters.minRating && (
          <button
            onClick={() => onFilterChange({ ...filters, minRating: undefined })}
            className="text-xs text-[#007185] hover:text-[#C7511F] mt-2"
          >
            Clear rating filter
          </button>
        )}
      </div>

      {/* Special Offers */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-sm">Special Offers</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185] transition-colors">
            <input
              type="checkbox"
              checked={filters.onlyBestSeller || false}
              onChange={(e) => onFilterChange({
                ...filters,
                onlyBestSeller: e.target.checked
              })}
              className="w-4 h-4 text-[#007185] focus:ring-[#007185] rounded"
            />
            <span className="text-sm">Best Seller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185] transition-colors">
            <input
              type="checkbox"
              checked={filters.onlyAmazonChoice || false}
              onChange={(e) => onFilterChange({
                ...filters,
                onlyAmazonChoice: e.target.checked
              })}
              className="w-4 h-4 text-[#007185] focus:ring-[#007185] rounded"
            />
            <span className="text-sm">Amazon's Choice</span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}