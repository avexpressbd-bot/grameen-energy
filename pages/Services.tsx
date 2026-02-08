
import React, { useState } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../components/AuthContext';
import { ServiceAd, ServiceStatus } from '../types';
import { 
  Zap, Phone, MessageSquare, Calendar, Clock, MapPin, 
  Info, Camera, ChevronRight, CheckCircle2, AlertTriangle, 
  Wrench, ShieldCheck, HeartPulse, Hammer, Lightbulb, Settings, PlusCircle, Banknote
} from 'lucide-react';

const Services: React.FC = () => {
  const { serviceAds, addServiceRequest } = useProducts();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    problem: '',
    date: '',
    time: '',
    address: user?.address || '',
    phone: user?.phone || '',
  });

  // Standard services that are always available
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
        customerName: user?.name || 'Guest',
        customerPhone: formData.phone,
        customerAddress: formData.address,
        serviceType: selectedServiceType,
        problemDescription: formData.problem,
        preferredDate: formData.date,
        preferredTime: formData.time,
        // Removed manualPrice from customer booking as per request
      });
      setBookingSuccess(id);
      setSelectedServiceType(null);
      // Reset form
      setFormData({
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
      {/* Hero Section */}
      <header className="text-center space-y-6 max-w-3xl mx-auto">
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

      {/* Customized Ads Section */}
      {serviceAds.length > 0 && (
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t('Specialized Service Packages', 'বিশেষ সার্ভিস প্যাকেজ')}</h2>
              <p className="text-slate-400 font-bold text-sm">{t('Expert solutions with starting price labels', 'আমাদের বিশেষ অফার এবং কাস্টম সার্ভিসগুলো দেখুন')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAds.map(ad => (
              <div key={ad.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
                <div className="relative h-56">
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {ad.isEmergency && (
                      <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <HeartPulse size={12}/> {t('Emergency', 'জরুরী')}
                      </span>
                    )}
                    {ad.hasOffer && (
                      <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {t('Special Offer', 'অফার')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{ad.category}</p>
                    <h3 className="text-2xl font-black text-slate-800">{language === 'en' ? ad.title : ad.titleBn}</h3>
                    <p className="text-sm text-slate-500 font-bold mt-2 line-clamp-2">{ad.descriptionBn}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Time</p>
                      <p className="text-xs font-black text-slate-700">{ad.responseTime}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Starts From</p>
                      <p className="text-xs font-black text-blue-900">৳ {ad.priceLabel}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedServiceType(language === 'en' ? ad.title : ad.titleBn)}
                      className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-800 transition transform active:scale-95"
                    >
                      {t('Book Service', 'বুকিং দিন')}
                    </button>
                    <a 
                      href={`https://wa.me/${ad.id}`} 
                      target="_blank"
                      className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition shadow-lg"
                    >
                      <MessageSquare size={24}/>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* General Inquiry Card */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight">{t('Not sure what you need?', 'নিশ্চিত নন কি সার্ভিস লাগবে?')}</h2>
            <p className="text-blue-200 font-bold max-w-md">{t('Request a custom consultation and our energy experts will analyze your requirements.', 'আমাদের এক্সপার্টদের সাথে কথা বলুন, আমরা আপনার সমস্যার সমাধান খুঁজে দেব।')}</p>
          </div>
          <button 
            onClick={() => setSelectedServiceType(t('Custom Service', 'কাস্টম সার্ভিস'))}
            className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition flex items-center gap-3"
          >
            <PlusCircle size={20}/> {t('Request Custom Service', 'কাস্টম রিকোয়েস্ট')}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </section>

      {/* Booking Modal */}
      {selectedServiceType && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{t('Book Service', 'সার্ভিস বুকিং')}</h3>
                <p className="text-xs font-black text-blue-600 mt-1 uppercase tracking-widest">{selectedServiceType}</p>
              </div>
              <button onClick={() => setSelectedServiceType(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition">✕</button>
            </div>
            
            <form onSubmit={handleBook} className="p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Phone Number', 'ফোন নম্বর')}</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="01XXXXXXXXX" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-blue-50 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Preferred Date', 'পছন্দের তারিখ')}</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Address', 'ঠিকানা')}</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="House, Road, Area..." className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Problem Details', 'সমস্যার বিবরণ')}</label>
                <textarea required rows={3} value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} placeholder="Explain your problem briefly..." className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none resize-none" />
              </div>

              <button 
                type="submit" 
                disabled={isBooking}
                className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isBooking && <Loader2 className="animate-spin" size={20} />}
                {isBooking ? t('Processing...', 'অপেক্ষা করুন...') : t('Submit Request', 'রিকোয়েস্ট পাঠান')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-slate-900/90 z-[300] flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3rem] max-w-md text-center space-y-8 animate-in zoom-in duration-500 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={64}/>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t('Requested!', 'সফল হয়েছে!')}</h3>
              <p className="text-slate-400 font-bold">Request ID: <span className="text-blue-600 font-mono">#{bookingSuccess}</span></p>
              <p className="text-sm text-slate-500 pt-4 leading-relaxed font-bold">
                {t('Our expert technician will contact you shortly to confirm the appointment.', 'আমাদের টেকনিশিয়ান শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন।')}
              </p>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">
              {t('Continue', 'ঠিক আছে')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple loader icon for the button
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Services;
