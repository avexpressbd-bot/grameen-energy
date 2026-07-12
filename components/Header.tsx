// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { ShoppingCart, Menu, X, Search, Phone, MessageSquare, ScanLine, Zap, Lock, LayoutDashboard, MapPin, User, LogOut, ChevronDown, Wrench, Award, FileSpreadsheet } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const Header: React.FC<{ 
  onNavigate: (page: string) => void, 
  onScanResult: (code: string) => void,
  currentStaffRole: 'admin' | 'pos' | null 
}> = ({ onNavigate, onScanResult, currentStaffRole }) => {
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useProducts();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleScan = (code: string) => {
    setIsScannerOpen(false);
    onScanResult(code);
  };

  return (
    <>
      {isScannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
      )}
      <header className="sticky top-0 z-50 bg-[#005CB9] text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Menu & Logo */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 hover:bg-white/10 rounded transition md:hidden">
              <Menu size={24}/>
            </button>
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group shrink-0">
              <div className="flex flex-col text-left">
                <span className="font-black text-xl md:text-2xl text-white leading-tight tracking-tighter">
                  {language === 'en' ? (settings?.siteName || 'Grameen Energy') : (settings?.siteNameBn || 'গ্রামিন এনার্জি')}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] -mt-1">Reliable Energy Solutions</span>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl px-4">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search for products, brands and more" 
                className="w-full h-11 bg-white text-slate-800 rounded-lg pl-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-blue-600">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6 font-bold text-xs">
            <button onClick={() => onNavigate('cart')} className="relative p-2">
              <ShoppingCart size={22}/>
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black">{cart.length}</span>}
            </button>
            
            <div className="h-4 w-px bg-white/20 hidden md:block"></div>
            
            {!user ? (
              <button onClick={() => onNavigate('customer-auth')} className="hover:opacity-80 transition py-2">{t('Login', 'লগইন')}</button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <User size={18} />
                  </div>
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
                
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white text-slate-800 rounded-xl shadow-2xl border py-2 z-[100]">
                    <button onClick={() => { onNavigate('profile'); setIsAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                      <User size={16} /> Profile
                    </button>

                    {currentStaffRole && (
                      <button onClick={() => { onNavigate(currentStaffRole); setIsAccountMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600">
                        <LayoutDashboard size={16} /> Dashboard
                      </button>
                    )}
                    <button onClick={() => { logout(); setIsAccountMenuOpen(false); onNavigate('home'); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="w-full h-10 bg-white text-slate-800 rounded-lg pl-3 pr-10 text-xs font-medium outline-none"
            />
            <button className="absolute right-0 top-0 h-full px-3 text-slate-400">
              <Search size={18} />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-6 shadow-xl text-slate-800">
            <button className="text-left font-black uppercase text-xs tracking-widest" onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}>{t('Home', 'হোম')}</button>
            <button className="text-left font-black uppercase text-xs tracking-widest" onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }}>{t('Shop', 'শপ')}</button>
            <button className="text-left font-black uppercase text-xs tracking-widest" onClick={() => { onNavigate('services'); setIsMenuOpen(false); }}>{t('Services', 'সার্ভিস')}</button>
            <button className="text-left font-black uppercase text-xs tracking-widest" onClick={() => { onNavigate('staff'); setIsMenuOpen(false); }}>{t('Technicians', 'টেকনিশিয়ান')}</button>

          </div>
        )}
      </header>
    </>
  );
};

export default Header;