
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
      <section className="relative bg-blue-900 text-white py-12 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold uppercase tracking-widest">
              {t('Welcome to Grameen Energy', 'গ্রামিন এনার্জি-তে স্বাগতম')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('Reliable Power Solutions', 'বিশ্বস্ত বিদ্যুৎ সমাধান')} — <span className="text-emerald-400">গ্রামিন এনার্জি</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-lg">
              {t('High-quality electrical and energy products for rural and urban homes. Sustainable, efficient, and affordable.', 'গ্রাম ও শহরের বাসাবাড়ির জন্য উচ্চমানের ইলেকট্রিক্যাল এবং এনার্জি প্রোডাক্ট। টেকসই, দক্ষ এবং সাশ্রয়ী।')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('shop')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-lg transition shadow-lg flex items-center gap-2">
                {t('Shop Now', 'শপ করুন')} <ArrowRight size={20}/>
              </button>
              <a href="https://wa.me/880123456789" className="px-8 py-3 bg-white text-blue-900 hover:bg-gray-100 rounded-lg font-bold text-lg transition flex items-center gap-2">
                {t('WhatsApp Order', 'হোয়াটসঅ্যাপ অর্ডার')}
              </a>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img 
              src="https://images.unsplash.com/photo-1592833159155-c62df1b356ee?auto=format&fit=crop&q=80&w=800" 
              alt="Solar Panels" 
              className="rounded-2xl shadow-2xl border-4 border-blue-800 rotate-2"
            />
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">{t('Product Categories', 'পণ্য ক্যাটাগরি')}</h2>
            <p className="text-gray-500 mt-1">{t('Find what you need by category', 'আপনার প্রয়োজনীয় বিভাগ অনুযায়ী খুঁজুন')}</p>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-emerald-600 font-bold hover:underline">{t('View All', 'সব দেখুন')}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => onNavigate('shop')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition group text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Zap size={24}/>
              </div>
              <span className="text-xs font-bold text-gray-700">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-100 border-y py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-emerald-600" size={40}/>
            <div>
              <h4 className="font-bold">{t('Genuine Product', 'আসল পণ্য')}</h4>
              <p className="text-xs text-gray-500">{t('100% original quality', '১০০% আসল মানের গ্যারান্টি')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Truck className="text-emerald-600" size={40}/>
            <div>
              <h4 className="font-bold">{t('Fast Delivery', 'দ্রুত ডেলিভারি')}</h4>
              <p className="text-xs text-gray-500">{t('Inside Dhaka 24h', 'ঢাকার ভেতরে ২৪ ঘণ্টা')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RefreshCcw className="text-emerald-600" size={40}/>
            <div>
              <h4 className="font-bold">{t('Easy Warranty', 'সহজ ওয়ারেন্টি')}</h4>
              <p className="text-xs text-gray-500">{t('Prompt claim support', 'দ্রুত সাপোর্ট সুবিধা')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="text-emerald-600" size={40}/>
            <div>
              <h4 className="font-bold">{t('Expert Install', 'দক্ষ সেটআপ')}</h4>
              <p className="text-xs text-gray-500">{t('Free technician consult', 'ফ্রি টেকনিশিয়ান পরামর্শ')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">{t('Best Selling Items', 'সেরা বিক্রিত পণ্য')}</h2>
            <p className="text-gray-500 mt-1">{t('Customer favorites', 'গ্রাহকদের পছন্দের তালিকা')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900">{t('Why Choose Us?', 'কেন আমাদের বেছে নেবেন?')}</h2>
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
            <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-4 hover:-translate-y-1 transition duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-blue-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
