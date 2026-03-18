import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/navbar/Navbar';
import MainLayout from './layouts/MainLayout';
import HomePage from './components/pages/HomePage';
import CategoryPage from './components/pages/CategoryPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import SignInPage from './components/pages/SignInPage';
import SignUpPage from './components/pages/SignUpPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import OrdersPage from './components/pages/OrdersPage';
import OrderDetailPage from './components/pages/OrderDetailPage';
import ProfilePage from './components/pages/ProfilePage';
import { ToastProvider } from './components/ui/ToastNotification';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Auth gate — redirects to /signin when not authenticated ─────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-teal-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

const AUTH_PATHS = ['/signin', '/signup'];

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public auth pages — no Navbar wrapper needed */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected main pages — require sign-in */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout><HomePage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/category/:category"
          element={
            <RequireAuth>
              <MainLayout><CategoryPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/product/:productId"
          element={
            <RequireAuth>
              <MainLayout><ProductDetailPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <MainLayout><SearchResultsPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <MainLayout><CartPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <MainLayout><CheckoutPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <MainLayout><OrdersPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <RequireAuth>
              <MainLayout><OrderDetailPage /></MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <MainLayout><ProfilePage /></MainLayout>
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-7xl font-semibold text-neutral-200 mb-3">404</p>
        <p className="text-lg font-medium text-neutral-700 mb-1">Page not found</p>
        <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex items-center h-10 px-5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default App;
