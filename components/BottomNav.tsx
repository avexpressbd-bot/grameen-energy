
import React from 'react';
import { Home, ShoppingBag, Wrench, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const { cart } = useCart();

  const navItems = [
    { id: 'home', icon: Home, label: t('Home', 'হোম') },
    { id: 'shop', icon: ShoppingBag, label: t('Shop', 'শপ') },
    { id: 'services', icon: Wrench, label: t('Services', 'সার্ভিস') },
    { id: 'cart', icon: ShoppingCart, label: t('Cart', 'কার্ট'), badge: cart.length },
    { id: 'profile', icon: User, label: t('Account', 'প্রোফাইল') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 z-[100] flex justify-around items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-all relative ${
            currentPage === item.id ? 'text-blue-900 scale-110' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} />
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">
            {item.label}
          </span>
          {currentPage === item.id && (
            <div className="absolute -top-2 w-1 h-1 bg-blue-900 rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
