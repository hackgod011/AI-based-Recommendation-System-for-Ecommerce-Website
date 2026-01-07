import './App.css'
import Navbar from './components/navbar/Navbar'
import MainLayout from './layouts/MainLayout'
import { ToastProvider } from './components/ui/ToastNotification'
import { CartProvider } from './context/CartContext'
import HomePage from './components/pages/HomePage'
// Import ProductDetailPage when you need it
// import ProductDetailPage from './components/pages/ProductDetailPage'

function App() {
  return (
    <>
      <ToastProvider>
      <CartProvider>
      <Navbar />
      <MainLayout>
        <HomePage />
        
        {/* Later you'll use React Router to switch between pages */}
        {/* Example with router:
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
        */}
      </MainLayout>
      </CartProvider>
      </ToastProvider>
    </>
  )
}

export default App