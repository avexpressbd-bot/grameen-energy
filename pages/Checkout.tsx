// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';
import { useAuth } from '../components/AuthContext';
import { Sale, SaleItem, OrderStatus } from '../types';
import { 
  CheckCircle, Truck, CreditCard, Phone, MapPin, 
  User as UserIcon, ChevronLeft, Wallet, Calculator, Building2, 
  MessageCircle, ShoppingBag, ArrowRight, Loader2
} from 'lucide-react';

const Checkout: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, total: cartTotal, clearCart } = useCart();
  const { t } = useLanguage();
  const { recordSale } = useProducts();
  const { user } = useAuth();
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | 'Due'>('COD');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Inside Dhaka',
  });

  // Re-sync if user logs in during checkout
  useEffect(() => {
    if (user) {
      setShippingInfo({
        name: user.name,
        phone: user.phone,
        address: user.address || '',
        city: user.city || 'Inside Dhaka'
      });
    }
  }, [user]);

  // Dynamic delivery charge
  const deliveryFee = shippingInfo.city === 'Inside Dhaka' ? 60 : 120;
  const grandTotal = cartTotal + deliveryFee;

  useEffect(() => {
    if (paymentMethod === 'Online') {
      setPaidAmount(grandTotal);
    } else if (paymentMethod === 'COD') {
      setPaidAmount(0);
    }
  }, [paymentMethod, grandTotal]);

  const dueAmount = Math.max(0, grandTotal - paidAmount);

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
      userId: user?.uid, // Link to account
      customerName: shippingInfo.name,
      customerPhone: shippingInfo.phone,
      customerAddress: shippingInfo.address,
      customerCity: shippingInfo.city,
      items: saleItems,
      subtotal: cartTotal,
      discount: 0,
      total: grandTotal,
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
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">{t('Order Confirmed!', 'অর্ডার কনফার্ম হয়েছে!')}</h2>
          <div className="inline-block px-6 py-2 bg-blue-50 border-2 border-blue-100 rounded-2xl text-blue-900 font-mono font-black text-xl">#{orderId}</div>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">{t('Our team will call you shortly to verify your delivery.', 'আমাদের টিম শীঘ্রই ফোন দিয়ে অর্ডারটি ভেরিফাই করবে।')}</p>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={() => onNavigate('home')} className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase text-xs tracking-widest">{t('Back to Home', 'হোমে ফিরে যান')}</button>
          <a href={`https://wa.me/880123456789?text=Order ID: ${orderId}`} target="_blank" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2"><MessageCircle size={18}/> {t('WhatsApp Us', 'হোয়াটসঅ্যাপ')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-4xl font-black text-blue-900 tracking-tight uppercase">{t('Checkout', 'চেকআউট')}</h1>
        {!user && (
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-4">
            <p className="text-xs font-bold text-blue-700">{t('Already a member?', 'ইতিমধ্যে মেম্বার কি?')}</p>
            <button 
              onClick={() => onNavigate('customer-auth')}
              className="text-xs font-black uppercase tracking-widest text-blue-900 hover:underline"
            >
              {t('Login Now', 'লগইন করুন')}
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3"><UserIcon size={20}/> {t('1. Customer Info', '১. তথ্য')}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input required type="text" value={shippingInfo.name} onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} placeholder={t('Full Name', 'পুরো নাম')} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" />
                <input required type="tel" value={shippingInfo.phone} onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} placeholder="01XXXXXXXXX" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold font-mono" />
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3"><MapPin size={20}/> {t('2. Delivery Address', '২. ঠিকানা')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Inside Dhaka', 'Outside Dhaka'].map(area => (
                  <button key={area} type="button" onClick={() => setShippingInfo({...shippingInfo, city: area})} className={`py-4 rounded-2xl font-black text-xs uppercase ${shippingInfo.city === area ? 'bg-blue-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>
                    {t(area, area === 'Inside Dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে')}
                  </button>
                ))}
              </div>
              <textarea required rows={3} value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} placeholder={t('Full Address...', 'বিস্তারিত ঠিকানা...')} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" />
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3"><CreditCard size={20}/> {t('3. Payment', '৩. পেমেন্ট')}</h3>
              <div className="grid grid-cols-3 gap-4">
                {['COD', 'Online', 'Due'].map(m => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m as any)} className={`py-4 rounded-2xl font-black text-xs uppercase ${paymentMethod === m ? 'bg-blue-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>
                    {t(m, m === 'COD' ? 'ক্যাশ' : m === 'Online' ? 'অনলাইন' : 'বাকি')}
                  </button>
                ))}
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl text-white">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400">Paid Amount</span>
                  <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="bg-white/10 px-4 py-2 rounded-xl text-xl font-black text-right w-32 outline-none border border-white/10" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Remaining Due</span>
                  <span className={`text-2xl font-black ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>৳ {dueAmount}</span>
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-xl font-black text-blue-900 uppercase border-b pb-4">{t('Order Summary', 'অর্ডার সামারি')}</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">{item.quantity}x {t(item.name, item.nameBn)}</span>
                  <span className="text-slate-900 font-black">৳{(item.discountPrice || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-xs font-bold text-slate-400"><span>Subtotal</span><span>৳ {cartTotal}</span></div>
              <div className="flex justify-between text-xs font-bold text-emerald-600"><span>Delivery ({shippingInfo.city})</span><span>৳ {deliveryFee}</span></div>
              <div className="flex justify-between text-2xl font-black text-blue-900 pt-2"><span>Total</span><span>৳ {grandTotal}</span></div>
            </div>
            <button form="checkout-form" type="submit" disabled={submitting} className="w-full py-5 bg-blue-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
              {submitting ? <Loader2 className="animate-spin" /> : <ShoppingBag size={20} />}
              {t('Confirm Order', 'অর্ডার নিশ্চিত করুন')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;