import React from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Zap, ShieldCheck, Truck, RefreshCcw, ArrowRight } from 'lucide-react';
import { Category } from '../types';

import { motion, AnimatePresence } from 'motion/react';

const CategorySection: React.FC<{ 
  title: string, 
  onViewAll: () => void, 
  onItemClick: (id: string) => void,
  items: any[] 
}> = ({ title, onViewAll, onItemClick, items }) => (
  <section className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      <button 
        onClick={onViewAll}
        className="px-4 py-2 bg-slate-100 font-bold text-[10px] md:text-xs text-slate-500 rounded-lg hover:bg-slate-200 transition uppercase tracking-widest"
      >
        View All
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <div key={idx} onClick={() => item.id && onItemClick(item.id)} className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all duration-500">
          <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-50">
            <img src={item.image} alt={item.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mb-4 uppercase tracking-[0.05em]">{item.subtitle}</p>
          <button className="w-full py-4 bg-[#005CB0] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.1em] hover:bg-blue-600 transition shadow-lg shadow-blue-900/10 active:scale-[0.98]">
            {item.buttonText}
          </button>
        </div>
      ))}
    </div>
  </section>
);

const Home: React.FC<{ onProductClick: (id: string) => void, onNavigate: (page: string) => void }> = ({ onProductClick, onNavigate }) => {
  const { t, language } = useLanguage();
  const { products, settings } = useProducts();
  const [currentBanner, setCurrentBanner] = React.useState(0);

  const bannerProducts = (products || []).filter(p => p && p.isBanner).slice(0, 5);
  const bannerImages = bannerProducts.length > 0 
    ? bannerProducts.map(p => p.image).filter(Boolean) as string[]
    : [
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200"
      ];

  const safeCurrentBanner = currentBanner >= bannerImages.length ? 0 : currentBanner;

  React.useEffect(() => {
    if (bannerImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const featuredProducts = (products || []).filter(p => p && p.isBestSeller).slice(0, 6);
  
  // Categorize real products for the grid sections
  const solarProducts = (products || []).filter(p => p && p.category === Category.Solar).slice(0, 3).map(p => ({
    image: p.image,
    subtitle: `${p.brand || 'Grameen'} | High Quality`,
    buttonText: p.name,
    id: p.id
  }));

  const acAndFans = (products || []).filter(p => p && (p.category === Category.AC || p.category === Category.Fan)).slice(0, 3).map(p => ({
    image: p.image,
    subtitle: `${p.brand || 'Grameen'} | Professional Range`,
    buttonText: p.name,
    id: p.id
  }));

  return (
    <div className="pb-12 bg-slate-50">
      {/* Mega Banner Slider */}
      <section className="relative w-full h-[250px] md:h-[450px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeCurrentBanner}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src={bannerImages[safeCurrentBanner]} 
              className="w-full h-full object-contain bg-white" 
              alt="Banner" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Banner Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerImages.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentBanner(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === safeCurrentBanner ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </section>

      {/* Promo Squares */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl md:rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Truck className="text-blue-600" size={24}/>
          </div>
          <div>
            <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">{t('Free Delivery', 'ফ্রি ডেলিভারি')}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl md:rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ShieldCheck className="text-emerald-600" size={24}/>
          </div>
          <div>
            <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">{t('Genuine Products', 'জেনুইন প্রোডাক্ট')}</p>
          </div>
        </div>
      </section>

      {/* Flash Deals / Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">{t('Best Selling Products', 'সেরা বিক্রিত পণ্য')}</h2>
          <button onClick={() => onNavigate('shop')} className="px-4 py-2 bg-slate-100 font-bold text-[10px] md:text-xs text-slate-500 rounded-lg hover:bg-slate-200 uppercase tracking-widest">{t('View All', 'সব দেখুন')}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {featuredProducts.map(product => (
            <div key={product.id} onClick={() => onProductClick(product.id)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group cursor-pointer hover:shadow-lg transition">
              <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition" referrerPolicy="no-referrer" />
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{product.brand}</p>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{product.name}</h4>
              <p className="text-sm font-black text-slate-900 mt-2">৳{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Category Sections */}
      {solarProducts.length > 0 && (
        <CategorySection 
          title={t("Solar Energy Solutions", "সোলার পাওয়ার সলিউশন")} 
          onViewAll={() => onNavigate('shop')}
          onItemClick={onProductClick}
          items={solarProducts}
        />
      )}
      
      {acAndFans.length > 0 && (
        <CategorySection 
          title={t("AC & Cooling Systems", "এসি এবং কুলিং সিস্টেম")} 
          onViewAll={() => onNavigate('shop')}
          onItemClick={onProductClick}
          items={acAndFans}
        />
      )}

      {/* Generic Categories for rest */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">{t('Explore Categories', 'ক্যাটাগরি অনুযায়ী খুঁজুন')}</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.values(Category).map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => onNavigate('shop')}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 hover:border-blue-500 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                <Zap size={20} />
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 text-center leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

};

export default Home;