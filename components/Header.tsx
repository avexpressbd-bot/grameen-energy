
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { ShoppingCart, Menu, X, Search, Phone, MessageSquare, ScanLine, Zap, Lock, LayoutDashboard, MapPin } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const Header: React.FC<{ 
  onNavigate: (page: string) => void, 
  onScanResult: (code: string) => void,
  currentRole: 'admin' | 'pos' | null 
}> = ({ onNavigate, onScanResult, currentRole }) => {
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
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="bg-blue-900 text-white py-2 px-4 text-xs md:text-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-bold"><Phone size={14}/> +880 1XXX-XXXXXX</span>
            <button onClick={() => onNavigate('track-order')} className="hidden md:flex items-center gap-1 hover:text-emerald-400 font-bold transition">
              <MapPin size={14}/> {t('Track Order', 'অর্ডার ট্র্যাক করুন')}
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="hover:text-emerald-400 font-bold">
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <a href="https://wa.me/880123456789" target="_blank" className="flex items-center gap-1 bg-emerald-600 px-2 py-1 rounded hover:bg-emerald-700 transition">
              <MessageSquare size={14}/> WhatsApp
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group shrink-0">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl md:text-2xl group-hover:bg-blue-700 transition">GE</div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg md:text-xl text-blue-900 leading-tight">Grameen Energy</span>
              <span className="text-[10px] md:text-xs text-emerald-700 font-bold uppercase tracking-widest">Premium Store</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-6 font-bold whitespace-nowrap text-sm">
            <button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition">{t('Home', 'হোম')}</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600 transition">{t('Shop', 'শপ')}</button>
            
            {currentRole === 'admin' ? (
              <button onClick={() => onNavigate('admin')} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-lg animate-pulse">
                <LayoutDashboard size={16}/> {t('Dashboard', 'ড্যাশবোর্ড')}
              </button>
            ) : currentRole === 'pos' ? (
              <button onClick={() => onNavigate('pos')} className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition shadow-lg">
                <Zap size={16}/> {t('Sales Terminal', 'সেলস প্যানেল')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => onNavigate('admin')} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition border">
                  <Lock size={14}/> {t('Admin', 'এডমিন')}
                </button>
                <button onClick={() => onNavigate('pos')} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition border border-blue-100">
                  <Zap size={14}/> {t('Sales', 'সেলস')}
                </button>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsScannerOpen(true)} className="p-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition">
              <ScanLine size={24}/>
            </button>
            <button onClick={() => onNavigate('cart')} className="relative p-2 text-blue-900 bg-blue-50 rounded-full hover:bg-blue-100 transition">
              <ShoppingCart size={24}/>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-blue-900">
              {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-5 shadow-xl">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-left font-bold text-lg text-gray-800 border-b pb-2">{t('Home', 'হোম')}</button>
            <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="text-left font-bold text-lg text-gray-800 border-b pb-2">{t('Shop', 'শপ')}</button>
            <button onClick={() => { onNavigate('track-order'); setIsMenuOpen(false); }} className="text-left font-bold text-lg text-emerald-600 border-b pb-2">{t('Track Order', 'অর্ডার ট্র্যাকিং')}</button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-2xl border text-gray-600 font-bold">
                <Lock size={24}/>
                <span>{t('Admin', 'এডমিন')}</span>
              </button>
              <button onClick={() => { onNavigate('pos'); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 font-bold">
                <Zap size={24}/>
                <span>{t('Sales', 'সেলস')}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
