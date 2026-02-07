
import React, { useState } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Search, MapPin, Package, Truck, CheckCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { Sale } from '../types';

const OrderTracking: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { sales } = useProducts();
  const { t } = useLanguage();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [foundOrder, setFoundOrder] = useState<Sale | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const order = sales.find(s => 
      s.id.toLowerCase() === orderId.toLowerCase() && 
      s.customerPhone === phone
    );
    setFoundOrder(order || null);
    setSearched(true);
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest mb-8 transition"
      >
        <ChevronLeft size={14}/> {t('Back to Home', 'হোমে ফিরে যান')}
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-12 bg-blue-900 text-white text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{t('Track Your Order', 'অর্ডার ট্র্যাকিং')}</h1>
          <p className="text-blue-200 text-sm font-bold">{t('Check your delivery status in real-time', 'রিয়েল-টাইম ডেলিভারি আপডেট দেখুন')}</p>
        </div>

        <div className="p-12">
          <form onSubmit={handleTrack} className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Order ID', 'অর্ডার আইডি')}</label>
              <input 
                required
                type="text" 
                placeholder="GE-XXXXXX" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold font-mono border-2 border-transparent focus:border-blue-500/10 outline-none transition" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Phone Number', 'ফোন নম্বর')}</label>
              <div className="flex gap-4">
                <input 
                  required
                  type="tel" 
                  placeholder="01XXXXXXXXX" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl font-bold font-mono border-2 border-transparent focus:border-blue-500/10 outline-none transition" 
                />
                <button type="submit" className="bg-blue-900 text-white px-8 rounded-2xl hover:bg-blue-800 transition shadow-xl shadow-blue-900/10">
                  <Search size={24}/>
                </button>
              </div>
            </div>
          </form>

          {searched && !foundOrder && (
            <div className="p-12 bg-red-50 text-red-600 rounded-[2rem] text-center font-bold">
              {t('No order found with these details. Please check again.', 'এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।')}
            </div>
          )}

          {foundOrder && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Current Status', 'বর্তমান অবস্থা')}</p>
                  <p className="text-2xl font-black text-blue-900 uppercase">{foundOrder.status}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Estimated Delivery', 'সম্ভাব্য ডেলিভারি')}</p>
                  <p className="text-xl font-bold text-slate-700">2-3 Business Days</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-1 transition-all duration-1000"
                  style={{ width: `${(getStatusStep(foundOrder.status) / 3) * 100}%` }}
                ></div>
                
                <div className="relative z-10 flex justify-between">
                  {[
                    { label: 'Pending', icon: Package, labelBn: 'পেন্ডিং' },
                    { label: 'Processing', icon: Loader2, labelBn: 'প্রসেসিং' },
                    { label: 'Shipped', icon: Truck, labelBn: 'শিফট' },
                    { label: 'Delivered', icon: CheckCircle, labelBn: 'ডেলিভার্ড' },
                  ].map((step, i) => {
                    const isActive = getStatusStep(foundOrder.status) >= i;
                    return (
                      <div key={step.label} className="flex flex-col items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-white border-emerald-500 text-emerald-500 shadow-xl' : 'bg-white border-slate-100 text-slate-300'}`}>
                          <step.icon size={24} className={step.label === 'Processing' && foundOrder.status === 'Processing' ? 'animate-spin' : ''} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{t(step.label, step.labelBn)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-8 bg-blue-900 text-white rounded-[2.5rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={24}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{t('Shipping Address', 'শিপিং ঠিকানা')}</p>
                  <p className="text-sm font-bold">{foundOrder.customerAddress}, {foundOrder.customerCity}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
