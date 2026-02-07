
import React, { useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';
import { 
  User, Package, MapPin, Phone, Mail, 
  LogOut, ShoppingBag, Clock, ChevronRight,
  ShieldCheck, ArrowRight, Hash
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
  onTrackOrder: (id: string, phone: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onTrackOrder }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { sales } = useProducts();

  const userOrders = useMemo(() => {
    if (!user) return [];
    return sales.filter(s => s.customerPhone === user.phone || s.userId === user.uid);
  }, [sales, user]);

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

        {/* Main Content */}
        <div className="flex-1 space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t('Order History', 'অর্ডারের তালিকা')}</h2>
              <p className="text-slate-400 font-bold text-sm mt-1">{t('View and track your previous energy purchases', 'আপনার আগের সকল অর্ডারের তালিকা এবং অবস্থা দেখুন')}</p>
            </div>
            <div className="hidden md:flex bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 items-center gap-3">
              <Package size={20} className="text-emerald-600" />
              <div className="text-right">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Total Orders', 'মোট অর্ডার')}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{userOrders.length}</p>
              </div>
            </div>
          </header>

          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full mx-auto flex items-center justify-center">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">{t('No Orders Found', 'কোনো অর্ডার পাওয়া যায়নি')}</h3>
                  <p className="text-slate-400 text-sm font-bold mt-2">{t('Start shopping to see your history here.', 'নতুন কেনাকাটা শুরু করুন এবং আপনার হিস্ট্রি এখানে দেখুন।')}</p>
                </div>
                <button 
                  onClick={() => onNavigate('shop')}
                  className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 mx-auto"
                >
                  {t('Go to Shop', 'শপে যান')} <ArrowRight size={16}/>
                </button>
              </div>
            ) : (
              userOrders.map(order => (
                <div 
                  key={order.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col md:flex-row items-center gap-8 group"
                >
                  <div className="bg-slate-50 p-6 rounded-3xl text-center min-w-[140px] border border-slate-100 group-hover:bg-blue-50 transition">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Order Date', 'অর্ডারের তারিখ')}</p>
                    <p className="text-sm font-black text-slate-900">{new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-[10px] font-mono text-blue-600 mt-2">#{order.id}</p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'Delivered' ? 'bg-emerald-600' : 
                          order.status === 'Cancelled' ? 'bg-red-600' : 
                          'bg-blue-600'
                        }`} />
                        {order.status}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {order.items.length} {t('Items', 'টি আইটেম')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {order.items.slice(0, 3).map((item, i) => (
                         <span key={i} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                           {item.name}
                         </span>
                       ))}
                       {order.items.length > 3 && <span className="text-xs font-bold text-slate-400">+{order.items.length - 3} more</span>}
                    </div>
                  </div>

                  <div className="text-center md:text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Total Paid', 'পরিশোধিত')}</p>
                    <p className="text-2xl font-black text-blue-900">৳{order.total}</p>
                  </div>

                  <button 
                    onClick={() => onTrackOrder(order.id, user.phone)}
                    className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                  >
                    {t('Track', 'ট্র্যাক করুন')} <ChevronRight size={16}/>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
