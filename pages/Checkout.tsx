
import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';
import { Sale, SaleItem } from '../types';
import { CheckCircle, Truck, CreditCard, Phone, MapPin, User, ChevronLeft, Wallet, Calculator } from 'lucide-react';

const Checkout: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, total, clearCart } = useCart();
  const { t } = useLanguage();
  const { recordSale } = useProducts();
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'due'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(total);

  // Default paid amount to total when switching to full payment methods
  useEffect(() => {
    if (paymentMethod !== 'due') {
      setPaidAmount(total);
    } else {
      setPaidAmount(0);
    }
  }, [paymentMethod, total]);

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
  });

  const dueAmount = Math.max(0, total - paidAmount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dueAmount > 0 && !shippingInfo.phone) {
      alert(t('Phone number is required for due orders!', 'বাকি অর্ডারের জন্য ফোন নম্বর অবশ্যই দিতে হবে!'));
      return;
    }

    const id = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);

    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.id,
      name: item.nameBn,
      quantity: item.quantity,
      unitPrice: item.discountPrice || item.price,
      totalPrice: (item.discountPrice || item.price) * item.quantity,
      warranty: item.warranty
    }));

    const newSale: Sale = {
      id,
      customerName: shippingInfo.name,
      customerPhone: shippingInfo.phone,
      items: saleItems,
      subtotal: total,
      discount: 0,
      total: total,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      paymentMethod: paymentMethod.toUpperCase(),
      date: new Date().toISOString()
    };

    try {
      await recordSale(newSale);
      setOrderId(id);
      setIsOrdered(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
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
            {t('Thank you for shopping with Grameen Energy. Your order ID is #' + orderId + '. We will contact you shortly.', 'গ্রামিন এনার্জি থেকে কেনাকাটা করার জন্য ধন্যবাদ। আপনার অর্ডার আইডি #' + orderId + '। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।')}
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
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Information */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-blue-900">
              <User size={24} className="text-emerald-600" />
              {t('Customer Information', 'ক্রেতার তথ্য')}
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
                    placeholder={t('Enter customer name', 'ক্রেতার নাম লিখুন')}
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
                    rows={2}
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder={t('Village/Road/Area...', 'গ্রাম/রাস্তা/এলাকা...')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-blue-900">
              <CreditCard size={24} className="text-emerald-600" />
              {t('Payment & Settlement', 'পেমেন্ট ও বকেয়া হিসাব')}
            </h3>
            
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { id: 'cash', label: 'Cash', labelBn: 'নগদ', icon: Truck },
                { id: 'due', label: 'Due/Credit', labelBn: 'বাকি', icon: Wallet },
                { id: 'bkash', label: 'bKash', labelBn: 'বিকাশ', icon: CreditCard },
                { id: 'nagad', label: 'Nagad', labelBn: 'নগদ', icon: CreditCard },
              ].map((method) => (
                <button 
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition text-center ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <method.icon className={paymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'} size={24} />
                  <p className="font-bold text-xs">{t(method.label, method.labelBn)}</p>
                </button>
              ))}
            </div>

            {/* Custom Payment Input */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
               <div className="grid md:grid-cols-2 gap-8 items-center">
                 <div className="space-y-4">
                   <div className="flex items-center gap-2 text-emerald-400">
                     <Calculator size={18} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('Enter Paid Amount', 'জমা টাকার পরিমাণ')}</span>
                   </div>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">৳</span>
                     <input 
                       type="number"
                       value={paidAmount}
                       onChange={(e) => setPaidAmount(Number(e.target.value))}
                       className="w-full pl-10 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-3xl font-black outline-none focus:border-emerald-500 transition"
                     />
                   </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                      <span className="text-slate-400 font-bold">{t('Grand Total', 'সর্বমোট')}</span>
                      <span className="font-black">৳ {total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {dueAmount > 0 ? t('Remaining Due', 'বাকি রয়েছে') : t('Fully Paid', 'সম্পূর্ণ পরিশোধিত')}
                      </span>
                      <span className={`text-2xl font-black ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ৳ {dueAmount}
                      </span>
                    </div>
                 </div>
               </div>
            </div>
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
              <div className="flex justify-between text-2xl font-black text-blue-900 pt-2 border-t">
                <span>{t('Payable', 'মোট প্রদেয়')}</span>
                <span>৳ {total}</span>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition shadow-xl text-lg uppercase tracking-widest"
            >
              {t('Confirm Order', 'অর্ডার নিশ্চিত করুন')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
