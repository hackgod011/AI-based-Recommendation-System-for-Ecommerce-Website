import { motion } from 'framer-motion';

export function ProductCardSkeleton() {
  return (
    <div className="min-w-[220px] max-w-[220px] flex-shrink-0">
      <div className="bg-white rounded-sm overflow-hidden border border-gray-200">
        {/* Image Skeleton */}
        <motion.div 
          className="w-full aspect-square bg-gray-200"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        <div className="p-4 space-y-3">
          {/* Title Lines */}
          <div className="space-y-2">
            <motion.div 
              className="h-4 bg-gray-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div 
              className="h-4 bg-gray-200 rounded w-3/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
          
          {/* Price */}
          <motion.div 
            className="h-8 bg-gray-200 rounded w-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <div>
      <div className="bg-white rounded-sm overflow-hidden">
        <motion.div 
          className="w-full h-[240px] bg-gray-200"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="p-3">
          <motion.div 
            className="h-4 bg-gray-200 rounded w-3/4 mx-auto"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <motion.div 
      className="w-full h-[400px] bg-gray-300"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}