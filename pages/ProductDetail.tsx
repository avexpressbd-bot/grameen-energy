
import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useCart } from '../components/CartContext';
import { ShoppingCart, Zap, MessageSquare, ChevronRight, Share2, Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { getEnergyAdvice } from '../services/geminiService';

const ProductDetail: React.FC<{ product: Product, onNavigate: (page: string) => void }> = ({ product, onNavigate }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const askExpert = async () => {
    setLoadingAdvice(true);
    const res = await getEnergyAdvice(`Load requirements for ${product.name}`, language);
    setAdvice(res || null);
    setLoadingAdvice(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-600">{t('Home', 'হোম')}</button>
        <ChevronRight size={14}/>
        <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600">{t('Shop', 'শপ')}</button>
        <ChevronRight size={14}/>
        <span className="text-gray-900 font-medium">{t(product.name, product.nameBn)}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border bg-white flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border hover:border-emerald-500 cursor-pointer">
                <img src={product.image} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition" alt="thumb" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">{product.category}</span>
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-emerald-600 transition"><Share2 size={20}/></button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {t(product.name, product.nameBn)}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor"/>)}
              </div>
              <span className="text-sm text-gray-500">(12 {t('Reviews', 'রিভিউ')})</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-6 bg-blue-50 rounded-xl space-y-2 border border-blue-100">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-blue-900">৳ {product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <span className="text-xl text-gray-400 line-through">৳ {product.price}</span>
              )}
            </div>
            <p className="text-emerald-700 font-medium">
              {product.discountPrice ? t(`Save ৳ ${product.price - product.discountPrice}`, `${product.price - product.discountPrice} টাকা সাশ্রয় করুন`) : t('Best Price Guaranteed', 'সেরা মূল্যের নিশ্চয়তা')}
            </p>
          </div>

          {/* Warranty Highlight Box */}
          <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t('Warranty Period', 'ওয়ারেন্টি সময়সীমা')}</p>
              <p className="text-xl font-black text-emerald-900">{product.warranty || t('No Warranty', 'ওয়ারেন্টি নেই')}</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {t(product.description, product.descriptionBn)}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold border-b pb-2 flex items-center gap-2">
                <Zap size={18} className="text-blue-600" />
                {t('Specifications', 'বৈশিষ্ট্যসমূহ')}
              </h4>
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">{k}:</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-900 text-white p-5 rounded-xl space-y-3 border border-blue-800 shadow-md">
              <h4 className="font-bold flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-400" />
                {t('Expert Advice', 'বিশেষজ্ঞ পরামর্শ')}
              </h4>
              <p className="text-xs text-blue-100">
                {t('Need to know if this fits your home?', 'আপনার বাসার জন্য এটি সঠিক কি না জানতে চান?')}
              </p>
              <button 
                onClick={askExpert}
                disabled={loadingAdvice}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loadingAdvice ? t('Asking AI...', 'জিজ্ঞাসা করা হচ্ছে...') : t('Ask AI Advisor', 'এআই এডভাইজরকে জিজ্ঞাসা করুন')}
              </button>
            </div>
          </div>

          {advice && (
            <div className="p-4 bg-white border-2 border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{advice}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 py-4 bg-blue-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition shadow-lg"
            >
              <ShoppingCart size={20}/>
              {t('Add to Cart', 'কার্টে যোগ করুন')}
            </button>
            <button className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition shadow-lg">
              <Zap size={20}/>
              {t('Buy Now', 'এখনই কিনুন')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <a href="https://wa.me/880123456789" className="w-full py-4 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-50 transition">
              <MessageSquare size={20}/>
              {t('Order via WhatsApp', 'হোয়াটসঅ্যাপে অর্ডার করুন')}
            </a>
            <button className="w-full py-3 text-xs text-gray-400 hover:text-emerald-600 transition flex items-center justify-center gap-2">
              <ShieldCheck size={14}/>
              {t('Easy Warranty Claim Process', 'সহজ ওয়ারেন্টি ক্লেইম পদ্ধতি')}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section Placeholder */}
      <div className="border-t pt-12">
        <h2 className="text-2xl font-bold mb-8">{t('Customer Reviews', 'গ্রাহকদের রিভিউ')}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className="bg-gray-50 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800">
                  {i === 1 ? 'AH' : 'MR'}
                </div>
                <div>
                  <h4 className="font-bold">{i === 1 ? 'Ahsan Habib' : 'Mustafizur Rahman'}</h4>
                  <div className="flex text-yellow-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                </div>
              </div>
              <p className="text-gray-600">{i === 1 ? t('Excellent build quality and very fast delivery.', 'দারুণ মান এবং খুব দ্রুত ডেলিভারি পেয়েছি।') : t('Working great with my solar setup. Highly recommended!', 'আমার সোলার সেটআপের সাথে খুব ভালো কাজ করছে। সেরা প্রোডাক্ট!')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
