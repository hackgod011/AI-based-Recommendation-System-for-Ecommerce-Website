import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  ExternalLink,
  Save,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: Record<string, string>;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface UserPreferences {
  categories: string[];
}

type Tab = 'info' | 'orders' | 'wishlist' | 'preferences' | 'addresses' | 'recommendations';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'info', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
  { id: 'orders', label: 'Order History', icon: <Package className="h-4 w-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
  { id: 'recommendations', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings className="h-4 w-4" /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusIcon(status: string) {
  switch (status) {
    case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'shipped': return <Package className="h-4 w-4 text-blue-500" />;
    case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-yellow-500" />;
  }
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function PersonalInfoTab() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { error } = await updateProfile({ full_name: fullName, phone });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p className="py-2 px-3 bg-gray-100 rounded-md text-gray-600 text-sm">{user?.email}</p>
        <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd814]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd814]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-black px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}

function OrdersTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setOrders(data ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <Spinner label="Loading orders…" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-14 w-14 text-gray-300" />}
        title="No orders yet"
        subtitle="Your order history will appear here."
        actionLabel="Start Shopping"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => navigate(`/orders/${order.id}`)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="font-medium text-sm text-gray-900">
                #{(order.order_number ?? order.id.slice(0, 8)).toUpperCase()}
              </span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="font-medium text-gray-800">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const navigate = useNavigate();
  const { items, removeFromWishlist, loading } = useWishlist();

  if (loading) return <Spinner label="Loading wishlist…" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-14 w-14 text-gray-300" />}
        title="Your wishlist is empty"
        subtitle="Save products you love and find them here."
        actionLabel="Browse Products"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Wishlist <span className="text-gray-400 text-base font-normal">({items.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.product_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
            <div className="relative aspect-square bg-gray-50">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain p-2"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200'; }}
              />
              <button
                onClick={() => removeFromWishlist(item.product_id)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                title="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700 line-clamp-2 mb-1">{item.title}</p>
              <p className="text-sm font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
              <button
                onClick={() => navigate(`/product/${item.product_id}`)}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                <ExternalLink className="h-3 w-3" /> View Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesTab() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>({ categories: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('shopai_recent_searches');
      setRecentSearches(saved ? JSON.parse(saved) : []);
    } catch { /* ignore */ }

    if (!user) return;
    supabase
      .from('user_preferences')
      .select('categories')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setPrefs({ categories: data.categories ?? [] });
        setLoading(false);
      });
  }, [user]);

  if (loading) return <Spinner label="Loading preferences…" />;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">
          This data is used by our AI recommendation engine to personalise your experience.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Favourite Categories</h3>
        {prefs.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {prefs.categories.map((cat) => (
              <span key={cat} className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full capitalize">
                {cat.replace('-', ' ')}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No favourite categories yet. Browse products to build your profile.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
        {recentSearches.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 border border-gray-200 text-gray-700 text-xs rounded-full bg-white">
                <Clock className="h-3 w-3 text-gray-400" /> {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No recent searches recorded.</p>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
        <strong>How recommendations work:</strong> Our AI model uses your browse history,
        wishlist, purchases, and search history to suggest products tailored to you.
        The more you use the app, the better the recommendations become.
      </div>
    </div>
  );
}

// ─── Recommendation types ─────────────────────────────────────────────────────

interface RecommendedProduct {
  asin: string;
  product_title: string;
  product_price?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_photo?: string;
  is_best_seller?: boolean;
}

interface RecommendationGroup {
  category: string;
  purchase_probability: number;
  should_recommend: boolean;
  reason: string;
  products: RecommendedProduct[];
}

interface RecommendationsResponse {
  recommendations: RecommendationGroup[];
  ai_powered: boolean;
  top_category: string;
  user_context: {
    total_orders: number;
    top_categories: string[];
    fav_categories: string[];
  };
}

function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    electronics: 'Electronics',
    furniture: 'Furniture',
    fashion: 'Fashion',
    'home-decor': 'Home Décor',
    kitchen: 'Kitchen & Dining',
    books: 'Books',
    sports: 'Sports & Outdoors',
    toys: 'Toys & Games',
  };
  return map[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function reasonLabel(reason: string): string {
  switch (reason) {
    case 'high_purchase_intent': return 'High interest';
    case 'moderate_purchase_intent': return 'Good match';
    case 'low_purchase_intent': return 'You might like';
    case 'rule_based_fallback': return 'Trending';
    default: return 'Recommended';
  }
}

function RecommendationsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/recommendations?userId=${user.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err.message ?? 'Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner label="Loading recommendations…" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Sparkles className="h-14 w-14 text-gray-300" />
        <p className="font-semibold text-gray-700">Recommendations unavailable</p>
        <p className="text-sm text-gray-400 max-w-xs">{error}</p>
      </div>
    );
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-14 w-14 text-gray-300" />}
        title="No recommendations yet"
        subtitle="Browse and order products to get personalised picks."
        actionLabel="Explore Products"
        onAction={() => navigate('/')}
      />
    );
  }

  const { recommendations, ai_powered, user_context } = data;
  // Only show groups with products and flagged to recommend
  const visibleGroups = recommendations.filter((g) => g.products && g.products.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ffd814]" />
            Picks for You
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Based on {user_context.total_orders} order{user_context.total_orders !== 1 ? 's' : ''} and your browsing history
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            ai_powered
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          {ai_powered ? 'AI-Powered' : 'Personalised for You'}
        </span>
      </div>

      {/* Category groups */}
      {visibleGroups.map((group) => (
        <section key={group.category}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">{categoryLabel(group.category)}</h3>
              <span className="text-xs text-gray-400">
                {reasonLabel(group.reason)} · {Math.round(group.purchase_probability * 100)}% match
              </span>
            </div>
            <button
              onClick={() => navigate(`/category/${group.category}`)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              See all <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {group.products.map((product) => {
              const priceNum = product.product_price
                ? parseFloat(product.product_price.replace(/[^0-9.]/g, ''))
                : null;
              const inrPrice = priceNum ? Math.round(priceNum * 83) : null;
              const rating = product.product_star_rating ? parseFloat(product.product_star_rating) : null;

              return (
                <div
                  key={product.asin}
                  onClick={() => navigate(`/product/${product.asin}`)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.product_photo ? (
                      <img
                        src={product.product_photo}
                        alt={product.product_title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-snug min-h-[2.5rem]">
                      {product.product_title}
                    </p>

                    {inrPrice !== null && (
                      <p className="mt-1.5 text-sm font-bold text-gray-900">
                        ₹{inrPrice.toLocaleString('en-IN')}
                      </p>
                    )}

                    {rating !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-[#ffd814] text-[#ffd814]" />
                        <span className="text-xs text-gray-600">
                          {rating.toFixed(1)}
                          {product.product_num_ratings
                            ? ` (${product.product_num_ratings.toLocaleString()})`
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const EMPTY_ADDRESS_FORM = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
};

function AddressesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    fetchAddresses();
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.postal_code) {
      setFormError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');

    if (form.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }

    const { error } = await supabase.from('addresses').insert([{ ...form, user_id: user.id }]);
    setSaving(false);
    if (error) {
      setFormError(error.message);
    } else {
      setForm({ ...EMPTY_ADDRESS_FORM });
      setShowForm(false);
      fetchAddresses();
    }
  };

  if (loading) return <Spinner label="Loading addresses…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <PlusCircle className="h-4 w-4" /> Add New
          </button>
        )}
      </div>

      {/* Existing addresses */}
      {addresses.length === 0 && !showForm && (
        <EmptyState
          icon={<MapPin className="h-14 w-14 text-gray-300" />}
          title="No saved addresses"
          subtitle="Add a delivery address to speed up checkout."
          actionLabel="Add Address"
          onAction={() => setShowForm(true)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`border rounded-lg p-4 relative ${addr.is_default ? 'border-[#ffd814] bg-yellow-50' : 'border-gray-200 bg-white'}`}>
            {addr.is_default && (
              <span className="absolute top-2 right-2 text-xs font-semibold bg-[#ffd814] text-gray-900 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
            <p className="font-medium text-gray-900 text-sm">{addr.full_name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{addr.phone}</p>
            <p className="text-xs text-gray-600 mt-1">
              {addr.address_line1}
              {addr.address_line2 ? `, ${addr.address_line2}` : ''}
            </p>
            <p className="text-xs text-gray-600">
              {addr.city}, {addr.state} – {addr.postal_code}
            </p>
            <p className="text-xs text-gray-600">{addr.country}</p>
            <div className="flex gap-3 mt-3">
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new address form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-3">
          <h3 className="font-medium text-gray-900 text-sm">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
            <div className="sm:col-span-2">
              <Field label="Address Line 1 *" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address Line 2" value={form.address_line2} onChange={(v) => setForm({ ...form, address_line2: v })} />
            </div>
            <Field label="City *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State *" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <Field label="Postal Code *" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
            <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="accent-[#ffd814]"
            />
            Set as default address
          </label>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-black px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Address'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(''); setForm({ ...EMPTY_ADDRESS_FORM }); }}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared mini-components ───────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd814]"
      />
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd814]" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon}
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
      <button
        onClick={onAction}
        className="mt-2 bg-[#ffd814] hover:bg-[#f7ca00] text-black px-5 py-2 rounded-full text-sm font-medium"
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'info';

  useEffect(() => {
    if (!user) navigate('/signin', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  const renderContent = () => {
    switch (activeTab) {
      case 'info': return <PersonalInfoTab />;
      case 'orders': return <OrdersTab />;
      case 'wishlist': return <WishlistTab />;
      case 'recommendations': return <RecommendationsTab />;
      case 'preferences': return <PreferencesTab />;
      case 'addresses': return <AddressesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.full_name || 'My Account'}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Mobile horizontal tab bar */}
        <div className="flex overflow-x-auto gap-1 mb-4 pb-1 lg:hidden scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#ffd814] text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop 2-col layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-4 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#ffd814] bg-yellow-50 text-gray-900'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white border border-gray-200 rounded-lg p-6 min-h-[500px]">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
