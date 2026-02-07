
import React from 'react';
import { useCart } from '../components/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Trash2, ShoppingBag, ArrowRight, Zap } from 'lucide-react';

const Cart: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, removeFromCart, total } = useCart();
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag size={48}/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('Your cart is empty', 'আপনার কার্ট খালি')}</h2>
        <p className="text-gray-500">{t('Add some electrical essentials to your cart today!', 'আজই আপনার কার্টে ইলেকট্রিক্যাল সামগ্রী যোগ করুন!')}</p>
        <button 
          onClick={() => onNavigate('shop')}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
        >
          {t('Start Shopping', 'শপিং শুরু করুন')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">{t('Your Shopping Cart', 'আপনার শপিং কার্ট')}</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{t(item.name, item.nameBn)}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-bold text-blue-800">৳ {item.discountPrice || item.price}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">Qty: {item.quantity}</span>
                </div>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <h3 className="text-lg font-bold border-b pb-4">{t('Order Summary', 'অর্ডার সামারি')}</h3>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Subtotal', 'সাবটোটাল')}</span>
              <span className="font-bold">৳ {total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Delivery Fee', 'ডেলিভারি চার্জ')}</span>
              <span className="text-emerald-600 font-bold">{t('Free', 'ফ্রি')}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-xl font-black text-blue-900">
              <span>{t('Total', 'মোট')}</span>
              <span>৳ {total}</span>
            </div>
            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              {t('Proceed to Checkout', 'চেকআউট-এ যান')}
              <ArrowRight size={20}/>
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-blue-900">
              <Zap size={18}/>
              {t('Quick Order', 'দ্রুত অর্ডার')}
            </h4>
            <p className="text-sm text-blue-700">{t('Order directly via WhatsApp for faster processing.', 'দ্রুত প্রসেসিংয়ের জন্য সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন।')}</p>
            <a href={`https://wa.me/880123456789?text=I want to order: ${cart.map(i => i.name).join(', ')}`} className="block w-full text-center py-3 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition">
              {t('WhatsApp Direct', 'সরাসরি হোয়াটসঅ্যাপ')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
