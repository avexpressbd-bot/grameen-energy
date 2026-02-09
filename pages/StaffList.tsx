// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Staff, StaffSkill } from '../types';
import { 
  Phone, MessageSquare, Star, MapPin, Wrench, 
  Search, Filter, ChevronRight, ShieldCheck, HeartPulse, User
} from 'lucide-react';

/* Adding @ts-nocheck at the top to suppress intrinsic JSX element errors in the environment */
const StaffList: React.FC = () => {
  const { staff } = useProducts();
  const { t, language } = useLanguage();
  const [filterSkill, setFilterSkill] = useState<StaffSkill | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSkill = filterSkill === 'All' || s.skills.includes(filterSkill as StaffSkill);
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.area.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSkill && matchesSearch;
    });
  }, [staff, filterSkill, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      <header className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <ShieldCheck size={14}/> {t('Certified Technicians', 'প্রত্যয়িত টেকনিশিয়ান')}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-tight">
          {t('Find Energy Experts', 'দক্ষ টেকনিশিয়ান খুঁজুন')}
        </h1>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          {t('Connect with verified experts for your IPS, Solar and Electrical solutions in your neighborhood.', 'আপনার এলাকার ভেরিফাইড এক্সপার্টদের সাথে সরাসরি যোগাযোগ করুন।')}
        </p>
      </header>

      <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={20} />
          <input 
            type="text" 
            placeholder={t('Search by name or area...', 'নাম অথবা এলাকা দিয়ে খুঁজুন...')}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500/10 focus:bg-white transition font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {['All', 'IPS', 'Solar', 'Wiring', 'Repair', 'Installation'].map((skill) => (
            <button
              key={skill}
              onClick={() => setFilterSkill(skill as any)}
              className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${
                filterSkill === skill ? 'bg-blue-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStaff.map(s => (
          <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
            <div className="relative h-48 bg-slate-100">
              <img src={s.photo} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ${
                  s.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-white ${s.status === 'Available' ? 'animate-pulse' : ''}`}></div>
                  {s.status}
                </span>
                {s.isEmergencyStaff && (
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <HeartPulse size={12}/> {t('Emergency', 'জরুরী')}
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{s.name}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{s.experience} {t('Years Exp.', 'বছরের অভিজ্ঞতা')}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-xl font-black text-xs">
                  <Star size={14} fill="currentColor"/> {s.rating}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                  <MapPin size={18} className="text-blue-500 shrink-0"/> {s.area}
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                <a 
                  href={`tel:${s.phone}`} 
                  className="bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-800 transition shadow-xl shadow-blue-900/10"
                >
                  <Phone size={16}/> {t('Call', 'কল করুন')}
                </a>
                <a 
                  href={`https://wa.me/${s.whatsapp}`} 
                  className="bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/10"
                >
                  <MessageSquare size={16}/> WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
             <User size={64} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-bold">{t('No technicians found in this category or area.', 'এই ক্যাটাগরিতে কোনো টেকনিশিয়ান পাওয়া যায়নি।')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;