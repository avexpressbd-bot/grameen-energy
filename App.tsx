// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import BottomNav from './components/BottomNav.tsx';
import FloatingActions from './components/FloatingActions.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
import Services from './pages/Services.tsx';
import StaffList from './pages/StaffList.tsx';
import TechnicianPortal from './pages/TechnicianPortal.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import POS from './pages/POS.tsx';
import OrderTracking from './pages/OrderTracking.tsx';
import CustomerAuth from './pages/CustomerAuth.tsx';
import Profile from './pages/Profile.tsx';
import { LanguageProvider } from './components/LanguageContext.tsx';
import { CartProvider } from './components/CartContext.tsx';
import { ProductProvider, useProducts } from './components/ProductContext.tsx';
import { AuthProvider, useAuth } from './components/AuthContext.tsx';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [trackingContext, setTrackingContext] = useState<{id: string, phone: string} | null>(null);
  
  const { products } = useProducts();
  const { user, staffRole, logout } = useAuth();

  const navigateTo = (page: string) => {
    if (page !== 'track-order') setTrackingContext(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleTrackOrder = (id: string, phone: string) => {
    setTrackingContext({ id, phone });
    setCurrentPage('track-order');
    window.scrollTo(0, 0);
  };

  const showProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleScanResult = (code: string) => {
    const matched = products.find(p => p.id === code || p.id.includes(code));
    if (matched) {
      showProduct(matched.id);
    } else {
      alert(`পণ্য পাওয়া যায়নি: ${code}`);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onProductClick={showProduct} onNavigate={navigateTo} />;
      case 'shop':
        return <Shop onProductClick={showProduct} />;
      case 'services':
        return <Services />;
      case 'staff':
        return <StaffList />;
      case 'technician-portal':
        return <TechnicianPortal />;
      case 'product-detail':
        const product = products.find(p => p.id === selectedProductId);
        return product ? <ProductDetail product={product} onNavigate={navigateTo} /> : <Home onProductClick={showProduct} onNavigate={navigateTo} />;
      case 'cart':
        return <Cart onNavigate={navigateTo} />;
      case 'checkout':
        return <Checkout onNavigate={navigateTo} />;
      case 'track-order':
        return <OrderTracking onNavigate={navigateTo} initialOrderId={trackingContext?.id} initialPhone={trackingContext?.phone} />;
      case 'customer-auth':
        return <CustomerAuth onNavigate={navigateTo} />;
      case 'profile':
        if (user?.role === 'technician') return <TechnicianPortal />;
        return <Profile onNavigate={navigateTo} onTrackOrder={handleTrackOrder} />;
      case 'admin':
        return staffRole === 'admin' 
          ? <AdminDashboard onNavigate={navigateTo} /> 
          : <CustomerAuth onNavigate={navigateTo} />;
      case 'pos':
        return (staffRole === 'pos' || staffRole === 'admin')
          ? <POS /> 
          : <CustomerAuth onNavigate={navigateTo} />;
      default:
        return <Home onProductClick={showProduct} onNavigate={navigateTo} />;
    }
  };

  // Check if we should hide global nav/footer elements
  const isMinimalLayout = currentPage === 'pos' || currentPage === 'technician-portal';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 lg:pb-0">
      <Header onNavigate={navigateTo} onScanResult={handleScanResult} currentStaffRole={staffRole} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      {!isMinimalLayout && (
        <>
          <Footer 
            onNavigate={navigateTo} 
            isAuthenticated={!!staffRole || !!user} 
            onLogout={logout} 
          />
          <BottomNav currentPage={currentPage} onNavigate={navigateTo} />
          <FloatingActions />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;