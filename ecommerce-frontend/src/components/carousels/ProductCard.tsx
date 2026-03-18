import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/ToastNotification';
import { useWishlist } from '@/context/WishlistContext';
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
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(id);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (category && !onClick) {
      navigate(`/category/${category}`);
    } else {
      navigate(`/product/${id}`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(id);
      showToast('warning', 'Removed from wishlist');
    } else {
      addToWishlist({ product_id: id, title, price, image });
      showToast('success', 'Added to wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ product_id: id, title, price, image });
    showToast('success', 'Added to cart');
  };

  return (
    <div
      className="group cursor-pointer min-w-[200px] max-w-[200px] flex-shrink-0"
      onClick={handleClick}
    >
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          <img
            src={image || 'https://via.placeholder.com/200'}
            alt={title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
            }}
          />

          {/* Wishlist button — always visible on mobile, hover on desktop */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm border border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                wishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-500'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-xs text-neutral-700 line-clamp-2 leading-snug min-h-[2.5rem]">
            {title}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-neutral-900">
              ₹{price.toLocaleString('en-IN')}
            </span>

            <button
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
            >
              <ShoppingCart className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
