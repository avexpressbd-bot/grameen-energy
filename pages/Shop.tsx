
import React, { useState } from 'react';
import { useProducts } from '../components/ProductContext';
import { Category } from '../types';
import { useLanguage } from '../components/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

const Shop: React.FC<{ onProductClick: (id: string) => void }> = ({ onProductClick }) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Filter size={18}/>
              {t('Categories', 'ক্যাটাগরি')}
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === 'All' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {t('All Products', 'সব পণ্য')}
              </button>
              {Object.values(Category).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === cat ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {t(cat, cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-900 rounded-2xl text-white space-y-4">
            <h4 className="font-bold">{t('Need Help?', 'সহায়তা প্রয়োজন?')}</h4>
            <p className="text-xs text-blue-100">{t('Talk to our engineers for technical assistance.', 'টেকনিক্যাল সহায়তার জন্য আমাদের ইঞ্জিনিয়ারদের সাথে কথা বলুন।')}</p>
            <a href="tel:+880123456789" className="block text-center py-2 bg-emerald-500 rounded-lg font-bold hover:bg-emerald-600 transition">
              {t('Call Now', 'কল করুন')}
            </a>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedCategory === 'All' ? t('All Products', 'সব পণ্য') : selectedCategory}
              <span className="ml-2 text-sm text-gray-500 font-normal">({filteredProducts.length} {t('items found', 'টি পণ্য পাওয়া গেছে')})</span>
            </h2>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="text-gray-400 mb-4"><SlidersHorizontal size={48} className="mx-auto opacity-20"/></div>
              <h3 className="text-xl font-medium text-gray-500">{t('No products found in this category.', 'এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।')}</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
