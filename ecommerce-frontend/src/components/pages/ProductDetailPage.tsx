import { useState } from 'react';
import { Star, ShoppingCart, Heart, Share2, MapPin, Check } from 'lucide-react';

// This would typically come from your API/props
type ProductDetailProps = {
  id: string;
  title: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  features: string[];
  brand?: string;
  category?: string;
};

export default function ProductDetailPage({
  id = 'prod-123',
  title = 'Premium Wireless Headphones - Noise Cancelling',
  images = ['/images/products/headphone-1.jpg', '/images/products/headphone-2.jpg'],
  price = 4999,
  originalPrice = 7999,
  rating = 4.5,
  reviewCount = 2847,
  inStock = true,
  description = 'Experience premium sound quality with our wireless headphones featuring advanced noise cancellation technology.',
  features = [
    'Active Noise Cancellation',
    '30-hour battery life',
    'Premium comfort fit',
    'Bluetooth 5.0 connectivity',
    'Built-in microphone for calls'
  ],
  brand = 'TechAudio',
  category = 'Electronics'
}: Partial<ProductDetailProps>) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <a href="/" className="hover:text-orange-600">Home</a>
          <span className="mx-2">/</span>
          <a href={`/category/${category?.toLowerCase()}`} className="hover:text-orange-600">{category}</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-1">
            {/* Main Image */}
            <div className="bg-white border border-gray-200 rounded-sm p-4 mb-4">
              <img
                src={images[selectedImage]}
                alt={title}
                className="w-full h-[400px] object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 border-2 rounded-sm overflow-hidden ${
                    selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${title} view ${index + 1}`}
                    className="w-16 h-16 object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="lg:col-span-1">
            {/* Brand */}
            {brand && (
              <a href="#" className="text-sm text-[#007185] hover:text-orange-600 hover:underline">
                Visit the {brand} Store
              </a>
            )}

            {/* Title */}
            <h1 className="text-2xl font-normal text-gray-900 mt-2 mb-2">
              {title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              {renderStars(rating)}
              <span className="text-sm text-[#007185] hover:text-orange-600">
                {reviewCount.toLocaleString()} ratings
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-600">M.R.P.:</span>
                {originalPrice && (
                  <span className="text-sm text-gray-600 line-through">₹{originalPrice}</span>
                )}
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xs text-red-700">-{discount}%</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs align-super text-gray-700">₹</span>
                  <span className="text-3xl font-normal text-gray-900">{price}</span>
                </div>
              </div>

              {/* Tax info */}
              <p className="text-xs text-gray-600 mb-4">Inclusive of all taxes</p>

              {/* Stock Status */}
              <div className="mb-4">
                {inStock ? (
                  <span className="text-green-700 text-lg font-medium">In Stock</span>
                ) : (
                  <span className="text-red-700 text-lg font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h2 className="font-bold text-lg mb-3">About this item</h2>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-bold text-lg mb-2">Product Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-sm p-4 sticky top-4">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xs align-super text-gray-700">₹</span>
                <span className="text-3xl font-normal text-gray-900">{price}</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">Inclusive of all taxes</p>

              {/* Delivery Info */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Free Delivery</p>
                    <p className="text-xs text-gray-600">Expected delivery by Jan 10</p>
                  </div>
                </div>
              </div>

              {/* Stock */}
              {inStock ? (
                <p className="text-green-700 text-lg mb-4">In Stock</p>
              ) : (
                <p className="text-red-700 text-lg mb-4">Currently unavailable</p>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!inStock}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  disabled={!inStock}
                  className="w-full bg-[#ffd814] hover:bg-[#f7ca00] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-2 px-4 rounded-full text-sm font-medium transition-colors"
                >
                  Add to Cart
                </button>
                
                <button
                  disabled={!inStock}
                  className="w-full bg-[#ffa41c] hover:bg-[#fa8900] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-2 px-4 rounded-full text-sm font-medium transition-colors"
                >
                  Buy Now
                </button>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Wishlist</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Seller Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                <p>Ships from: ShopAI</p>
                <p>Sold by: ShopAI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}