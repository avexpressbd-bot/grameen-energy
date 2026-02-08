
import React from 'react';
import { Product } from '../types';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { ShoppingCart, Zap, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group overflow-hidden border border-slate-100 flex flex-col relative h-full">
      <div className="relative aspect-square overflow-hidden cursor-pointer bg-slate-50" onClick={onClick}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.isOffer && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-lg tracking-widest">
            {t('OFFER', 'অফার')}
          </span>
        )}
        
        {/* Quick Add Button Mobile Only */}
        <button 
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="lg:hidden absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="text-[9px] text-emerald-600 font-black mb-1 uppercase tracking-[0.15em] line-clamp-1">{product.category}</div>
        <h3 className="font-bold text-slate-800 text-xs md:text-sm mb-2 line-clamp-2 h-8 md:h-10 leading-tight" title={t(product.name, product.nameBn)}>
          {t(product.name, product.nameBn)}
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-baseline gap-1 mt-auto">
          <span className="text-base md:text-lg font-black text-blue-900">৳ {product.discountPrice || product.price}</span>
          {product.discountPrice && (
            <span className="text-[10px] md:text-xs text-slate-400 line-through">৳ {product.price}</span>
          )}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:grid grid-cols-2 gap-2 mt-4">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition"
          >
            <ShoppingCart size={14}/>
            {t('Cart', 'কার্ট')}
          </button>
          <button 
            onClick={onClick}
            className="flex items-center justify-center gap-2 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg"
          >
            <Zap size={14}/>
            {t('View', 'দেখুন')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
