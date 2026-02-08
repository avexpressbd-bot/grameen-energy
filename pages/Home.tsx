
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
      {/* Hero Banner */}
      <section className="relative bg-blue-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-8">
            <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">
              {t('Welcome to Grameen Energy', 'গ্রামিন এনার্জি-তে স্বাগতম')}
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              {t('Reliable Power Solutions', 'বিশ্বস্ত বিদ্যুৎ সমাধান')} — <br/>
              <span className="text-emerald-400">{t('Grameen Energy', 'গ্রামিন এনার্জি')}</span>
            </h1>
            <p className="text-xl text-blue-100/80 font-medium leading-relaxed max-w-2xl">
              {t('High-quality electrical and energy products for rural and urban homes. Sustainable, efficient, and affordable.', 'গ্রাম ও শহরের বাসাবাড়ির জন্য উচ্চমানের ইলেকট্রিক্যাল এবং এনার্জি প্রোডাক্ট। টেকসই, দক্ষ এবং সাশ্রয়ী।')}
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button 
                onClick={() => onNavigate('shop')} 
                className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
              >
                {t('Shop Now', 'শপ করুন')} <ArrowRight size={20}/>
              </button>
              <a 
                href="https://wa.me/880123456789" 
                className="px-10 py-5 bg-white text-blue-900 hover:bg-slate-50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 active:scale-95"
              >
                {t('WhatsApp Order', 'হোয়াটসঅ্যাপ অর্ডার')}
              </a>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{t('Product Categories', 'পণ্য ক্যাটাগরি')}</h2>
            <p className="text-slate-400 font-bold">{t('Find what you need by category', 'আপনার প্রয়োজনীয় বিভাগ অনুযায়ী খুঁজুন')}</p>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-emerald-600 font-black uppercase text-xs tracking-widest hover:text-emerald-700 transition border-b-2 border-emerald-100 pb-1">{t('View All', 'সব দেখুন')}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => onNavigate('shop')} className="flex flex-col items-center gap-4 p-6 rounded-[2.5rem] bg-white shadow-sm border border-slate-50 hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-2 transition-all group text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Zap size={28}/>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: ShieldCheck, title: t('Genuine Product', 'আসল পণ্য'), desc: t('100% original quality', '১০০% আসল মানের গ্যারান্টি') },
            { icon: Truck, title: t('Fast Delivery', 'দ্রুত ডেলিভারি'), desc: t('Inside Dhaka 24h', 'ঢাকার ভেতরে ২৪ ঘণ্টা') },
            { icon: RefreshCcw, title: t('Easy Warranty', 'সহজ ওয়ারেন্টি'), desc: t('Prompt claim support', 'দ্রুত সাপোর্ট সুবিধা') },
            { icon: Zap, title: t('Expert Install', 'দক্ষ সেটআপ'), desc: t('Free technician consult', 'ফ্রি টেকনিশিয়ান পরামর্শ') }
          ].map((badge, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-emerald-600">
                <badge.icon size={32}/>
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">{badge.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{t('Best Selling Items', 'সেরা বিক্রিত পণ্য')}</h2>
          <p className="text-slate-400 font-bold">{t('Customer favorites', 'গ্রাহকদের পছন্দের তালিকা')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">{t('Why Choose Us?', 'কেন আমাদের বেছে নেবেন?')}</h2>
          <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: t('Expert Knowledge', 'বিশেষজ্ঞ জ্ঞান'), 
              desc: t('10+ years of experience in solar and IPS industry.', 'সোলার এবং আইপিএস ইন্ডাস্ট্রিতে ১০ বছরের বেশি অভিজ্ঞতা।'),
              icon: <Zap size={32}/> 
            },
            { 
              title: t('After Sales Support', 'আফটার সেলস সাপোর্ট'), 
              desc: t('We don\'t just sell, we take care of your devices.', 'আমরা শুধু বিক্রি করি না, আমরা আপনার ডিভাইসের দেখাশোনা করি।'),
              icon: <ShieldCheck size={32}/> 
            },
            { 
              title: t('Affordable Price', 'সাশ্রয়ী মূল্য'), 
              desc: t('Best market rates for high-quality genuine parts.', 'উচ্চমানের আসল যন্ত্রাংশের জন্য বাজারের সেরা দর।'),
              icon: <RefreshCcw size={32}/> 
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm text-center space-y-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
