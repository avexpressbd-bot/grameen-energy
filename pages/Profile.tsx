
import React, { useMemo, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';
import { 
  User, Package, MapPin, Phone, Mail, 
  LogOut, ShoppingBag, Clock, ChevronRight,
  ShieldCheck, ArrowRight, Hash, Wrench, MessageSquare, Star, CheckCircle2, AlertCircle, Banknote
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
  onTrackOrder: (id: string, phone: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onTrackOrder }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { sales, serviceRequests, staff } = useProducts();
  const [activeTab, setActiveTab] = useState<'orders' | 'services'>('orders');

  const userOrders = useMemo(() => {
    if (!user) return [];
    return sales.filter(s => s.customerPhone === user.phone || s.userId === user.uid);
  }, [sales, user]);

  const userServices = useMemo(() => {
    if (!user) return [];
    return serviceRequests.filter(sr => sr.customerPhone === user.phone);
  }, [serviceRequests, user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900">{t('Please Login', 'দয়া করে লগইন করুন')}</h2>
        <button 
          onClick={() => onNavigate('customer-auth')}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
        >
          {t('Login Now', 'লগইন করুন')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Info */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 sticky top-24">
            <div className="p-10 bg-blue-900 text-white text-center relative overflow-hidden">
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/10 relative z-10">
                <User size={48} className="text-white" />
              </div>
              <h3 className="text-xl font-black relative z-10 uppercase tracking-tight">{user.name}</h3>
              <div className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 relative z-10">
                <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">{user.accountId}</p>
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                    <Hash size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Customer ID', 'কাস্টমার আইডি')}</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{user.accountId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                    <Phone size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Phone', 'ফোন')}</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                    <Mail size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Email', 'ইমেইল')}</p>
                    <p className="text-sm font-bold text-slate-800">{user.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition shrink-0">
                    <MapPin size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Default Address', 'ঠিকানা')}</p>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{user.address || t('No address set', 'ঠিকানা দেওয়া নেই')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button 
                  onClick={() => { logout(); onNavigate('home'); }}
                  className="w-full py-4 flex items-center justify-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 rounded-2xl transition"
                >
                  <LogOut size={16}/> {t('Logout Account', 'লগআউট করুন')}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-10">
          {/* Tab Navigation */}
          <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm max-w-fit">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'orders' ? 'bg-blue-900 text-white shadow-xl' : 'text-slate-400 hover:text-blue-900'}`}
            >
              {t('Orders', 'অর্ডার')} ({userOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`px-8 py-3 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'services' ? 'bg-blue-900 text-white shadow-xl' : 'text-slate-400 hover:text-blue-900'}`}
            >
              {t('Services', 'সার্ভিস')} ({userServices.length})
            </button>
          </div>

          <div className="space-y-8">
            {activeTab === 'orders' ? (
              /* Order History List */
              userOrders.length === 0 ? (
                <EmptyState icon={ShoppingBag} title={t('No Orders Yet', 'কোনো অর্ডার নেই')} onBtnClick={() => onNavigate('shop')} btnText={t('Go to Shop', 'শপে যান')} />
              ) : (
                userOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col md:flex-row items-center gap-8 group">
                    <div className="bg-slate-50 p-6 rounded-3xl text-center min-w-[140px] border border-slate-100 group-hover:bg-blue-50 transition">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-sm font-black text-slate-900">{new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-[10px] font-mono text-blue-600 mt-2">#{order.id}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                       <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                       <p className="text-sm font-bold text-slate-600 truncate max-w-md">{order.items.map(i => i.name).join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-2xl font-black text-blue-900">৳{order.total}</p>
                    </div>
                    <button onClick={() => onTrackOrder(order.id, user.phone)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Track</button>
                  </div>
                ))
              )
            ) : (
              /* Service Requests List */
              userServices.length === 0 ? (
                <EmptyState icon={Wrench} title={t('No Service Requests', 'কোনো সার্ভিস রিকোয়েস্ট নেই')} onBtnClick={() => onNavigate('services')} btnText={t('Book Service', 'সার্ভিস বুক করুন')} />
              ) : (
                userServices.map(service => {
                  // Find assigned technician data
                  const technician = service.assignedStaffId ? staff.find(s => s.id === service.assignedStaffId) : null;
                  
                  return (
                    <div key={service.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden group">
                      <div className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              service.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                              service.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {service.status}
                            </span>
                            <h4 className="text-2xl font-black text-slate-900 mt-4 uppercase tracking-tight">{service.serviceType}</h4>
                            <p className="text-xs font-mono text-slate-400 mt-1">REQ ID: #{service.id}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Budget / Price', 'বাজেট / মূল্য')}</p>
                            <div className="flex items-center gap-2 text-blue-900 font-black text-xl">
                              <Banknote size={18} className="text-emerald-500" />
                              ৳{service.manualPrice || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Problem Summary */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('Issue Description', 'সমস্যার বিবরণ')}</p>
                            <p className="text-sm font-bold text-slate-600 italic">"{service.problemDescription}"</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('Preferred Time', 'নির্ধারিত সময়')}</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              <Clock size={14} className="text-blue-500" />
                              {service.preferredDate} at {service.preferredTime}
                            </div>
                          </div>
                        </div>

                        {/* Assigned Technician View */}
                        {service.status !== 'Pending' && service.assignedStaffId ? (
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                             <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{t('Assigned Technician', 'অ্যাসাইন করা টেকনিশিয়ান')}</h5>
                             
                             <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center gap-8">
                               {technician ? (
                                 <>
                                   <div className="relative">
                                     <img src={technician.photo} className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg" alt="" />
                                     <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg"><ShieldCheck size={14}/></div>
                                   </div>
                                   <div className="flex-1 text-center md:text-left space-y-1">
                                      <h6 className="text-xl font-black text-slate-900">{technician.name}</h6>
                                      <div className="flex items-center justify-center md:justify-start gap-2">
                                        <div className="flex text-yellow-500"><Star size={14} fill="currentColor"/></div>
                                        <span className="text-sm font-black text-slate-600">{technician.rating} / 5.0</span>
                                        <span className="text-[10px] text-slate-400 font-bold ml-2">• {technician.experience} {t('Yrs Exp', 'বছরের অভিজ্ঞতা')}</span>
                                      </div>
                                      <p className="text-xs font-bold text-blue-600 flex items-center justify-center md:justify-start gap-2"><MapPin size={12}/> {technician.area}</p>
                                   </div>
                                   <div className="flex gap-3">
                                      <a href={`tel:${technician.phone}`} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-md hover:scale-110 transition"><Phone size={24}/></a>
                                      <a href={`https://wa.me/${technician.whatsapp}`} className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md hover:scale-110 transition"><MessageSquare size={24}/></a>
                                   </div>
                                 </>
                               ) : (
                                 <div className="flex items-center gap-4 py-4 px-2">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600"><Wrench size={24}/></div>
                                    <p className="text-sm font-bold text-slate-600">{service.assignedStaffName || 'Technician info loading...'}</p>
                                 </div>
                               )}
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold text-center italic">{t('The technician will call you once they are on the way.', 'টেকনিশিয়ান আসার আগে আপনাকে ফোন করে নিশ্চিত করবেন।')}</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 animate-pulse"><User size={24}/></div>
                             <p className="text-sm font-bold text-slate-400">{t('Technician assignment in progress...', 'টেকনিশিয়ান নির্ধারণ করা হচ্ছে...')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, onBtnClick, btnText }: any) => (
  <div className="p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
    <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full mx-auto flex items-center justify-center">
      <Icon size={48} />
    </div>
    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">{title}</h3>
    <button 
      onClick={onBtnClick}
      className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 mx-auto"
    >
      {btnText} <ArrowRight size={16}/>
    </button>
  </div>
);

export default Profile;
