import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';

export default function CartIcon() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <>
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="relative hover:text-amber-400 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}