// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../components/AuthContext';
import { ServiceAd, ServiceStatus } from '../types';
import { 
  Zap, Phone, MessageSquare, Calendar, Clock, MapPin, 
  Info, Camera, ChevronRight, CheckCircle2, AlertTriangle, 
  Wrench, ShieldCheck, HeartPulse, Hammer, Lightbulb, Settings, X, Loader2, User
} from 'lucide-react';

const Services: React.FC = () => {
  const { serviceAds, addServiceRequest } = useProducts();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    problem: '',
    date: '',
    time: '',
    address: user?.address || '',
    phone: user?.phone || '',
  });

  // Re-sync address if user context changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        address: prev.address || user.address || '',
        phone: prev.phone || user.phone || ''
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
    
    setIsBooking(true);
    try {
      const id = await addServiceRequest({
        customerName: formData.name || 'Guest',
        customerPhone: formData.phone,
        customerAddress: formData.address,
        serviceType: selectedServiceType,
        problemDescription: formData.problem,
        preferredDate: formData.date,
        preferredTime: formData.time,
      });
      setBookingSuccess(id);
      setSelectedServiceType(null);
      // Reset form (keeping user info if logged in)
      setFormData({
        name: user?.name || '',
        problem: '',
        date: '',
        time: '',
        address: user?.address || '',
        phone: user?.phone || '',
      });
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
      {/* Success Modal Overlay */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{t('Request Sent!', 'অনুরোধ পাঠানো হয়েছে!')}</h2>
              <p className="text-slate-500 font-bold leading-relaxed">
                {t(`Your service request (ID: ${bookingSuccess}) has been received. Our team will contact you soon.`, `আপনার সার্ভিস রিকোয়েস্ট (ID: ${bookingSuccess}) সফলভাবে পাওয়া গেছে। আমাদের টিম আপনার সাথে দ্রুত যোগাযোগ করবেন।`)}
              </p>
              <button 
                onClick={() => setBookingSuccess(null)}
                className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition"
              >
                {t('Great, Thanks!', 'ঠিক আছে, ধন্যবাদ')}
              </button>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedServiceType && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 duration-500 my-8">
              <div className="p-8 bg-blue-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                   <Wrench size={20} className="text-emerald-400" />
                   {t('Book', 'বুক করুন')} {selectedServiceType}
                 </h3>
                 <button onClick={() => setSelectedServiceType(null)} className="p-2 hover:bg-white/10 rounded-xl transition">
                   <X size={24}/>
                 </button>
              </div>
              <form onSubmit={handleBook} className="p-8 space-y-5">
                 {/* New Customer Name Field */}
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Your Name', 'আপনার নাম')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder={t('Enter your full name', 'আপনার পুরো নাম লিখুন')}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 transition"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Problem Summary', 'সমস্যার বর্ণনা')}</label>
                    <textarea 
                      required
                      placeholder={t('Briefly explain the issue...', 'আপনার সমস্যাটি সংক্ষেপে লিখুন...')}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 transition"
                      value={formData.problem}
                      onChange={e => setFormData({...formData, problem: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Preferred Date', 'নির্ধারিত তারিখ')}</label>
                      <input 
                        required
                        type="date"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Preferred Time', 'নির্ধারিত সময়')}</label>
                      <input 
                        required
                        type="time"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Contact Phone', 'ফোন নম্বর')}</label>
                    <input 
                      required
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold font-mono outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Full Address', 'পুরো ঠিকানা')}</label>
                    <input 
                      required
                      type="text"
                      placeholder={t('House, Road, Area...', 'বাসা, রোড, এলাকা...')}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                 </div>

                 <button 
                   disabled={isBooking}
                   type="submit"
                   className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition transform active:scale-95 disabled:opacity-50 mt-4"
                 >
                   {isBooking ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20}/>}
                   {isBooking ? t('Processing...', 'অপেক্ষা করুন...') : t('Confirm Booking', 'বুকিং নিশ্চিত করুন')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="text-center space-y-6 max-w-3xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <Wrench size={14}/> {t('Trusted Experts', 'বিশ্বস্ত বিশেষজ্ঞ')}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-tight">
          {t('Professional Energy Services', 'পেশাদার এনার্জি সার্ভিস')}
        </h1>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          {t('Reliable solutions for all your power needs. From home wiring to solar setup, our certified technicians are ready to help.', 'আপনার আইপিএস, সোলার এবং ইলেকট্রিক্যাল সমস্যার সমাধানে দক্ষ টেকনিশিয়ান বেছে নিন। আমরা দিচ্ছি দ্রুত ও নিরাপদ সার্ভিস।')}
        </p>
      </header>

      {/* Standard Service Quick Booking */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t('Quick Booking', 'দ্রুত বুকিং')}</h2>
            <p className="text-slate-400 font-bold text-sm">{t('Select a category to request an expert immediately', 'তাত্ক্ষণিক সার্ভিসের জন্য নিচের একটি ক্যাটাগরি বেছে নিন')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {standardServices.map((service) => (
            <button 
              key={service.id}
              onClick={() => setSelectedServiceType(language === 'en' ? service.title : service.titleBn)}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>
              <span className="text-xs font-black text-slate-700 text-center uppercase tracking-tight">
                {language === 'en' ? service.title : service.titleBn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* customizedAds Section */}
      {serviceAds.length > 0 && (
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t('Special Offers', 'বিশেষ সার্ভিস অফার')}</h2>
              <p className="text-slate-400 font-bold text-sm">{t('Premium service packages at competitive prices', 'সাশ্রয়ী মূল্যে প্রিমিয়াম সার্ভিস প্যাকেজসমূহ')}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAds.map(ad => (
              <div key={ad.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <img src={ad.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                  {ad.isEmergency && (
                    <span className="absolute top-6 left-6 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                      <HeartPulse size={14} className="animate-pulse" /> {t('Emergency', 'জরুরী')}
                    </span>
                  )}
                  {ad.hasOffer && (
                    <span className="absolute top-6 right-6 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {t('Promo Offer', 'অফার')}
                    </span>
                  )}
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{ad.category}</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{t(ad.title, ad.titleBn)}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin size={18} className="text-blue-500" />
                      <span className="text-xs font-bold">{ad.areaCoverage}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock size={18} className="text-emerald-500" />
                      <span className="text-xs font-bold">{ad.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Starting From</p>
                       <p className="text-2xl font-black text-blue-900">{ad.priceLabel}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedServiceType(language === 'en' ? ad.title : ad.titleBn)}
                      className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-800 transition shadow-xl"
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

      {/* Trust & Process Section */}
      <section className="bg-slate-950 rounded-[4rem] p-12 md:p-20 text-white overflow-hidden relative">
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              {t('Why Choose Our Services?', 'কেন আমাদের সার্ভিস নেবেন?')}
            </h2>
            <div className="space-y-6">
               {[
                 { icon: ShieldCheck, color: 'text-emerald-400', title: t('Certified Safety', 'নিরাপদ সার্ভিস'), desc: t('All technicians are background checked and safety certified.', 'সকল টেকনিশিয়ান অভিজ্ঞ এবং তাদের তথ্য যাচাইকৃত।') },
                 { icon: Settings, color: 'text-blue-400', title: t('Genuine Parts', 'আসল খুচরা যন্ত্রাংশ'), desc: t('We only use original electrical parts with warranty.', 'মেরামতে আমরা শুধুমাত্র আসল ইলেকট্রিক্যাল পার্টস ব্যবহার করি।') },
                 { icon: HeartPulse, color: 'text-red-400', title: t('Emergency Support', 'জরুরী সেবা'), desc: t('Get help within 60 minutes for urgent electrical hazards.', 'জরুরী প্রয়োজনে ৬০ মিনিটের মধ্যে আমাদের প্রতিনিধি পৌঁছে যাবে।') },
               ].map((item, i) => (
                 <div key={i} className="flex gap-6 group">
                    <div className={`w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                       <item.icon size={28} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight">{item.title}</h4>
                       <p className="text-slate-400 font-medium leading-relaxed mt-1">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-white/5 rounded-[3rem] p-4 border border-white/10 relative">
               <img 
                 src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" 
                 className="w-full h-full object-cover rounded-[2.5rem] opacity-60 grayscale hover:grayscale-0 transition duration-1000"
                 alt="Work"
               />
               <div className="absolute -bottom-6 -left-6 bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl">
                  <p className="text-4xl font-black">100%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">{t('Satisfaction Guaranteed', 'সন্তুষ্টির নিশ্চয়তা')}</p>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
      </section>
    </div>
  );
};

export default Services;
