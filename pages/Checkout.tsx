
import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle, Truck, CreditCard, Building2, Phone, MapPin, User, ChevronLeft } from 'lucide-react';

const Checkout: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, total, clearCart } = useCart();
  const { t } = useLanguage();
  const [isOrdered, setIsOrdered] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to an API
    setIsOrdered(true);
    clearCart();
    window.scrollTo(0, 0);
  };

  if (isOrdered) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
          <CheckCircle size={56} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">{t('Order Placed Successfully!', 'অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!')}</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            {t('Thank you for shopping with Grameen Energy. Your order ID is #GE-' + Math.floor(Math.random() * 90000 + 10000) + '. We will contact you shortly.', 'গ্রামিন এনার্জি থেকে কেনাকাটা করার জন্য ধন্যবাদ। আপনার অর্ডার আইডি #GE-' + Math.floor(Math.random() * 90000 + 10000) + '। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।')}
          </p>
        </div>
        <button 
          onClick={() => onNavigate('home')}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-xl"
        >
          {t('Back to Home', 'হোমে ফিরে যান')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => onNavigate('cart')}
        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 font-medium transition"
      >
        <ChevronLeft size={20} />
        {t('Back to Cart', 'কার্টে ফিরে যান')}
      </button>

      <h1 className="text-3xl font-bold text-blue-900 mb-8">{t('Checkout', 'চেকআউট')}</h1>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Information */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-blue-900">
              <User size={24} className="text-emerald-600" />
              {t('Shipping Information', 'শিপিং তথ্য')}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t('Full Name', 'পুরো নাম')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    required 
                    type="text" 
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    placeholder={t('Enter your name', 'আপনার নাম লিখুন')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t('Phone Number', 'ফোন নম্বর')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    required 
                    type="tel" 
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t('Full Address', 'পুরো ঠিকানা')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea 
                    required 
                    rows={3}
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder={t('House/Road/Area...', 'বাড়ি/রাস্তা/এলাকা...')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t('City', 'শহর')}</label>
                <select 
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-blue-900">
              <CreditCard size={24} className="text-emerald-600" />
              {t('Payment Method', 'পেমেন্ট পদ্ধতি')}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition text-center ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <Truck className={paymentMethod === 'cash' ? 'text-emerald-600' : 'text-gray-400'} size={32} />
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{t('Cash on Delivery', 'ক্যাশ অন ডেলিভারি')}</p>
                  <p className="text-xs text-gray-500">{t('Pay when you receive the product', 'পণ্য বুঝে পেয়ে মূল্য দিন')}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition text-center ${paymentMethod === 'bkash' ? 'border-[#D12053] bg-pink-50 ring-4 ring-pink-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="h-10 w-auto" alt="bKash" />
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{t('bKash', 'বিকাশ')}</p>
                  <p className="text-xs text-gray-500">{t('Fast & Secure Payment', 'দ্রুত ও নিরাপদ পেমেন্ট')}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition text-center ${paymentMethod === 'nagad' ? 'border-[#ED1C24] bg-red-50 ring-4 ring-red-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8c/Nagad_Logo.svg" className="h-10 w-auto" alt="Nagad" />
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{t('Nagad', 'নগদ')}</p>
                  <p className="text-xs text-gray-500">{t('Digital Financial Service', 'ডিজিটাল পেমেন্ট সার্ভিস')}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition text-center ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <Building2 className={paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-400'} size={32} />
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{t('Bank Transfer', 'ব্যাংক ট্রান্সফার')}</p>
                  <p className="text-xs text-gray-500">{t('Direct bank payment', 'সরাসরি ব্যাংক পেমেন্ট')}</p>
                </div>
              </button>
            </div>

            {paymentMethod !== 'cash' && (
              <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-600 animate-in fade-in duration-300">
                <p className="font-bold mb-1">{t('Instructions:', 'নির্দেশনা:')}</p>
                <p>{t('Please send the total amount to ', 'অনুগ্রহ করে মোট টাকাটি নিচের নম্বরে পাঠান: ')} 
                   <span className="font-bold text-gray-900">01XXX-XXXXXX</span> 
                   {t(' and use your Phone Number as reference.', ' এবং রেফারেন্স হিসেবে আপনার ফোন নম্বর ব্যবহার করুন।')}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border sticky top-24 space-y-6">
            <h3 className="text-xl font-bold border-b pb-4 text-blue-900">{t('Order Summary', 'অর্ডার সামারি')}</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{t(item.name, item.nameBn)}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">৳ {(item.discountPrice || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>{t('Subtotal', 'সাবটোটাল')}</span>
                <span>৳ {total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('Shipping Fee', 'শিপিং চার্জ')}</span>
                <span className="text-emerald-600 font-bold">{t('Free', 'ফ্রি')}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-blue-900 pt-2 border-t">
                <span>{t('Total', 'মোট')}</span>
                <span>৳ {total}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-xl shadow-emerald-50 text-lg"
            >
              {t('Confirm Order', 'অর্ডার নিশ্চিত করুন')}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <CreditCard size={14} />
              {t('Secure SSL Checkout', 'এসএসএল এনক্রিপ্টেড পেমেন্ট')}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
