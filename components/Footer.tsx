// @ts-nocheck
import React from 'react';
import { useLanguage } from './LanguageContext';
import { useProducts } from './ProductContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Lock, Zap, LogOut, MessageSquare } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, isAuthenticated, onLogout }) => {
  const { t, language } = useLanguage();
  const { settings } = useProducts();

  // Fallback values if settings are not loaded yet
  const siteName = settings ? (language === 'en' ? settings.siteName : settings.siteNameBn) : 'Grameen Energy';
  const address = settings ? (language === 'en' ? settings.address : settings.addressBn) : t('Uttara, Dhaka', 'উত্তরা, ঢাকা');
  const phone = settings?.contactPhone || '+880 1XXX-XXXXXX';
  const email = settings?.contactEmail || 'support@grameenenergy.com';

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1 rounded font-bold text-xl">GE</div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight">{siteName}</span>
              <span className="text-xs text-emerald-500 font-medium">{t('Solar & Electrical', 'সোলার ও ইলেকট্রিক্যাল')}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t('Leading provider of sustainable and reliable energy solutions in Bangladesh. We bring light to every corner.', 'বাংলাদেশে টেকসই এবং নির্ভরযোগ্য বিদ্যুৎ সমাধানের শীর্ষস্থানীয় প্রতিষ্ঠান। আমরা প্রতিটি কোণায় আলো পৌঁছে দেই।')}
          </p>
          <div className="flex gap-4">
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Facebook size={20}/></a>
            )}
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Instagram size={20}/></a>
            )}
            {settings?.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><Youtube size={20}/></a>
            )}
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition"><MessageSquare size={20}/></a>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-bold border-l-4 border-emerald-600 pl-4 uppercase tracking-wider">{t('Contact Us', 'যোগাযোগ')}</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-3"><MapPin className="text-emerald-500 shrink-0" size={18}/> {address}</li>
            <li className="flex gap-3"><Phone className="text-emerald-500 shrink-0" size={18}/> {phone}</li>
            <li className="flex gap-3"><Mail className="text-emerald-500 shrink-0" size={18}/> {email}</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-bold border-l-4 border-emerald-600 pl-4 uppercase tracking-wider">{t('Quick Links', 'লিঙ্কসমূহ')}</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><button onClick={() => onNavigate?.('shop')} className="hover:text-emerald-500 transition">{t('All Products', 'সব পণ্য')}</button></li>
            <li><button onClick={() => onNavigate?.('track-order')} className="hover:text-emerald-500 transition">{t('Track Order', 'অর্ডার ট্র্যাক')}</button></li>
            <li><button onClick={() => onNavigate?.('profile')} className="hover:text-emerald-500 transition">{t('My Account', 'আমার প্রোফাইল')}</button></li>
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
            <input type="email" placeholder="Email" className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
            <button className="bg-emerald-600 px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition">Go</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <p>&copy; {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
        <div className="flex items-center gap-4">
          <span>SSL Secure Payment</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;