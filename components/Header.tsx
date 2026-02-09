// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { ShoppingCart, Menu, X, Search, Phone, MessageSquare, ScanLine, Zap, Lock, LayoutDashboard, MapPin, User, LogOut, ChevronDown, Wrench, Award } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const Header: React.FC<{ 
  onNavigate: (page: string) => void, 
  onScanResult: (code: string) => void,
  currentStaffRole: 'admin' | 'pos' | null 
}> = ({ onNavigate, onScanResult, currentStaffRole }) => {
  const { language, setLanguage, t } = useLanguage();
  const { cart } = useCart();
  const { user, logout } = useAuth();
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
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="bg-blue-900 text-white py-2 px-4 text-xs md:text-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-bold"><Phone size={14}/> +880 1XXX-XXXXXX</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="hover:text-emerald-400 font-bold">
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group shrink-0">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl md:text-2xl group-hover:bg-blue-700 transition">GE</div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg md:text-xl text-blue-900 leading-tight tracking-tight">Grameen Energy</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-8 font-black whitespace-nowrap text-xs uppercase tracking-widest text-slate-500">
            <button onClick={() => onNavigate('home')} className="hover:text-blue-900 transition">{t('Home', 'হোম')}</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-blue-900 transition">{t('Shop', 'শপ')}</button>
            <button onClick={() => onNavigate('services')} className="hover:text-blue-900 transition">{t('Services', 'সার্ভিস')}</button>
            <button onClick={() => onNavigate('staff')} className="hover:text-blue-900 transition flex items-center gap-2">
              <Award size={14} className="text-emerald-500"/> {t('Technicians', 'টেকনিশিয়ান')}
            </button>
            
            {currentStaffRole && (
              <button 
                onClick={() => onNavigate(currentStaffRole)}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition border border-blue-100"
              >
                <LayoutDashboard size={14}/> {t('Staff Panel', 'স্টাফ প্যানেল')}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsScannerOpen(true)} className="p-2.5 text-slate-400 bg-slate-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
              <ScanLine size={24}/>
            </button>

            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-blue-50 text-blue-900 rounded-full border border-blue-100"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <button onClick={() => onNavigate('customer-auth')} className="p-2.5 text-slate-400 bg-slate-50 rounded-full hover:bg-blue-50 transition"><User size={24}/></button>
              )}

              {isAccountMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[100]">
                  <button onClick={() => { onNavigate('profile'); setIsAccountMenuOpen(false); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-xs font-bold flex items-center gap-3">
                    <User size={16} /> {user.role === 'technician' ? 'My Dashboard' : 'Profile'}
                  </button>
                  <button onClick={() => { logout(); setIsAccountMenuOpen(false); onNavigate('home'); }} className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-xs font-bold text-red-500 flex items-center gap-3">
                    <LogOut size={16} /> {t('Logout', 'লগআউট')}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('cart')} className="relative p-2.5 text-white bg-blue-900 rounded-full">
              <ShoppingCart size={24}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">{cart.length}</span>}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-blue-900">
              {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-6 shadow-xl">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}>{t('Home', 'হোম')}</button>
            <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }}>{t('Shop', 'শপ')}</button>
            <button onClick={() => { onNavigate('services'); setIsMenuOpen(false); }}>{t('Services', 'সার্ভিস')}</button>
            <button onClick={() => { onNavigate('staff'); setIsMenuOpen(false); }}>{t('Technicians', 'টেকনিশিয়ান')}</button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;