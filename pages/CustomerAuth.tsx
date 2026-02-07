
import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../components/AuthContext';
import { Lock, User, Phone, Eye, EyeOff, ArrowRight, UserPlus, LogIn, Mail, MapPin } from 'lucide-react';

const CustomerAuth: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    email: '',
    address: '',
    city: 'Inside Dhaka'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.phone, formData.password);
        if (success) onNavigate('profile');
        else setError(t('Invalid Phone or Password', 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড'));
      } else {
        if (formData.password.length < 6) {
          setError(t('Password must be at least 6 characters', 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'));
          setLoading(false);
          return;
        }
        await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city
        }, formData.password);
        onNavigate('profile');
      }
    } catch (err: any) {
      setError(err.message || t('Something went wrong', 'কিছু সমস্যা হয়েছে'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
        {/* Side Banner */}
        <div className="md:w-5/12 bg-blue-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl mb-6 shadow-lg">GE</div>
            <h2 className="text-3xl font-black uppercase tracking-tight leading-tight mb-4">
              {isLogin ? t('Welcome Back!', 'স্বাগতম!') : t('Join the Energy Revolution', 'আমাদের সাথে যোগ দিন')}
            </h2>
            <p className="text-blue-200 text-sm font-bold leading-relaxed">
              {isLogin 
                ? t('Login to access your orders and profile.', 'আপনার অর্ডার এবং প্রোফাইল দেখতে লগইন করুন।') 
                : t('Register today for exclusive offers and faster checkout.', 'অফার এবং দ্রুত চেকআউটের জন্য আজই রেজিস্টার করুন।')}
            </p>
          </div>
          
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="relative z-10 mt-8 py-3 px-6 bg-white/10 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition"
          >
            {isLogin ? t('Create Account', 'অ্যাকাউন্ট তৈরি করুন') : t('Already have account?', 'লগইন করুন')}
          </button>

          {/* Decorative elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Auth Form */}
        <div className="flex-1 p-10 md:p-12">
          <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">
            {isLogin ? t('Customer Login', 'কাস্টমার লগইন') : t('Create Account', 'রেজিস্ট্রেশন')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Full Name', 'পুরো নাম')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/10 transition font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Phone Number', 'ফোন নম্বর')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <input 
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/10 transition font-bold font-mono"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Email (Optional)', 'ইমেইল (ঐচ্ছিক)')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@mail.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/10 transition font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Password', 'পাসওয়ার্ড')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/10 transition font-bold"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Default Address', 'বর্তমান ঠিকানা')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <textarea 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder={t('House, Road, Area...', 'বাসা, রোড, এলাকা...')}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/10 transition font-bold text-sm"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? t('Processing...', 'কাজ চলছে...') : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
              {loading ? '' : (isLogin ? t('Login Now', 'লগইন করুন') : t('Create Account', 'রেজিস্টার করুন'))}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
