
import React from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Zap, ShieldCheck, Truck, RefreshCcw, ArrowRight } from 'lucide-react';
import { Category } from '../types';

const Home: React.FC<{ onProductClick: (id: string) => void, onNavigate: (page: string) => void }> = ({ onProductClick, onNavigate }) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const bestSellers = products.filter(p => p.isBestSeller);
  const categories = Object.values(Category);

  return (
    <div className="pb-12">
      {/* Hero Banner - Mobile Height Adjusted */}
      <section className="relative bg-blue-900 text-white pt-16 pb-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6 md:space-y-8 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              {t('Welcome to Grameen Energy', 'গ্রামিন এনার্জি-তে স্বাগতম')}
            </span>
            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight">
              {t('Reliable Power Solutions', 'বিশ্বস্ত বিদ্যুৎ সমাধান')} <br className="hidden md:block"/>
              <span className="text-emerald-400">{t('Grameen Energy', 'গ্রামিন এনার্জি')}</span>
            </h1>
            <p className="text-base md:text-xl text-blue-100/80 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
              {t('High-quality electrical and energy products for rural and urban homes. Sustainable, efficient, and affordable.', 'গ্রাম ও শহরের বাসাবাড়ির জন্য উচ্চমানের ইলেকট্রিক্যাল এবং এনার্জি প্রোডাক্ট। টেকসই, দক্ষ এবং সাশ্রয়ী।')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => onNavigate('shop')} 
                className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {t('Shop Now', 'শপ করুন')} <ArrowRight size={20}/>
              </button>
              <button 
                onClick={() => onNavigate('services')}
                className="w-full sm:w-auto px-10 py-5 bg-white text-blue-900 hover:bg-slate-50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                {t('Book Service', 'সার্ভিস বুকিং')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-400/10 rounded-full blur-[60px] md:blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Categories - Mobile Horizontal Scroll or Compact Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{t('Categories', 'ক্যাটাগরি')}</h2>
            <p className="text-xs md:text-base text-slate-400 font-bold">{t('Find by category', 'বিভাগ অনুযায়ী খুঁজুন')}</p>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:text-emerald-700 transition border-b-2 border-emerald-100 pb-1">{t('View All', 'সব দেখুন')}</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-6">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => onNavigate('shop')} className="flex flex-col items-center gap-2 md:gap-4 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white shadow-sm border border-slate-50 hover:border-emerald-500 transition-all group text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-active:bg-emerald-500 group-active:text-white transition-all">
                <Zap size={20}/>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-tight md:tracking-widest leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Mobile Trust Badges - Horizontal Scroll */}
      <section className="bg-slate-50 border-y border-slate-100 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex md:grid md:grid-cols-4 gap-8 min-w-max md:min-w-0">
            {[
              { icon: ShieldCheck, title: t('Genuine', 'আসল পণ্য'), desc: t('100% Quality', 'সেরা কোয়ালিটি') },
              { icon: Truck, title: t('Delivery', 'ডেলিভারি'), desc: t('Dhaka 24h', '২৪ ঘণ্টায়') },
              { icon: RefreshCcw, title: t('Warranty', 'ওয়ারেন্টি'), desc: t('Easy Claims', 'সহজ সুবিধা') },
              { icon: Zap, title: t('Setup', 'দক্ষ সেটআপ'), desc: t('Expert Team', 'বিশেষজ্ঞ টিম') }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 md:bg-transparent md:p-0 md:rounded-none md:shadow-none md:border-none">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-50 md:bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                  <badge.icon size={24}/>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-widest leading-none">{badge.title}</h4>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-1">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers - 2 Column Grid for Mobile */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <div className="mb-8 md:mb-12 space-y-1">
          <h2 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{t('Best Sellers', 'সেরা বিক্রিত পণ্য')}</h2>
          <p className="text-xs md:text-base text-slate-400 font-bold">{t('Customer favorites', 'গ্রাহকদের পছন্দের তালিকা')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section - Mobile Optimized Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">{t('Why Grameen Energy?', 'কেন আমাদের বেছে নেবেন?')}</h2>
          <div className="w-16 md:w-24 h-1 md:h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {[
            { 
              title: t('Expert Knowledge', 'বিশেষজ্ঞ জ্ঞান'), 
              desc: t('10+ years in energy sector.', 'এই সেক্টরে ১০ বছরের অভিজ্ঞতা।'),
              icon: <Zap size={24}/> 
            },
            { 
              title: t('Service First', 'সার্ভিস ফার্স্ট'), 
              desc: t('We prioritize your convenience.', 'আপনার সুবিধাই আমাদের অগ্রাধিকার।'),
              icon: <ShieldCheck size={24}/> 
            },
            { 
              title: t('Genuine Parts', 'আসল খুচরা যন্ত্রাংশ'), 
              desc: t('Best market rates for parts.', 'বাজারের সেরা দরে আসল পার্টস।'),
              icon: <RefreshCcw size={24}/> 
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 md:p-10 bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-4 hover:shadow-xl transition-all">
              <div className="mx-auto w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-xs md:text-base text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
