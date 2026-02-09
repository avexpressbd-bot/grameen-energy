// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../components/AuthContext';
import { 
  Zap, Calendar, Clock, MapPin, ChevronRight, CheckCircle2, 
  Wrench, ShieldCheck, HeartPulse, Hammer, Lightbulb, Settings, X, Loader2, User
} from 'lucide-react';

const Services: React.FC = () => {
  const { serviceAds = [], addServiceRequest } = useProducts();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    problem: '',
    date: '',
    time: '',
    address: '',
    phone: '',
  });

  // Sync user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        address: user.address || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const standardServices = [
    { id: 'ips', icon: Zap, color: 'bg-blue-100 text-blue-600', title: 'IPS Service', titleBn: 'আইপিএস সার্ভিস' },
    { id: 'solar', icon: Lightbulb, color: 'bg-amber-100 text-amber-600', title: 'Solar Service', titleBn: 'সোলার সার্ভিস' },
    { id: 'electrical', icon: Hammer, color: 'bg-emerald-100 text-emerald-600', title: 'Electrical Service', titleBn: 'ইলেকট্রিক্যাল সার্ভিস' },
    { id: 'repair', icon: Wrench, color: 'bg-purple-100 text-purple-600', title: 'Repair Service', titleBn: 'মেরামত সার্ভিস' },
    { id: 'install', icon: Settings, color: 'bg-indigo-100 text-indigo-600', title: 'Installation', titleBn: 'ইনস্টলেশন সার্ভিস' },
    { id: 'emergency', icon: HeartPulse, color: 'bg-red-100 text-red-600', title: 'Emergency Work', titleBn: 'জরুরী ইলেকট্রিক কাজ' },
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceType) return;
    if (!formData.name || !formData.phone) {
      alert("Please enter name and phone number");
      return;
    }
    
    setIsBooking(true);
    try {
      const id = await addServiceRequest({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        serviceType: selectedServiceType,
        problemDescription: formData.problem,
        preferredDate: formData.date,
        preferredTime: formData.time,
      });
      setBookingSuccess(id);
      setSelectedServiceType(null);
      setFormData(prev => ({ ...prev, problem: '', date: '', time: '' }));
    } catch (err) {
      console.error(err);
      alert("Error placing request. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900">{t('Confirmed!', 'সফল হয়েছে!')}</h2>
              <p className="text-slate-500 font-bold">
                {t(`Service ID: ${bookingSuccess}. Our expert will contact you shortly.`, `সার্ভিস আইডি: ${bookingSuccess}। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।`)}
              </p>
              <button 
                onClick={() => setBookingSuccess(null)}
                className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition"
              >
                {t('OK, Great!', 'ঠিক আছে')}
              </button>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedServiceType && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden my-8">
              <div className="p-8 bg-blue-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase flex items-center gap-3">
                   <Wrench size={20} className="text-emerald-400" />
                   {t('Book', 'বুক করুন')} {selectedServiceType}
                 </h3>
                 <button onClick={() => setSelectedServiceType(null)} className="p-2 hover:bg-white/10 rounded-xl transition">
                   <X size={24}/>
                 </button>
              </div>
              <form onSubmit={handleBook} className="p-8 space-y-5">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Full Name', 'আপনার নাম')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder={t('Enter your name', 'আপনার নাম লিখুন')}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 transition"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Phone', 'ফোন নম্বর')}</label>
                      <input 
                        required
                        type="tel"
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold font-mono outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Date', 'তারিখ')}</label>
                      <input 
                        required
                        type="date"
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Problem Summary', 'সমস্যার বিবরণ')}</label>
                    <textarea 
                      required
                      placeholder={t('Briefly explain the issue...', 'আপনার সমস্যাটি সংক্ষেপে লিখুন...')}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                      value={formData.problem}
                      onChange={e => setFormData({...formData, problem: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Full Address', 'ঠিকানা')}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                 </div>

                 <button 
                   disabled={isBooking}
                   type="submit"
                   className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition transform active:scale-95 disabled:opacity-50"
                 >
                   {isBooking ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20}/>}
                   {isBooking ? t('Processing...', 'অপেক্ষা করুন...') : t('Confirm Booking', 'বুকিং নিশ্চিত করুন')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Hero */}
      <header className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <Wrench size={14}/> {t('Professional Experts', 'প্রফেশনাল সার্ভিস')}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
          {t('Home Energy Services', 'হোম এনার্জি সার্ভিস')}
        </h1>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
          {t('Certified technicians for IPS, Solar, and Electrical maintenance at your doorstep.', 'আপনার ইলেকট্রিক্যাল সমস্যার সমাধানে দক্ষ টেকনিশিয়ান বেছে নিন।')}
        </p>
      </header>

      {/* Grid of services */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {standardServices.map((service) => (
          <button 
            key={service.id}
            onClick={() => setSelectedServiceType(language === 'en' ? service.title : service.titleBn)}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
          >
            <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mb-4 transition-transform`}>
              <service.icon size={28} />
            </div>
            <span className="text-xs font-black text-slate-700 text-center uppercase tracking-tight">
              {language === 'en' ? service.title : service.titleBn}
            </span>
          </button>
        ))}
      </section>

      {/* customizedAds Section */}
      {serviceAds && serviceAds.length > 0 && (
        <section className="space-y-10 pt-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t('Service Offers', 'সার্ভিস অফার')}</h2>
            <p className="text-slate-400 font-bold text-sm">{t('Save more with our premium service packages', 'আমাদের প্রিমিয়াম সার্ভিস প্যাকেজসমূহ')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAds.map(ad => (
              <div key={ad.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
                <div className="relative h-56">
                  <img src={ad.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-black text-slate-900">{t(ad.title, ad.titleBn)}</h3>
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-xl font-black text-blue-900">{ad.priceLabel}</p>
                    <button 
                      onClick={() => setSelectedServiceType(language === 'en' ? ad.title : ad.titleBn)}
                      className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-800 transition"
                    >
                      {t('Book Now', 'বুক করুন')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white text-center space-y-6">
        <h2 className="text-3xl font-black uppercase">{t('Why Trust Us?', 'কেন আমাদের বেছে নেবেন?')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <ShieldCheck size={40} className="mx-auto text-emerald-400" />
            <p className="font-black uppercase text-xs tracking-widest">{t('Verified Pros', 'ভেরিফাইড এক্সপার্ট')}</p>
          </div>
          <div className="space-y-2">
            <Settings size={40} className="mx-auto text-blue-400" />
            <p className="font-black uppercase text-xs tracking-widest">{t('Quick Fix', 'দ্রুত সমাধান')}</p>
          </div>
          <div className="space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
            <p className="font-black uppercase text-xs tracking-widest">{t('Warranty', 'সার্ভিস ওয়ারেন্টি')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
