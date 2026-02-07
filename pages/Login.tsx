
import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

interface LoginProps {
  type: 'admin' | 'pos';
  onLoginSuccess: (role: 'admin' | 'pos') => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ type, onLoginSuccess, onBack }) => {
  const { t } = useLanguage();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Credentials logic
    if (type === 'admin') {
      if (id === 'admin' && password === 'admin123') {
        onLoginSuccess('admin');
      } else {
        setError(t('Invalid Admin ID or Password', 'ভুল অ্যাডমিন আইডি অথবা পাসওয়ার্ড'));
      }
    } else {
      if (id === 'posuser' && password === 'pos123') {
        onLoginSuccess('pos');
      } else {
        setError(t('Invalid POS ID or Password', 'ভুল পিওএস আইডি অথবা পাসওয়ার্ড'));
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className={`p-8 text-center ${type === 'admin' ? 'bg-blue-900' : 'bg-emerald-600'} text-white relative`}>
          <button 
            onClick={onBack}
            className="absolute left-6 top-8 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 text-blue-900 font-black text-2xl">
            {type === 'admin' ? <ShieldCheck size={40} className="text-blue-900" /> : <Zap size={40} className="text-emerald-600" />}
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {type === 'admin' ? t('Admin Login', 'অ্যাডমিন লগইন') : t('POS Sales Login', 'সেলস প্যানেল লগইন')}
          </h2>
          <p className="text-white/70 text-sm font-medium mt-1">
            {t('Grameen Energy Management', 'গ্রামিন এনার্জি ম্যানেজমেন্ট')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('Login ID', 'লগইন আইডি')}</label>
            <div className="relative group">
              <User className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition" size={20} />
              <input 
                required
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={type === 'admin' ? 'admin' : 'posuser'}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white transition font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('Password', 'পাসওয়ার্ড')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition" size={20} />
              <input 
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white transition font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-300 hover:text-gray-500 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition transform active:scale-95 ${type === 'admin' ? 'bg-blue-900 hover:bg-blue-800 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-100'}`}
          >
            {t('Login Now', 'লগইন করুন')}
          </button>
          
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400 font-medium">
              {t('Forgot credentials? Contact store owner.', 'আইডি বা পাসওয়ার্ড ভুলে গেছেন? মালিকের সাথে যোগাযোগ করুন।')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
