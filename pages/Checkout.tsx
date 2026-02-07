
import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';
import { Sale, SaleItem, OrderStatus } from '../types';
import { 
  CheckCircle, Truck, CreditCard, Phone, MapPin, 
  User, ChevronLeft, Wallet, Calculator, Building2, 
  MessageCircle, ShoppingBag, ArrowRight, Loader2
} from 'lucide-react';

const Checkout: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, total, clearCart } = useCart();
  const { t } = useLanguage();
  const { recordSale } = useProducts();
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | 'Due'>('COD');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Inside Dhaka',
  });

  // Calculate Due logic
  useEffect(() => {
    if (paymentMethod === 'Online') {
      setPaidAmount(total);
    } else if (paymentMethod === 'COD') {
      setPaidAmount(0);
    }
  }, [paymentMethod, total]);

  const dueAmount = Math.max(0, total - paidAmount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const id = 'GE-' + Math.floor(Math.random() * 900000 + 100000);

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
      customerAddress: shippingInfo.address,
      customerCity: shippingInfo.city,
      items: saleItems,
      subtotal: total,
      discount: 0,
      total: total,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod === 'Online' ? 'Online Payment' : 'Credit/Due',
      status: 'Pending',
      date: new Date().toISOString()
    };

    try {
      await recordSale(newSale);
      setOrderId(id);
      setIsOrdered(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error) {
      alert(t("Something went wrong. Please try again.", "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"));
    } finally {
      setSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-10">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <CheckCircle size={80} />
          </div>
          <div className="absolute -top-2 -right-2 bg-blue-900 text-white p-2 rounded-full animate-pulse">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('Order Confirmed!', 'অর্ডার কনফার্ম হয়েছে!')}
          </h2>
          <div className="inline-block px-6 py-2 bg-blue-50 border-2 border-blue-100 rounded-2xl text-blue-900 font-mono font-black text-xl">
            #{orderId}
          </div>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            {t('Thank you for choosing Grameen Energy. Our team will call you shortly to verify your delivery address.', 'গ্রামিন এনার্জি থেকে কেনাকাটা করার জন্য ধন্যবাদ। আমাদের টিম শীঘ্রই ফোন দিয়ে আপনার ঠিকানাটি ভেরিফাই করবে।')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-6">
          <button 
            onClick={() => onNavigate('home')}
            className="px-8 py-5 bg-gray-100 text-gray-700 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition"
          >
            {t('Back to Home', 'হোমে ফিরে যান')}
          </button>
          <a 
            href={`https://wa.me/880123456789?text=Assalamu Alaikum, I just placed an order with Grameen Energy. Order ID: ${orderId}`} 
            target="_blank"
            className="px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-200"
          >
            <MessageCircle size={20} />
            {t('WhatsApp Confirm', 'হোয়াটসঅ্যাপে জানান')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => onNavigate('cart')}
        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 font-black uppercase text-xs tracking-[0.2em] transition"
      >
        <ChevronLeft size={16} />
        {t('Back to Cart', 'কার্টে ফিরে যান')}
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1 space-y-10">
          <header>
            <h1 className="text-4xl font-black text-blue-900 tracking-tight uppercase">
              {t('Finalize Order', 'অর্ডার সম্পন্ন করুন')}
            </h1>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-widest">
              {t('Secure Checkout for Grameen Energy', 'গ্রামিন এনার্জি সিকিউর চেকআউট')}
            </p>
          </header>

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-12">
            {/* Step 1: Customer Info */}
            <section className="bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-blue-50 space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t('1. Customer Information', '১. ক্রেতার তথ্য')}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{t('Enter your real name and active phone', 'আপনার সঠিক নাম এবং সচল ফোন নম্বর দিন')}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Full Name', 'পুরো নাম')}</label>
                  <input 
                    required 
                    type="text" 
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    placeholder={t('Enter your name', 'আপনার নাম লিখুন')}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white transition font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Phone Number', 'ফোন নম্বর')}</label>
                  <input 
                    required 
                    type="tel" 
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white transition font-bold font-mono"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Delivery Details */}
            <section className="bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-blue-50 space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t('2. Delivery Address', '২. ডেলিভারি ঠিকানা')}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{t('Where should we deliver your power products?', 'আপনার পণ্যগুলো আমরা কোথায় পৌঁছে দেব?')}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Delivery Area', 'ডেলিভারি এরিয়া')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Inside Dhaka', 'Outside Dhaka'].map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setShippingInfo({...shippingInfo, city: area})}
                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition ${shippingInfo.city === area ? 'bg-blue-900 border-blue-900 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                      >
                        {t(area, area === 'Inside Dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Full Detailed Address', 'বিস্তারিত ঠিকানা')}</label>
                  <textarea 
                    required 
                    rows={3}
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder={t('House No, Street Name, Police Station, District...', 'বাসা নম্বর, রাস্তা, থানা, জেলা...')}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white transition font-bold resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-blue-50 space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t('3. Payment Settlement', '৩. পেমেন্ট ও বকেয়া')}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{t('Choose how you want to pay', 'আপনি কিভাবে পেমেন্ট করতে চান?')}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { id: 'COD', label: 'Cash on Delivery', labelBn: 'ক্যাশ অন ডেলিভারি', icon: Truck },
                  { id: 'Online', label: 'Online Payment', labelBn: 'অনলাইন পেমেন্ট', icon: CreditCard },
                  { id: 'Due', label: 'Partial/Credit', labelBn: 'বাকি/আংশিক', icon: Wallet },
                ].map((method) => (
                  <button 
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all ${paymentMethod === method.id ? 'border-blue-900 bg-blue-50 scale-105 shadow-xl shadow-blue-900/5' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    <method.icon className={paymentMethod === method.id ? 'text-blue-900' : 'text-slate-300'} size={28} />
                    <p className="font-black text-[10px] uppercase tracking-widest text-center">{t(method.label, method.labelBn)}</p>
                  </button>
                ))}
              </div>

              {/* Due Calculator UI */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                 <div className="grid md:grid-cols-2 gap-8 items-center">
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 text-emerald-400">
                       <Calculator size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{t('Enter Paid Amount', 'জমা টাকার পরিমাণ')}</span>
                     </div>
                     <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-600">৳</span>
                       <input 
                         type="number"
                         value={paidAmount}
                         onChange={(e) => setPaidAmount(Number(e.target.value))}
                         className="w-full pl-12 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-2xl text-4xl font-black outline-none focus:border-emerald-500 transition"
                       />
                     </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-4">
                        <span className="text-slate-400 uppercase tracking-widest">{t('Grand Total', 'সর্বমোট বিল')}</span>
                        <span className="text-xl font-black">৳ {total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {dueAmount > 0 ? t('Remaining Due', 'বাকি রয়েছে') : t('Fully Paid', 'সম্পূর্ণ পরিশোধিত')}
                        </span>
                        <span className={`text-3xl font-black ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          ৳ {dueAmount}
                        </span>
                      </div>
                   </div>
                 </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sidebar Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-blue-50">
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight mb-8 pb-4 border-b border-gray-50">
                {t('Order Summary', 'অর্ডার সামারি')}
              </h3>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 p-2 group-hover:scale-105 transition">
                      <img src={item.image} className="w-full h-full object-cover rounded-lg" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-800 truncate">{t(item.name, item.nameBn)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        ৳{(item.discountPrice || item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-sm text-blue-900">৳{(item.discountPrice || item.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>{t('Subtotal', 'সাবটোটাল')}</span>
                  <span>৳ {total}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  <span>{t('Shipping', 'শিপিং চার্জ')}</span>
                  <span>{t('FREE', 'ফ্রি')}</span>
                </div>
                <div className="flex justify-between items-center pt-4 text-3xl font-black text-blue-900">
                  <span>{t('Total', 'মোট')}</span>
                  <span>৳ {total}</span>
                </div>
              </div>

              <button 
                form="checkout-form"
                type="submit"
                disabled={submitting}
                className="w-full mt-10 bg-blue-900 py-6 rounded-3xl font-black text-sm text-white uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-800 transition transform active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} className="text-emerald-400" />}
                {submitting ? t('Processing...', 'প্রসেসিং হচ্ছে...') : t('Confirm & Place Order', 'অর্ডার কনফার্ম করুন')}
              </button>
              
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                {t('By confirming, you agree to our Terms & Service', 'অর্ডার নিশ্চিত করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
