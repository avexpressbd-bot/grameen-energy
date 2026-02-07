
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import POS from './pages/POS';
import Login from './pages/Login';
import { LanguageProvider } from './components/LanguageContext';
import { CartProvider } from './components/CartContext';
import { ProductProvider, useProducts } from './components/ProductContext';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [auth, setAuth] = useState<{ isAuthenticated: boolean, role: 'admin' | 'pos' | null }>({
    isAuthenticated: false,
    role: null
  });
  
  const { products } = useProducts();

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const showProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (role: 'admin' | 'pos') => {
    setAuth({ isAuthenticated: true, role });
    navigateTo(role);
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, role: null });
    navigateTo('home');
  };

  const handleScanResult = (code: string) => {
    const matched = products.find(p => p.id === code || p.id.includes(code));
    if (matched) {
      showProduct(matched.id);
    } else {
      alert(`Product not found for code: ${code}`);
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
      
      // Auth Protected Pages
      case 'admin':
        return auth.isAuthenticated && auth.role === 'admin' 
          ? <AdminDashboard onNavigate={navigateTo} /> 
          : <Login type="admin" onLoginSuccess={handleLoginSuccess} onBack={() => navigateTo('home')} />;
      
      case 'pos':
        return auth.isAuthenticated && auth.role === 'pos' 
          ? <POS /> 
          : <Login type="pos" onLoginSuccess={handleLoginSuccess} onBack={() => navigateTo('home')} />;

      case 'contact':
        return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p>Phone: +880 1234 567 890</p>
            <p>Address: Uttara, Dhaka</p>
          </div>
        );
      case 'blog':
        return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
            <h1 className="text-3xl font-bold">Energy Saving Tips</h1>
            <p>Coming Soon...</p>
          </div>
        );
      default:
        return <Home onProductClick={showProduct} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onNavigate={navigateTo} onScanResult={handleScanResult} />
      <main className="flex-1">
        {renderPage()}
      </main>
      {currentPage !== 'pos' && (
        <Footer 
          onNavigate={navigateTo} 
          isAuthenticated={auth.isAuthenticated} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </LanguageProvider>
  );
};

export default App;
