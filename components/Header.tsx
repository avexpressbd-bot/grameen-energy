
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { ShoppingCart, Menu, X, Search, Phone, MessageSquare, ScanLine, Zap } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const Header: React.FC<{ onNavigate: (page: string) => void, onScanResult: (code: string) => void }> = ({ onNavigate, onScanResult }) => {
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = (code: string) => {
    setIsScannerOpen(false);
    onScanResult(code);
  };

  return (
    <>
      {isScannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
      )}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Top bar */}
        <div className="bg-blue-900 text-white py-2 px-4 text-xs md:text-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={14}/> +880 1XXX-XXXXXX</span>
            <span className="hidden md:block">{t('Free delivery on orders over 5000 TK', '৫০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি')}</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="hover:text-emerald-400 font-bold">
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <a href="https://wa.me/880123456789" target="_blank" className="flex items-center gap-1 bg-emerald-600 px-2 py-1 rounded">
              <MessageSquare size={14}/> WhatsApp
            </a>
          </div>
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group shrink-0">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl md:text-2xl group-hover:bg-blue-700 transition">GE</div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg md:text-xl text-blue-900 leading-tight">Grameen Energy</span>
              <span className="text-xs md:text-sm text-emerald-700 font-medium">গ্রামিন এনার্জি</span>
            </div>
          </button>

          <div className="hidden lg:flex flex-1 max-w-md relative items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={t('Search products...', 'পণ্য খুঁজুন...')}
                className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20}/>
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="p-2 bg-gray-100 hover:bg-emerald-50 text-emerald-600 rounded-full transition flex items-center gap-2 group"
              title={t('Scan Barcode', 'বারকোড স্ক্যান')}
            >
              <ScanLine size={24}/>
              <span className="text-xs font-bold pr-2 hidden xl:inline">{t('Scan', 'স্ক্যান')}</span>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-6 font-medium whitespace-nowrap">
            <button onClick={() => onNavigate('home')} className="hover:text-emerald-600">{t('Home', 'হোম')}</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600">{t('Shop', 'শপ')}</button>
            <button onClick={() => onNavigate('pos')} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition">
              <Zap size={16}/>
              {t('Sales', 'সেলস')}
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-emerald-600">{t('Contact', 'যোগাযোগ')}</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsScannerOpen(true)} className="lg:hidden p-2 text-emerald-600">
              <ScanLine size={24}/>
            </button>
            <button onClick={() => onNavigate('cart')} className="relative p-2 text-blue-900 hover:text-emerald-600">
              <ShoppingCart size={24}/>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-blue-900">
              {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t p-4 flex flex-col gap-4 animate-slide-down">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-left py-2 border-b">{t('Home', 'হোম')}</button>
            <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="text-left py-2 border-b">{t('Shop', 'শপ')}</button>
            <button onClick={() => { onNavigate('pos'); setIsMenuOpen(false); }} className="text-left py-2 border-b flex items-center gap-2 text-blue-600 font-bold"><Zap size={18}/> {t('Sales Panel', 'সেলস প্যানেল')}</button>
            <button onClick={() => { onNavigate('blog'); setIsMenuOpen(false); }} className="text-left py-2 border-b">{t('Tips', 'টিপস')}</button>
            <button onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} className="text-left py-2 border-b">{t('Contact', 'যোগাযোগ')}</button>
            <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} className="text-left py-2 text-gray-400 italic">{t('Admin Login', 'এডমিন লগইন')}</button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
