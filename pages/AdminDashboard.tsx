
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Customer, BlogPost, SiteSettings, Sale, OrderStatus, CustomerUser, ServiceRequest, ServiceAd, ServiceStatus, Staff, StaffSkill } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Save, Search, DollarSign, RefreshCw, Star, Tag, Users, User,
  Wallet, CheckCircle, Settings, LayoutDashboard, FileText, ShoppingCart, Info, 
  Image as ImageIcon, MapPin, Phone, Eye, ArrowRight, Loader2, Bell, Volume2, 
  Download, Filter, CheckCircle2, Truck, XCircle, Clock, Printer, AlertTriangle, TrendingUp, Hash, Activity, BarChart3,
  CreditCard, Banknote, Facebook, Instagram, Youtube, Wrench, HeartPulse, Sparkles, Award, ChevronRight
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type AdminTab = 'overview' | 'inventory' | 'dues' | 'sales' | 'customers' | 'services' | 'staff' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, customers, registeredUsers, blogs, settings, serviceRequests, serviceAds, staff,
    addProduct, updateProduct, deleteProduct, updateSaleStatus, updateCustomerDue, updateSettings, 
    updateServiceStatus, addServiceAd, deleteServiceAd, addStaff, updateStaff, deleteStaff
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);
  const prevSalesCountRef = useRef(sales.length);
  const prevServiceCountRef = useRef(serviceRequests.length);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (sales.length > prevSalesCountRef.current) {
      const latest = sales[0];
      if (latest?.id.startsWith('GE-')) {
        setNewOrderAlert({ type: 'order', data: latest });
        audioRef.current?.play().catch(e => {});
      }
    }
    prevSalesCountRef.current = sales.length;

    if (serviceRequests.length > prevServiceCountRef.current) {
      const latest = serviceRequests[0];
      setNewOrderAlert({ type: 'service', data: latest });
      audioRef.current?.play().catch(e => {});
    }
    prevServiceCountRef.current = serviceRequests.length;
  }, [sales, serviceRequests]);

  const dailyStats = useMemo(() => ({
    revenue: sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0),
    activeServices: serviceRequests.filter(sr => sr.status !== 'Completed' && sr.status !== 'Cancelled').length,
    staffActive: staff.filter(s => s.status === 'Available').length
  }), [sales, serviceRequests, staff]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 relative">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {newOrderAlert && (
        <div className="fixed top-6 right-6 z-[500] w-96 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-right duration-500 border border-white/10 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${newOrderAlert.type === 'order' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                {newOrderAlert.type === 'order' ? 'New Order' : 'Service Alert'}
              </span>
              <button onClick={() => setNewOrderAlert(null)} className="text-slate-400 hover:text-white transition">✕</button>
            </div>
            <p className="text-xl font-black mb-1">{newOrderAlert.data.customerName}</p>
            <p className="text-sm text-slate-400 font-bold mb-6">
              {newOrderAlert.type === 'order' ? `Purchased for ৳${newOrderAlert.data.total}` : `Requested for ${newOrderAlert.data.serviceType}`}
            </p>
            <button 
              onClick={() => { setActiveTab(newOrderAlert.type === 'order' ? 'sales' : 'services'); setNewOrderAlert(null); }}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition"
            >
              Take Action
            </button>
          </div>
        </div>
      )}

      <aside className="w-full lg:w-72 bg-blue-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-xl">GE</div>
          <h2 className="font-black text-xl tracking-tight uppercase">Admin Panel</h2>
        </div>
        <nav className="p-6 space-y-2 flex-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'ওভারভিউ' },
            { id: 'inventory', icon: Box, label: 'ইনভেন্টরি' },
            { id: 'sales', icon: ShoppingCart, label: 'অর্ডার লিস্ট' },
            { id: 'services', icon: Wrench, label: 'সার্ভিস ম্যানেজমেন্ট' },
            { id: 'staff', icon: Award, label: 'স্টাফ ও টেকনিশিয়ান' },
            { id: 'customers', icon: Users, label: 'কাস্টমার' },
            { id: 'dues', icon: Wallet, label: 'বকেয়া' },
            { id: 'settings', icon: Settings, label: 'সেটিংস' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as AdminTab)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${activeTab === item.id ? 'bg-white text-blue-900 shadow-xl' : 'hover:bg-white/5 text-blue-100'}`}
            >
              <item.icon size={20}/> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[600px]">
          {activeTab === 'staff' && (
            <StaffManagement 
              staff={staff} 
              onAddStaff={addStaff} 
              onUpdateStaff={updateStaff} 
              onDeleteStaff={deleteStaff} 
            />
          )}
          {activeTab === 'services' && (
            <ServicesPanel 
              requests={serviceRequests} 
              ads={serviceAds} 
              staff={staff}
              onUpdateStatus={updateServiceStatus}
              onAddAd={(ad: any) => addServiceAd({...ad, id: 'SAD-'+Date.now()})}
              onDeleteAd={deleteServiceAd}
            />
          )}
          {activeTab === 'overview' && <Overview stats={dailyStats} sales={sales} />}
          {activeTab === 'inventory' && <InventoryTab products={products} searchTerm={searchTerm} onEdit={(p:any) => {setEditingItem(p); setIsModalOpen(true);}} onDelete={deleteProduct}/>}
          {activeTab === 'sales' && <SalesTab sales={sales} searchTerm={searchTerm} onUpdateStatus={updateSaleStatus}/>}
          {activeTab === 'customers' && <CustomersTab users={registeredUsers} searchTerm={searchTerm}/>}
          {activeTab === 'dues' && <DuesTab customers={customers} searchTerm={searchTerm} updateDue={updateCustomerDue}/>}
          {activeTab === 'settings' && <SettingsTab form={settings || {}} onSave={updateSettings}/>}
        </div>
      </main>
    </div>
  );
};

const Overview = ({ stats, sales }: any) => (
  <div className="p-10 space-y-12">
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { label: 'Revenue Today', val: `৳${stats.revenue}`, icon: TrendingUp, color: 'emerald' },
        { label: 'Active Services', val: stats.activeServices, icon: Wrench, color: 'blue' },
        { label: 'Staff Online', val: stats.staffActive, icon: Award, color: 'purple' },
      ].map(s => (
        <div key={s.label} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
          <div className={`w-16 h-16 bg-${s.color}-100 text-${s.color}-600 rounded-3xl flex items-center justify-center`}><s.icon size={32}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p><p className="text-3xl font-black text-slate-900">{s.val}</p></div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-[2.5rem] border p-8">
       <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Recent Sales Activity</h3>
       {/* Sales list would go here */}
    </div>
  </div>
);

const StaffManagement = ({ staff, onAddStaff, onUpdateStaff, onDeleteStaff }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleStaffSubmit = async (data: any) => {
    try {
      if (editingStaff) {
        await onUpdateStaff(editingStaff.id, data);
        // Also update user record if phone changed (simplified)
        await setDoc(doc(db, "users", data.phone), {
          name: data.name,
          phone: data.phone,
          role: 'technician'
        }, { merge: true });
      } else {
        // Create Staff Record
        const staffData = {
          ...data,
          id: data.phone,
          joinedAt: new Date().toISOString(),
          rating: 5,
          totalJobs: 0
        };
        await onAddStaff(staffData);

        // Create Corresponding Login Account
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        await setDoc(doc(db, "users", data.phone), {
          uid: data.phone,
          accountId: `GE-T-${randomSuffix}`,
          name: data.name,
          phone: data.phone,
          password: data.password || '123456', // Default password if none provided
          role: 'technician',
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving staff: " + error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-black uppercase tracking-tight">Staff & Technicians</h2>
        <button 
          onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
          className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-800 transition"
        >
          Add New Staff
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-5 text-left">Staff Info</th>
              <th className="px-6 py-5 text-left">SkillSet</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-left">Experience</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.map((s: Staff) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-8 py-4 flex items-center gap-4">
                  <img src={s.photo} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-black text-slate-800 text-sm">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {s.skills.map(sk => <span key={sk} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">{sk}</span>)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${s.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{s.status}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600 text-xs">{s.experience} Years</td>
                <td className="px-8 py-4 text-right space-x-2">
                   <button onClick={() => { setEditingStaff(s); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                   <button onClick={() => onDeleteStaff(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <StaffModal 
          staff={editingStaff} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleStaffSubmit}
        />
      )}
    </div>
  );
};

const StaffModal = ({ staff, onClose, onSubmit }: any) => {
  const [form, setForm] = useState<any>(staff || { name: '', phone: '', password: '', photo: '', whatsapp: '', area: '', experience: 1, status: 'Available', skills: [], isEmergencyStaff: false });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
          <div className="p-10 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tight">{staff ? 'Edit Staff' : 'Register Staff'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-xl">✕</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-10 space-y-4 max-h-[70vh] overflow-y-auto">
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Full Name" value={form.name} onChange={(v:any) => setForm({...form, name: v})} />
                <InputField label="Phone (Login ID)" value={form.phone} onChange={(v:any) => setForm({...form, phone: v})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Login Password" type="password" value={form.password} onChange={(v:any) => setForm({...form, password: v})} />
                <InputField label="Photo URL" value={form.photo} onChange={(v:any) => setForm({...form, photo: v})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <InputField label="WhatsApp" value={form.whatsapp} onChange={(v:any) => setForm({...form, whatsapp: v})} />
                <InputField label="Area" value={form.area} onChange={(v:any) => setForm({...form, area: v})} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {['IPS', 'Solar', 'Wiring', 'Repair', 'Installation'].map(s => (
                    <button 
                      key={s} type="button" 
                      onClick={() => setForm({...form, skills: form.skills.includes(s) ? form.skills.filter((sk:any) => sk !== s) : [...form.skills, s]})}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition ${form.skills.includes(s) ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
             <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest mt-6">Save Staff Member</button>
          </form>
       </div>
    </div>
  );
};

const ServicesPanel = ({ requests, ads, staff, onUpdateStatus, onAddAd, onDeleteAd }: any) => {
  const [subTab, setSubTab] = useState<'requests' | 'ads'>('requests');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [assigningTask, setAssigningTask] = useState<ServiceRequest | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-4">
          <button onClick={() => setSubTab('requests')} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${subTab === 'requests' ? 'bg-blue-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>Requests ({requests.length})</button>
          <button onClick={() => setSubTab('ads')} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${subTab === 'ads' ? 'bg-blue-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>Service Ads</button>
        </div>
      </div>

      <div className="flex-1">
        {subTab === 'requests' ? (
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 <tr>
                   <th className="px-8 py-5 text-left">Request Info</th>
                   <th className="px-6 py-5 text-left">Details</th>
                   <th className="px-6 py-5 text-left">Price/Budget</th>
                   <th className="px-6 py-5 text-left">Status</th>
                   <th className="px-6 py-5 text-left">Technician</th>
                   <th className="px-8 py-5 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {requests.map((sr: ServiceRequest) => (
                   <tr key={sr.id} className="hover:bg-slate-50 transition">
                     <td className="px-8 py-4">
                       <p className="font-black text-slate-800 text-sm">{sr.serviceType}</p>
                       <p className="text-[10px] text-slate-400 font-mono">#{sr.id}</p>
                       <p className="text-xs font-bold text-blue-600">{sr.customerName}</p>
                     </td>
                     <td className="px-6 py-4 truncate max-w-[150px] text-xs font-bold text-slate-500">
                        {sr.problemDescription}
                     </td>
                     <td className="px-6 py-4">
                        <p className="font-black text-slate-900 text-sm">{sr.manualPrice ? `৳${sr.manualPrice}` : 'N/A'}</p>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                         sr.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                         sr.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                         'bg-blue-100 text-blue-600'
                       }`}>{sr.status}</span>
                     </td>
                     <td className="px-6 py-4">
                        {sr.assignedStaffName ? (
                          <div className="flex items-center gap-2">
                             <Wrench size={12} className="text-emerald-500" />
                             <span className="text-xs font-black text-slate-800">{sr.assignedStaffName}</span>
                          </div>
                        ) : (
                          <button onClick={() => setAssigningTask(sr)} className="text-[10px] font-black text-blue-600 uppercase border-b border-blue-600 border-dashed">Assign Staff</button>
                        )}
                     </td>
                     <td className="px-8 py-4 text-right">
                       <select 
                         value={sr.status} 
                         onChange={(e) => onUpdateStatus(sr.id, e.target.value as ServiceStatus)}
                         className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                       >
                         {['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        ) : (
          <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service Ads list */}
          </div>
        )}
      </div>

      {assigningTask && (
        <AssignmentModal 
          task={assigningTask} 
          staff={staff} 
          onClose={() => setAssigningTask(null)} 
          onAssign={(staffMember: Staff) => {
            onUpdateStatus(assigningTask.id, 'Assigned', staffMember.id, staffMember.name);
            setAssigningTask(null);
          }}
        />
      )}
    </div>
  );
};

const AssignmentModal = ({ task, staff, onClose, onAssign }: any) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[600] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
        <div className="p-10 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Assign Technician</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">For {task.serviceType} in {task.customerAddress}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-xl">✕</button>
        </div>
        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
           {staff.filter((s:Staff) => s.status === 'Available').map((s: Staff) => (
             <button 
                key={s.id} 
                onClick={() => onAssign(s)}
                className="w-full flex items-center justify-between p-6 rounded-3xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
              >
               <div className="flex items-center gap-4">
                 <img src={s.photo} className="w-12 h-12 rounded-2xl object-cover" />
                 <div>
                   <p className="font-black text-slate-800">{s.name}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.area} • {s.experience} Years</p>
                 </div>
               </div>
               <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 font-black text-xs mb-1"><Star size={12} fill="currentColor"/> {s.rating}</div>
                  <ChevronRight size={20} className="text-slate-300 ml-auto" />
               </div>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition" />
  </div>
);

const InventoryTab = ({ products, searchTerm, onEdit, onDelete }: any) => {
  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="p-8">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-6 py-5 text-left">Product</th>
            <th className="px-6 py-5 text-left">Category</th>
            <th className="px-6 py-5 text-left">Price</th>
            <th className="px-6 py-5 text-left">Stock</th>
            <th className="px-6 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((p: any) => (
            <tr key={p.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-bold text-slate-800 text-sm">{p.name}</td>
              <td className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{p.category}</td>
              <td className="px-6 py-4 font-black text-slate-900">৳{p.price}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] font-black ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {p.stock}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SalesTab = ({ sales, searchTerm, onUpdateStatus }: any) => {
  const filtered = sales.filter((s: any) => s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm));
  return (
    <div className="p-8">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-6 py-5 text-left">Order ID</th>
            <th className="px-6 py-5 text-left">Customer</th>
            <th className="px-6 py-5 text-left">Total</th>
            <th className="px-6 py-5 text-left">Status</th>
            <th className="px-6 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((s: any) => (
            <tr key={s.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">#{s.id}</td>
              <td className="px-6 py-4 font-black text-slate-800 text-sm">{s.customerName}</td>
              <td className="px-6 py-4 font-black text-slate-900">৳{s.total}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                  s.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                  s.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>{s.status}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <select 
                  value={s.status} 
                  onChange={(e) => onUpdateStatus(s.id, e.target.value as OrderStatus)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none"
                >
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CustomersTab = ({ users, searchTerm }: any) => {
  const filtered = users.filter((u: any) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="p-8">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-6 py-5 text-left">User Info</th>
            <th className="px-6 py-5 text-left">Account ID</th>
            <th className="px-6 py-5 text-left">Role</th>
            <th className="px-6 py-5 text-left">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((u: any) => (
            <tr key={u.uid} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <p className="font-black text-slate-800 text-sm">{u.name}</p>
                <p className="text-[10px] text-slate-400 font-mono font-bold">{u.phone}</p>
              </td>
              <td className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">{u.accountId}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">{u.role}</span>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DuesTab = ({ customers, searchTerm, updateDue }: any) => {
  const filtered = customers.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="p-8">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-6 py-5 text-left">Customer</th>
            <th className="px-6 py-5 text-left">Total Due</th>
            <th className="px-6 py-5 text-left">Last Update</th>
            <th className="px-6 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((c: any) => (
            <tr key={c.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <p className="font-black text-slate-800 text-sm">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono font-bold">{c.id}</p>
              </td>
              <td className="px-6 py-4 font-black text-red-600">৳{c.totalDue}</td>
              <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(c.lastUpdate).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => {
                    const amount = Number(prompt('Enter payment amount:'));
                    if (amount && !isNaN(amount)) updateDue(c.id, c.name, amount);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition"
                >
                  Pay Due
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SettingsTab = ({ form, onSave }: any) => {
  const [data, setData] = useState(form);
  return (
    <div className="p-10 space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        <InputField label="Site Name (EN)" value={data.siteName} onChange={(v:any) => setData({...data, siteName: v})} />
        <InputField label="Site Name (BN)" value={data.siteNameBn} onChange={(v:any) => setData({...data, siteNameBn: v})} />
        <InputField label="Contact Phone" value={data.contactPhone} onChange={(v:any) => setData({...data, contactPhone: v})} />
        <InputField label="Contact Email" value={data.contactEmail} onChange={(v:any) => setData({...data, contactEmail: v})} />
        <InputField label="Address (EN)" value={data.address} onChange={(v:any) => setData({...data, address: v})} />
        <InputField label="Address (BN)" value={data.addressBn} onChange={(v:any) => setData({...data, addressBn: v})} />
      </div>
      <button 
        onClick={() => onSave(data)}
        className="w-full bg-blue-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
      >
        <Save size={20}/> {form.siteName ? 'Update Settings' : 'Save Config'}
      </button>
    </div>
  );
};

export default AdminDashboard;
