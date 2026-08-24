import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { RightSideReviewsDrawer } from './components/common/RightSideReviewsDrawer';
import { Toast } from './components/common/Toast';



import { HomePage } from './pages/HomePage';
import { VeloraPage } from './pages/VeloraPage';
import { ElanPage } from './pages/ElanPage';
import { StrydePage } from './pages/StrydePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { WishlistPage } from './pages/WishlistPage';



// Scroll To Top component on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SiteSettingsProvider>
            <Router>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-amber-200 selection:text-amber-900">
                {/* Global Navbar */}
                <Navbar />

                {/* Main Page Routing */}
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/velora" element={<VeloraPage />} />
                    <Route path="/elan" element={<ElanPage />} />
                    <Route path="/stryde" element={<StrydePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/my-wishlist" element={<WishlistPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                    <Route path="/order-success" element={<OrderConfirmationPage />} />
                    <Route path="/track-order" element={<CustomerOrdersPage />} />
                    <Route path="/track" element={<CustomerOrdersPage />} />
                    <Route path="/my-orders" element={<CustomerOrdersPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />


                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </main>


                {/* Global Footer */}
                <Footer />

                {/* Slide-over Cart Drawer */}
                <CartDrawer />

                {/* Right-Side Verified Reviews Drawer */}
                <RightSideReviewsDrawer />

                {/* Floating Toast Notification */}
                <Toast />


              </div>
            </Router>
          </SiteSettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

