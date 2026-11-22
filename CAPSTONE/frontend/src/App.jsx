import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { RestaurantConflictModal } from './components/cart/RestaurantConflictModal';

import { HomePage } from './pages/HomePage';
import { RestaurantPage } from './pages/RestaurantPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentPage('restaurant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order) => {
    setTrackingOrder(order);
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrderForTracking = (order) => {
    setTrackingOrder(order);
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pureVegOnly={pureVegOnly}
        onTogglePureVeg={setPureVegOnly}
      />

      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            onSelectRestaurant={handleSelectRestaurant}
            searchQuery={searchQuery}
            pureVegOnly={pureVegOnly}
            onTogglePureVeg={setPureVegOnly}
          />
        )}

        {currentPage === 'restaurant' && (
          <RestaurantPage
            restaurantId={selectedRestaurantId}
            onBack={() => handleNavigate('home')}
            onOpenCart={() => {}}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onBackToCart={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'tracking' && trackingOrder && (
          <OrderTrackingPage
            order={trackingOrder}
            onBackHome={() => handleNavigate('home')}
            onViewAllOrders={() => handleNavigate('my-orders')}
          />
        )}

        {currentPage === 'my-orders' && (
          <MyOrdersPage
            onSelectOrder={handleSelectOrderForTracking}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            onBackHome={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
      />
      <RestaurantConflictModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
