
import React from 'react';
import { Product } from '../types';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { ShoppingCart, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition group overflow-hidden border border-gray-100">
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={onClick}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.isOffer && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {t('Offer', 'অফার')}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</div>
        <h3 className="font-bold text-gray-900 mb-2 truncate" title={t(product.name, product.nameBn)}>
          {t(product.name, product.nameBn)}
        </h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-blue-800">৳ {product.discountPrice || product.price}</span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">৳ {product.price}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition"
          >
            <ShoppingCart size={16}/>
            {t('Cart', 'কার্ট')}
          </button>
          <button 
            onClick={onClick}
            className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition font-semibold"
          >
            <Zap size={16}/>
            {t('Details', 'বিস্তারিত')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
