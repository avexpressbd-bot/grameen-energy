
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { ShoppingCart, Menu, X, Search, Phone, MessageSquare, ScanLine, Zap, Lock, LayoutDashboard, MapPin, User, LogOut, ChevronDown, Wrench } from 'lucide-react';
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
            <button onClick={() => onNavigate('track-order')} className="hidden md:flex items-center gap-1 hover:text-emerald-400 font-bold transition">
              <MapPin size={14}/> {t('Track Order', 'অর্ডার ট্র্যাক')}
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="hover:text-emerald-400 font-bold">
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <a href="https://wa.me/880123456789" target="_blank" className="flex items-center gap-1 bg-emerald-600 px-2 py-1 rounded hover:bg-emerald-700 transition font-black uppercase text-[10px]">
              <MessageSquare size={14}/> WhatsApp
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group shrink-0">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl md:text-2xl group-hover:bg-blue-700 transition">GE</div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg md:text-xl text-blue-900 leading-tight tracking-tight">Grameen Energy</span>
              <span className="text-[10px] md:text-xs text-emerald-700 font-bold uppercase tracking-widest">Solar & Electrical</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-8 font-black whitespace-nowrap text-xs uppercase tracking-widest text-slate-500">
            <button onClick={() => onNavigate('home')} className="hover:text-blue-900 transition">{t('Home', 'হোম')}</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-blue-900 transition">{t('Shop', 'শপ')}</button>
            <button onClick={() => onNavigate('services')} className="hover:text-blue-900 transition flex items-center gap-2 text-emerald-600">
              <Wrench size={14}/> {t('Services', 'সার্ভিস')}
            </button>
            <button onClick={() => onNavigate('track-order')} className="hover:text-blue-900 transition">{t('Tracking', 'ট্র্যাকিং')}</button>
            
            {currentStaffRole && (
              <button 
                onClick={() => onNavigate(currentStaffRole)}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition border border-blue-100"
              >
                {currentStaffRole === 'admin' ? <LayoutDashboard size={14}/> : <Zap size={14}/>}
                {t('Staff Panel', 'স্টাফ প্যানেল')}
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
                  className="flex items-center gap-2 p-1.5 pr-3 bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition border border-blue-100"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline font-black text-[10px] uppercase tracking-widest">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button 
                  onClick={() => onNavigate('customer-auth')}
                  className="p-2.5 text-slate-400 bg-slate-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition"
                  title={t('Login', 'লগইন')}
                >
                  <User size={24}/>
                </button>
              )}

              {isAccountMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[100] animate-in slide-in-from-top-2">
                  <div className="px-5 py-3 border-b mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('My Account', 'আমার প্রোফাইল')}</p>
                    <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                  </div>
                  <button onClick={() => { onNavigate('profile'); setIsAccountMenuOpen(false); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-3">
                    <User size={16} /> {t('Profile', 'প্রোফাইল')}
                  </button>
                  <button onClick={() => { onNavigate('profile'); setIsAccountMenuOpen(false); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-3">
                    <ShoppingCart size={16} /> {t('My Orders', 'আমার অর্ডার')}
                  </button>
                  <div className="border-t mt-2 pt-2">
                    <button onClick={() => { logout(); setIsAccountMenuOpen(false); onNavigate('home'); }} className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-xs font-bold text-red-500 flex items-center gap-3">
                      <LogOut size={16} /> {t('Logout', 'লগআউট')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('cart')} className="relative p-2.5 text-white bg-blue-900 rounded-full hover:bg-blue-800 transition shadow-lg shadow-blue-900/10">
              <ShoppingCart size={24}/>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white">
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
          <div className="lg:hidden bg-white border-t p-6 flex flex-col gap-6 shadow-xl animate-in slide-in-from-top-4">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-left font-black text-xl text-slate-900 tracking-tight">{t('Home', 'হোম')}</button>
            <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="text-left font-black text-xl text-slate-900 tracking-tight">{t('Shop', 'শপ')}</button>
            <button onClick={() => { onNavigate('services'); setIsMenuOpen(false); }} className="text-left font-black text-xl text-emerald-600 tracking-tight">{t('Services', 'সার্ভিস')}</button>
            <button onClick={() => { onNavigate('track-order'); setIsMenuOpen(false); }} className="text-left font-black text-xl text-slate-900 tracking-tight">{t('Track Order', 'অর্ডার ট্র্যাক')}</button>
            
            <div className="border-t pt-4 space-y-4">
              {user ? (
                <button onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
                  <div className="text-left">
                    <p className="font-black text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-400">{t('Manage Profile', 'প্রোফাইল ম্যানেজ করুন')}</p>
                  </div>
                </button>
              ) : (
                <button onClick={() => { onNavigate('customer-auth'); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 p-5 bg-blue-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">
                  <User size={20}/> {t('Login / Register', 'লগইন / রেজিস্ট্রেশন')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
