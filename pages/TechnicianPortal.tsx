
import React, { useState, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { ServiceRequest, ServiceStatus } from '../types';
import { 
  Wrench, MapPin, Phone, Clock, CheckCircle2, 
  ArrowRight, Loader2, AlertCircle, Calendar, MessageSquare, LogOut, Banknote
} from 'lucide-react';

const TechnicianPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { serviceRequests, updateServiceStatus, staff } = useProducts();
  const { t } = useLanguage();

  const currentTechnician = useMemo(() => {
    return staff.find(s => s.phone === user?.phone);
  }, [staff, user]);

  const assignedTasks = useMemo(() => {
    return serviceRequests.filter(sr => sr.assignedStaffId === currentTechnician?.id);
  }, [serviceRequests, currentTechnician]);

  const handleUpdateStatus = async (id: string, status: ServiceStatus) => {
    await updateServiceStatus(id, status);
  };

  if (!user || user.role !== 'technician') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle size={40}/>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{t('Unauthorized Access', 'অ্যাক্সেস অনুমোদিত নয়')}</h2>
          <p className="text-slate-400 font-bold">{t('Only registered technicians can access this portal.', 'শুধুমাত্র নিবন্ধিত টেকনিশিয়ানরা এই পোর্টালে প্রবেশ করতে পারবেন।')}</p>
          <button onClick={() => logout()} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">{t('Logout', 'লগআউট')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-blue-900 text-white p-10 pb-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <img src={currentTechnician?.photo} className="w-20 h-20 rounded-3xl object-cover border-4 border-white/10" />
            <div>
              <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">{t('Technician Portal', 'টেকনিশিয়ান পোর্টাল')}</p>
              <h1 className="text-3xl font-black uppercase tracking-tight">{user.name}</h1>
              <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentTechnician?.status === 'Available' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                {currentTechnician?.status}
              </p>
            </div>
          </div>
          <button onClick={logout} className="p-4 bg-white/10 rounded-2xl hover:bg-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
            <LogOut size={16}/> {t('Logout', 'লগআউট')}
          </button>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-12 space-y-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Assigned', count: assignedTasks.filter(t => t.status === 'Assigned').length, color: 'blue' },
            { label: 'Working', count: assignedTasks.filter(t => t.status === 'In Progress').length, color: 'amber' },
            { label: 'Completed', count: assignedTasks.filter(t => t.status === 'Completed').length, color: 'emerald' },
            { label: 'Rating', count: currentTechnician?.rating || 0, color: 'purple' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col items-center gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Wrench size={24} className="text-blue-600" /> {t('My Tasks', 'আমার কাজসমূহ')}
          </h3>

          {assignedTasks.length === 0 ? (
            <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
               <Loader2 size={48} className="mx-auto text-slate-200 animate-spin" />
               <p className="text-slate-400 font-bold">{t('No active tasks assigned yet.', 'বর্তমানে কোনো কাজ নেই। নতুন কাজের জন্য অপেক্ষা করুন।')}</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assignedTasks.map(task => (
                <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group">
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          task.status === 'Assigned' ? 'bg-blue-100 text-blue-600' :
                          task.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {task.status}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 pt-2">{task.serviceType}</h4>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Request ID: #{task.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Customer Budget', 'কাস্টমার বাজেট')}</p>
                        <p className="font-black text-emerald-600 text-xl flex items-center gap-2 justify-end">
                           <Banknote size={18} />
                           ৳{task.manualPrice || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><MapPin size={20}/></div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Location', 'ঠিকানা')}</p>
                          <p className="text-xs font-bold text-slate-700">{task.customerAddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Calendar size={20}/></div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Schedule', 'শিডিউল')}</p>
                          <p className="text-xs font-bold text-slate-700">{task.preferredDate} - {task.preferredTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Problem Details', 'সমস্যার বিবরণ')}</p>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl italic border-l-4 border-blue-500">"{task.problemDescription}"</p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                      {task.status === 'Assigned' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                          className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-blue-800 transition transform active:scale-95"
                        >
                          <CheckCircle2 size={18}/> {t('Accept & Start', 'কাজ শুরু করুন')}
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'Completed')}
                          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-500 transition transform active:scale-95"
                        >
                          <CheckCircle2 size={18}/> {t('Mark as Completed', 'কাজ শেষ করুন')}
                        </button>
                      )}
                      <a 
                        href={`tel:${task.customerPhone}`}
                        className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition shadow-sm"
                      >
                        <Phone size={24}/>
                      </a>
                      <a 
                        href={`https://wa.me/${task.customerPhone}`}
                        className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition shadow-sm"
                      >
                        <MessageSquare size={24}/>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TechnicianPortal;
