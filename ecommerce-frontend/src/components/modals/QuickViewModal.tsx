import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart } from 'lucide-react';

type QuickViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    image: string;
    title: string;
    price: number;
    description: string;
  };
};

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Image */}
                <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                  <img src={product.image} alt={product.title} className="max-h-96 object-contain" />
                </div>

                {/* Details */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">{product.title}</h2>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xs align-super">₹</span>
                    <span className="text-3xl font-bold">{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#ffd814] hover:bg-[#f7ca00] py-3 rounded-full font-medium flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button className="bg-white border-2 border-gray-300 hover:border-gray-400 p-3 rounded-full">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}