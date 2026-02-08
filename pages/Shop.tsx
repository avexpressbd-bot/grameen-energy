
import React, { useState } from 'react';
import { useProducts } from '../components/ProductContext';
import { Category } from '../types';
import { useLanguage } from '../components/LanguageContext';
import ProductCard from '../components/ProductCard';
// Fix: Added ShoppingCart to the imported icons from lucide-react
import { Filter, SlidersHorizontal, Search, ShoppingCart } from 'lucide-react';

const Shop: React.FC<{ onProductClick: (id: string) => void }> = ({ onProductClick }) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nameBn.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Mobile Search & Category Bar */}
      <div className="sticky top-[64px] md:top-[80px] z-40 bg-gray-50 -mx-4 px-4 py-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder={t('Search products...', 'পণ্য খুঁজুন...')}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Horizontal Category Pill Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === 'All' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
            }`}
          >
            {t('All Items', 'সব পণ্য')}
          </button>
          {Object.values(Category).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
              }`}
            >
              {t(cat, cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar Filters (Desktop Only) */}
        <aside className="hidden lg:block w-64 space-y-8">
          <div>
            <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Filter size={18}/>
              {t('Refine Search', 'ফিল্টার')}
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-5 py-3 rounded-xl transition font-bold text-sm ${selectedCategory === 'All' ? 'bg-emerald-600 text-white shadow-xl' : 'hover:bg-white text-slate-500 hover:shadow-sm border border-transparent hover:border-slate-100'}`}
              >
                {t('All Categories', 'সব ক্যাটাগরি')}
              </button>
              {Object.values(Category).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-5 py-3 rounded-xl transition font-bold text-sm ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-xl' : 'hover:bg-white text-slate-500 hover:shadow-sm border border-transparent hover:border-slate-100'}`}
                >
                  {t(cat, cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-blue-900 rounded-[2rem] text-white space-y-4 shadow-2xl">
            <h4 className="font-black text-lg uppercase tracking-tight">{t('Expert Help?', 'সহায়তা প্রয়োজন?')}</h4>
            <p className="text-xs text-blue-100 font-bold leading-relaxed">{t('Talk to our engineers for free technical guidance.', 'ইঞ্জিনিয়ারদের সাথে কথা বলুন ফ্রি পরামর্শের জন্য।')}</p>
            <a href="tel:+880123456789" className="block w-full text-center py-4 bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/10">
              {t('Call Engineer', 'কল করুন')}
            </a>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          <div className="mb-8 flex justify-between items-center">
            <div className="hidden md:block">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {selectedCategory === 'All' ? t('Browse All Products', 'সব পণ্য তালিকা') : t(selectedCategory, selectedCategory)}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {filteredProducts.length} {t('Items Found', 'টি আইটেম পাওয়া গেছে')}
              </p>
            </div>
            {/* Sort Dropdown Placeholder */}
            <div className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-xs font-black uppercase text-slate-500">
               <SlidersHorizontal size={14} /> {t('Sort By', 'সর্ট করুন')}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="text-slate-200 mb-6"><ShoppingCart size={64} className="mx-auto opacity-20"/></div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">{t('No products matched', 'কোনো পণ্য খুঁজে পাওয়া যায়নি')}</h3>
              <button 
                onClick={() => {setSelectedCategory('All'); setSearchTerm('');}}
                className="mt-6 px-8 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                {t('Reset Filters', 'ফিল্টার মুছুন')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
