
import React, { useState } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../components/AuthContext';
import { ServiceAd, ServiceRequest } from '../types';
import { 
  Zap, Phone, MessageSquare, Calendar, Clock, MapPin, 
  Info, Camera, ChevronRight, CheckCircle2, AlertTriangle, 
  Wrench, ShieldCheck, HeartPulse
} from 'lucide-react';

const Services: React.FC = () => {
  const { serviceAds, addServiceRequest } = useProducts();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [selectedAd, setSelectedAd] = useState<ServiceAd | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    problem: '',
    date: '',
    time: '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    
    setIsBooking(true);
    try {
      const id = await addServiceRequest({
        customerName: user?.name || 'Guest',
        customerPhone: formData.phone,
        customerAddress: formData.address,
        serviceType: selectedAd.titleBn,
        problemDescription: formData.problem,
        preferredDate: formData.date,
        preferredTime: formData.time,
      });
      setBookingSuccess(id);
      setSelectedAd(null);
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
          {t('Professional Energy Services', 'পেশাদার এনার্জি সার্ভিস')}
        </h1>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto">
          {t('Get expert technicians for your IPS, Solar and electrical needs within minutes.', 'আপনার আইপিএস, সোলার এবং ইলেকট্রিক্যাল সমস্যার সমাধানে দক্ষ টেকনিশিয়ান বেছে নিন।')}
        </p>
      </header>

      {/* Service Grid */}
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
                  onClick={() => setSelectedAd(ad)}
                  className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-800 transition transform active:scale-95"
                >
                  {t('Book Service', 'বুকিং দিন')}
                </button>
                <a 
                  href={`https://wa.me/${ad.id}`} 
                  className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition shadow-lg"
                >
                  <MessageSquare size={24}/>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedAd && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{t('Book Service', 'সার্ভিস বুকিং')}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{language === 'en' ? selectedAd.title : selectedAd.titleBn}</p>
              </div>
              <button onClick={() => setSelectedAd(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition">✕</button>
            </div>
            
            <form onSubmit={handleBook} className="p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Phone Number', 'ফোন নম্বর')}</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-blue-50 transition" />
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
                className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-800 transition disabled:opacity-50"
              >
                {isBooking ? t('Processing...', 'অপেক্ষা করুন...') : t('Submit Request', 'রিকোয়েস্ট পাঠান')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-slate-900/90 z-[300] flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3rem] max-w-md text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={64}/>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t('Requested!', 'সফল হয়েছে!')}</h3>
              <p className="text-slate-400 font-bold">Request ID: <span className="text-blue-600 font-mono">#{bookingSuccess}</span></p>
              <p className="text-sm text-slate-500 pt-4 leading-relaxed">
                {t('Our expert technician will contact you shortly to confirm the appointment.', 'আমাদের টেকনিশিয়ান শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন।')}
              </p>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest">
              {t('Continue', 'ঠিক আছে')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
