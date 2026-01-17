import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/ToastNotification';
import QuickViewModal from '@/components/modals/QuickViewModal';
import { useNavigate } from 'react-router-dom';

type ProductCardProps = {
  id: string;
  image: string;
  title: string;
  price: number;
  category?: string;
  onClick?: () => void;
};

export default function ProductCard({ id, image, title, price, category, onClick }: ProductCardProps) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Handle card click - navigate to product detail OR category page
  const handleClick = () => {
    if (onClick) {
      // If custom onClick is provided, use it
      onClick();
    } else if (category) {
      // If category is provided, navigate to category page
      navigate(`/category/${category}`);
    } else {
      // Default: navigate to product detail page
      navigate(`/product/${id}`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    showToast(
      isWishlisted ? 'warning' : 'success',
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id, title, price, image });
    showToast('success', 'Added to cart!');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <motion.div 
        className="min-w-[220px] max-w-[220px] cursor-pointer group flex-shrink-0"
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
      >
        <div className="bg-white rounded-sm overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 relative">
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
            <motion.button
              onClick={handleWishlist}
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </motion.button>

            <motion.button
              onClick={handleQuickView}
              className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-square bg-white flex items-center justify-center p-6 overflow-hidden">
            <motion.img
              src={image || '/images/products/placeholder.jpg'}
              alt={title}
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/products/placeholder.jpg';
              }}
            />
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-700 line-clamp-2 h-[40px] mb-3">
              {title}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xs align-super text-gray-700">₹</span>
                <span className="text-2xl font-normal text-gray-900">
                  {price.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Quick Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 bg-[#ffd814] hover:bg-[#f7ca00] p-2 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="w-4 h-4 text-gray-900" />
              </motion.button>
            </div>
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={{
          image,
          title,
          price,
          description: 'High-quality product with excellent features and great value for money.'
        }}
      />
    </>
  );
}