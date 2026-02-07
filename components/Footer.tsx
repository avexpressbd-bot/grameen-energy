
import React from 'react';
import { useLanguage } from './LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Lock, Zap, LogOut } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, isAuthenticated, onLogout }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl">GE</div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight">Grameen Energy</span>
              <span className="text-xs text-emerald-500 font-medium">গ্রামিন এনার্জি</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t('Leading provider of sustainable and reliable energy solutions in Bangladesh. We bring light to every corner.', 'বাংলাদেশে টেকসই এবং নির্ভরযোগ্য বিদ্যুৎ সমাধানের শীর্ষস্থানীয় প্রতিষ্ঠান। আমরা প্রতিটি কোণায় আলো পৌঁছে দেই।')}
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Facebook size={20}/></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Instagram size={20}/></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Youtube size={20}/></a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-bold border-l-4 border-emerald-600 pl-4 uppercase tracking-wider">{t('Contact Us', 'যোগাযোগ')}</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-3"><MapPin className="text-emerald-500" size={18}/> {t('House 12, Road 5, Sector 10, Uttara, Dhaka', 'হাউজ ১২, রোড ৫, সেক্টর ১০, উত্তরা, ঢাকা')}</li>
            <li className="flex gap-3"><Phone className="text-emerald-500" size={18}/> +880 1234 567 890</li>
            <li className="flex gap-3"><Mail className="text-emerald-500" size={18}/> support@grameenenergy.com</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-bold border-l-4 border-emerald-600 pl-4 uppercase tracking-wider">{t('Quick Links', 'লিঙ্কসমূহ')}</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="#" className="hover:text-emerald-500 transition">{t('Warranty Policy', 'ওয়ারেন্টি পলিসি')}</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition">{t('Energy Saving Tips', 'সাশ্রয় টিপস')}</a></li>
            {isAuthenticated ? (
              <li><button onClick={onLogout} className="flex items-center gap-1 text-red-400 hover:text-red-500 transition"><LogOut size={14}/> {t('Logout', 'লগআউট')}</button></li>
            ) : (
              <li><button onClick={() => onNavigate?.('customer-auth')} className="flex items-center gap-1 hover:text-emerald-500 transition"><Lock size={14}/> {t('Management Login', 'ম্যানেজমেন্ট লগইন')}</button></li>
            )}
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-bold border-l-4 border-emerald-600 pl-4 uppercase tracking-wider">{t('Newsletter', 'নিউজলেটার')}</h4>
          <p className="text-sm text-gray-400">{t('Subscribe to get updates on new products and special offers.', 'নতুন পণ্য এবং বিশেষ অফার সম্পর্কে জানতে সাবস্ক্রাইব করুন।')}</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="flex-1 bg-gray-800 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
            <button className="bg-emerald-600 px-4 py-2 rounded font-bold hover:bg-emerald-700 transition">Go</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <p>&copy; 2024 Grameen Energy. All Rights Reserved.</p>
        <div className="flex items-center gap-4">
          <span>SSL Secure Payment</span>
          <img src="https://via.placeholder.com/150x30/333/fff?text=Payment+Methods" alt="payments" className="grayscale opacity-50" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
