
import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
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
  
  const { products } = useProducts();
  const { user, staffRole, logout } = useAuth();

  const navigateTo = (page: string) => {
    setCurrentPage(page);
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
      case 'product-detail':
        const product = products.find(p => p.id === selectedProductId);
        return product ? <ProductDetail product={product} onNavigate={navigateTo} /> : <Home onProductClick={showProduct} onNavigate={navigateTo} />;
      case 'cart':
        return <Cart onNavigate={navigateTo} />;
      case 'checkout':
        return <Checkout onNavigate={navigateTo} />;
      case 'track-order':
        return <OrderTracking onNavigate={navigateTo} />;
      case 'customer-auth':
        return <CustomerAuth onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={navigateTo} onScanResult={handleScanResult} currentStaffRole={staffRole} />
      <main className="flex-1">
        {renderPage()}
      </main>
      {currentPage !== 'pos' && (
        <Footer 
          onNavigate={navigateTo} 
          isAuthenticated={!!staffRole} 
          onLogout={logout} 
        />
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
