import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/navbar/Navbar';
import MainLayout from './layouts/MainLayout';
import HomePage from './components/pages/HomePage';
import CategoryPage from './components/pages/CategoryPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import { ToastProvider } from './components/ui/ToastNotification';
import { CartProvider } from './context/CartContext';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              {/* Navbar is always visible */}
              <Navbar />
              
              {/* Main content area with routes */}
              <MainLayout>
                <Routes>
                  {/* Home Page */}
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Category Pages */}
                  <Route path="/category/:category" element={<CategoryPage />} />
                  
                  {/* Product Detail Page */}
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  
                  {/* Search Results Page */}
                  <Route path="/search" element={<SearchResultsPage />} />
                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </MainLayout>
            </div>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
      
      {/* React Query Devtools (only in development) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Simple 404 Page
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <a
          href="/"
          className="bg-[#ffd814] hover:bg-[#f7ca00] text-black px-6 py-3 rounded-full font-medium transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}

export default App;