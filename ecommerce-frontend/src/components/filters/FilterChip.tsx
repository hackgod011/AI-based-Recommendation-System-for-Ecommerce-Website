import { X } from 'lucide-react';
import { motion } from 'framer-motion';

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

/**
 * FilterChip - Shows active filters as removable chips
 * Optional component to show which filters are currently applied
 * 
 * Usage:
 * <FilterChip label="Price: ₹1000-₹5000" onRemove={() => clearPriceFilter()} />
 */
export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/**
 * FilterChips Container - Shows all active filters
 * 
 * Usage in CategoryPage:
 * 
 * import FilterChip from '@/components/filters/FilterChip';
 * import { AnimatePresence } from 'framer-motion';
 * 
 * <div className="flex flex-wrap gap-2 mb-4">
 *   <AnimatePresence>
 *     {filters.minPrice && (
 *       <FilterChip
 *         key="price"
 *         label={`Price: ₹${filters.minPrice}-₹${filters.maxPrice || '∞'}`}
 *         onRemove={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
 *       />
 *     )}
 *     {filters.minRating && (
 *       <FilterChip
 *         key="rating"
 *         label={`${filters.minRating}+ stars`}
 *         onRemove={() => setFilters({ ...filters, minRating: undefined })}
 *       />
 *     )}
 *     {filters.onlyBestSeller && (
 *       <FilterChip
 *         key="bestseller"
 *         label="Best Seller"
 *         onRemove={() => setFilters({ ...filters, onlyBestSeller: false })}
 *       />
 *     )}
 *   </AnimatePresence>
 * </div>
 */