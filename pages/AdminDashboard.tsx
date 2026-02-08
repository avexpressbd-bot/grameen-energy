
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Customer, BlogPost, SiteSettings, Sale, OrderStatus, CustomerUser, ServiceRequest, ServiceAd, ServiceStatus } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Save, Search, DollarSign, RefreshCw, Star, Tag, Users, User,
  Wallet, CheckCircle, Settings, LayoutDashboard, FileText, ShoppingCart, Info, 
  Image as ImageIcon, MapPin, Phone, Eye, ArrowRight, Loader2, Bell, Volume2, 
  Download, Filter, CheckCircle2, Truck, XCircle, Clock, Printer, AlertTriangle, TrendingUp, Hash, Activity, BarChart3,
  CreditCard, Banknote, Facebook, Instagram, Youtube, Wrench, HeartPulse, Sparkles
} from 'lucide-react';

type AdminTab = 'overview' | 'inventory' | 'dues' | 'sales' | 'customers' | 'services' | 'blogs' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, customers, registeredUsers, blogs, settings, serviceRequests, serviceAds,
    addProduct, updateProduct, deleteProduct, updateSaleStatus, updateCustomerDue, updateSettings, 
    addBlog, deleteBlog, updateServiceStatus, addServiceAd, deleteServiceAd
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
    // New Sale Alert
    if (sales.length > prevSalesCountRef.current) {
      const latest = sales[0];
      if (latest?.id.startsWith('GE-')) {
        setNewOrderAlert({ type: 'order', data: latest });
        audioRef.current?.play().catch(e => {});
      }
    }
    prevSalesCountRef.current = sales.length;

    // New Service Alert
    if (serviceRequests.length > prevServiceCountRef.current) {
      const latest = serviceRequests[0];
      setNewOrderAlert({ type: 'service', data: latest });
      audioRef.current?.play().catch(e => {});
    }
    prevServiceCountRef.current = serviceRequests.length;
  }, [sales, serviceRequests]);

  const todaySales = useMemo(() => sales.filter(s => {
    const saleDate = new Date(s.date).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }), [sales]);

  const dailyStats = useMemo(() => ({
    revenue: todaySales.reduce((acc, s) => acc + s.total, 0),
    count: todaySales.length,
    serviceCount: serviceRequests.filter(sr => sr.status === 'Pending').length
  }), [todaySales, serviceRequests]);

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings || {
    siteName: 'Grameen Energy', siteNameBn: 'গ্রামিন এনার্জি',
    contactPhone: '', contactEmail: '', address: '', addressBn: '', whatsappNumber: '',
    facebookUrl: '', instagramUrl: '', youtubeUrl: '',
    heroTitleEn: '', heroTitleBn: '', heroSubtitleEn: '', heroSubtitleBn: ''
  });

  useEffect(() => { if (settings) setSettingsForm(prev => ({ ...prev, ...settings })); }, [settings]);

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
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
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
            { id: 'services', icon: Wrench, label: 'সার্ভিস রিকোয়েস্ট' },
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
        {activeTab === 'overview' && (
           <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center"><TrendingUp size={32}/></div>
                <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Revenue</p><p className="text-3xl font-black text-slate-900">৳{dailyStats.revenue}</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center"><ShoppingCart size={32}/></div>
                <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Sales</p><p className="text-3xl font-black text-slate-900">{dailyStats.count}</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center"><Wrench size={32}/></div>
                <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Services</p><p className="text-3xl font-black text-slate-900">{dailyStats.serviceCount}</p></div>
              </div>
           </div>
        )}

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[600px]">
          {activeTab === 'services' && (
            <ServicesPanel 
              requests={serviceRequests} 
              ads={serviceAds} 
              onUpdateStatus={updateServiceStatus}
              onAddAd={(ad: any) => addServiceAd({...ad, id: 'SAD-'+Date.now()})}
              onDeleteAd={deleteServiceAd}
            />
          )}
          {activeTab === 'inventory' && <InventoryTab products={products} searchTerm={searchTerm} onEdit={(p:any) => {setEditingItem(p); setIsModalOpen(true);}} onDelete={deleteProduct}/>}
          {activeTab === 'sales' && <SalesTab sales={sales} searchTerm={searchTerm} onUpdateStatus={updateSaleStatus}/>}
          {activeTab === 'customers' && <CustomersTab users={registeredUsers} searchTerm={searchTerm}/>}
          {activeTab === 'dues' && <DuesTab customers={customers} searchTerm={searchTerm} updateDue={updateCustomerDue}/>}
          {activeTab === 'settings' && <SettingsTab form={settingsForm} setForm={setSettingsForm} onSave={(e:any) => { e.preventDefault(); updateSettings(settingsForm); alert('Updated!'); }}/>}
        </div>
      </main>

      {isModalOpen && (
        <AdminModal 
          type="inventory" 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data:any) => {
            editingItem ? await updateProduct(editingItem.id, data) : await addProduct({...data, id: 'GE-'+Math.floor(1000+Math.random()*9000)});
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const ServicesPanel = ({ requests, ads, onUpdateStatus, onAddAd, onDeleteAd }: any) => {
  const [subTab, setSubTab] = useState<'requests' | 'ads'>('requests');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-4">
          <button onClick={() => setSubTab('requests')} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${subTab === 'requests' ? 'bg-blue-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>Requests ({requests.length})</button>
          <button onClick={() => setSubTab('ads')} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${subTab === 'ads' ? 'bg-blue-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>Manage Ads</button>
        </div>
        {subTab === 'ads' && (
          <button onClick={() => setIsAdModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition">
            <Plus size={16}/> New Service
          </button>
        )}
      </div>

      <div className="flex-1">
        {subTab === 'requests' ? (
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 <tr>
                   <th className="px-8 py-5 text-left">Request ID</th>
                   <th className="px-6 py-5 text-left">Customer</th>
                   <th className="px-6 py-5 text-left">Service Type</th>
                   <th className="px-6 py-5 text-left">Status</th>
                   <th className="px-8 py-5 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {requests.map((sr: any) => (
                   <tr key={sr.id} className="hover:bg-slate-50 transition">
                     <td className="px-8 py-4 font-mono text-xs text-blue-600">#{sr.id}</td>
                     <td className="px-6 py-4">
                       <p className="font-bold text-slate-800 text-sm">{sr.customerName}</p>
                       <p className="text-xs text-slate-400 font-mono">{sr.customerPhone}</p>
                     </td>
                     <td className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">{sr.serviceType}</td>
                     <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         sr.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                         sr.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                         'bg-blue-100 text-blue-600'
                       }`}>{sr.status}</span>
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
            {ads.map((ad: any) => (
              <div key={ad.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 relative group">
                <button onClick={() => onDeleteAd(ad.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                <img src={ad.image} className="w-16 h-16 rounded-2xl object-cover mb-4" />
                <h4 className="font-black text-slate-800">{ad.titleBn}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">{ad.category}</p>
                <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-4">
                  <span className="text-blue-600 font-black text-xs">৳ {ad.priceLabel}</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase">{ad.responseTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdModalOpen && (
        <ServiceAdModal onClose={() => setIsAdModalOpen(false)} onSubmit={(data: any) => { onAddAd(data); setIsAdModalOpen(false); }} />
      )}
    </div>
  );
};

const ServiceAdModal = ({ onClose, onSubmit }: any) => {
  const [form, setForm] = useState({
    title: '', titleBn: '', category: 'IPS Service', descriptionBn: '', priceLabel: 'Call for price', areaCoverage: 'Dhaka', responseTime: '30-60 Mins', image: '', isEmergency: false, hasOffer: false
  });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
        <div className="p-10 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="text-xl font-black uppercase">Create Service Ad</h3>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-xl">✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-10 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Title (English)" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
            <InputField label="Title (Bangla)" value={form.titleBn} onChange={(v:any) => setForm({...form, titleBn: v})} />
          </div>
          <InputField label="Category" value={form.category} onChange={(v:any) => setForm({...form, category: v})} />
          <InputField label="Starting Price Label" value={form.priceLabel} onChange={(v:any) => setForm({...form, priceLabel: v})} />
          <InputField label="Response Time Label" value={form.responseTime} onChange={(v:any) => setForm({...form, responseTime: v})} />
          <InputField label="Image URL" value={form.image} onChange={(v:any) => setForm({...form, image: v})} />
          <textarea placeholder="Description (Bangla)" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm" rows={3} value={form.descriptionBn} onChange={e => setForm({...form, descriptionBn: e.target.value})} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase"><input type="checkbox" checked={form.isEmergency} onChange={e => setForm({...form, isEmergency: e.target.checked})} /> Emergency</label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase"><input type="checkbox" checked={form.hasOffer} onChange={e => setForm({...form, hasOffer: e.target.checked})} /> Offer</label>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest mt-4">Publish Ad</button>
        </form>
      </div>
    </div>
  );
};

const CustomersTab = ({ users, searchTerm }: { users: CustomerUser[], searchTerm: string }) => {
  const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm) || u.accountId.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-8 py-5 text-left">Account ID</th>
            <th className="px-6 py-5 text-left">Name</th>
            <th className="px-6 py-5 text-left">Phone</th>
            <th className="px-6 py-5 text-left">Location</th>
            <th className="px-8 py-5 text-right">Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-bold text-sm">
          {filtered.map((u) => (
            <tr key={u.uid} className="hover:bg-slate-50 transition">
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Hash size={14}/></div>
                  <span className="font-mono text-xs font-black text-blue-600">{u.accountId}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-900">{u.name}</td>
              <td className="px-6 py-4 font-mono text-slate-500">{u.phone}</td>
              <td className="px-6 py-4 text-xs text-slate-600">
                 {u.city || 'N/A'}
              </td>
              <td className="px-8 py-4 text-right text-xs text-slate-400">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InventoryTab = ({ products, searchTerm, onEdit, onDelete }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
        <tr>
          <th className="px-8 py-5 text-left">Product</th>
          <th className="px-6 py-5 text-left">Category</th>
          <th className="px-6 py-5 text-left">Stock</th>
          <th className="px-6 py-5 text-left">Price</th>
          <th className="px-8 py-5 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 font-bold text-sm">
        {products.filter((p:any) => p.nameBn.includes(searchTerm) || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p:any) => (
          <tr key={p.id} className="hover:bg-slate-50 transition">
            <td className="px-8 py-4 flex items-center gap-4">
              <img src={p.image} className="w-10 h-10 rounded-lg object-cover border" />
              <div>
                <p className="text-slate-900">{p.nameBn}</p>
                <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-slate-500">{p.category}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.stock} PCS</span>
            </td>
            <td className="px-6 py-4 text-blue-900">৳{p.discountPrice || p.price}</td>
            <td className="px-8 py-4 text-right space-x-2">
              <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
              <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SalesTab = ({ sales, searchTerm, onUpdateStatus }: any) => {
  const [activeSubTab, setActiveSubTab] = useState<'Web' | 'POS'>('Web');
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter((s: Sale) => {
      const isPOS = s.id.startsWith('POS-');
      const matchesTab = activeSubTab === 'POS' ? isPOS : !isPOS;
      const matchesSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [sales, activeSubTab, searchTerm]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600';
      case 'Processing': return 'bg-blue-100 text-blue-600';
      case 'Shipped': return 'bg-purple-100 text-purple-600';
      case 'Delivered': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 bg-slate-50/50 border-b flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          {['Web', 'POS'].map((tab) => (
            <button key={tab} onClick={() => setActiveSubTab(tab as any)} className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-blue-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
              {tab === 'Web' ? 'অনলাইন অর্ডার' : 'ইন-শপ বিক্রয়'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-5 text-left">ID</th>
              <th className="px-6 py-5 text-left">Customer</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-8 py-5 text-right">Total</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold text-sm">
            {filteredSales.map((s: Sale) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-8 py-4 font-mono text-xs text-blue-600">#{s.id}</td>
                <td className="px-6 py-4 truncate max-w-[120px]">{s.customerName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-widest ${getStatusColor(s.status)}`}>{s.status}</span>
                </td>
                <td className="px-8 py-4 text-right font-black">৳{s.total}</td>
                <td className="px-8 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setSelectedOrder(s)} className="p-2 text-slate-400 hover:text-blue-600 transition bg-slate-100 rounded-lg"><Eye size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[400] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="text-xl font-black uppercase">Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer info</h4>
                       <p className="text-sm font-black text-slate-800">{selectedOrder.customerName}</p>
                       <p className="text-xs text-slate-500 font-mono">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</h4>
                       <p className="text-xs font-bold text-slate-600">{selectedOrder.customerAddress}, {selectedOrder.customerCity}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Status Control</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => { onUpdateStatus(selectedOrder.id, status as OrderStatus); setSelectedOrder(null); }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === status ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 border-t flex gap-4">
                 <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                   <Printer size={16}/> Print
                 </button>
                 <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Close</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DuesTab = ({ customers, searchTerm, updateDue }: any) => {
  const [selected, setSelected] = useState<any>(null);
  const [amount, setAmount] = useState(0);

  return (
    <div className="p-4 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr>
            <th className="px-8 py-5 text-left">Customer</th>
            <th className="px-6 py-5 text-left">Phone</th>
            <th className="px-6 py-5 text-left">Total Due</th>
            <th className="px-8 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-bold text-sm">
          {customers.filter((c:any) => c.totalDue > 0).map((c:any) => (
            <tr key={c.id}>
              <td className="px-8 py-4">{c.name}</td>
              <td className="px-6 py-4 font-mono">{c.id}</td>
              <td className="px-6 py-4 text-red-600">৳{c.totalDue}</td>
              <td className="px-8 py-4 text-right">
                <button onClick={() => {setSelected(c); setAmount(c.totalDue);}} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs">কালেকশন</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight">বকেয়া গ্রহণ - {selected.name}</h3>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-slate-50 p-4 rounded-2xl mb-4 font-black text-2xl text-center outline-none border" />
            <div className="flex gap-4">
              <button onClick={() => setSelected(null)} className="flex-1 py-4 font-black uppercase text-xs text-slate-400">বাতিল</button>
              <button onClick={async () => { await updateDue(selected.id, selected.name, amount); setSelected(null); }} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">পেমেন্ট নিশ্চিত করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsTab = ({ form, setForm, onSave }: any) => (
  <form onSubmit={onSave} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">ব্র্যান্ডিং ও কন্টাক্ট</h4>
        <InputField label="সাইটের নাম (English)" value={form.siteName} onChange={(v:any) => setForm({...form, siteName: v})} />
        <InputField label="সাইটের নাম (বাংলা)" value={form.siteNameBn} onChange={(v:any) => setForm({...form, siteNameBn: v})} />
        <InputField label="কন্টাক্ট ইমেইল" value={form.contactEmail} onChange={(v:any) => setForm({...form, contactEmail: v})} />
        <InputField label="কন্টাক্ট ফোন" value={form.contactPhone} onChange={(v:any) => setForm({...form, contactPhone: v})} />
        <InputField label="হোয়াটসঅ্যাপ নম্বর" value={form.whatsappNumber} onChange={(v:any) => setForm({...form, whatsappNumber: v})} />
      </div>
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">ঠিকানা ও সোশ্যাল লিঙ্ক</h4>
        <InputField label="ঠিকানা (English)" value={form.address} onChange={(v:any) => setForm({...form, address: v})} />
        <InputField label="ঠিকানা (বাংলা)" value={form.addressBn} onChange={(v:any) => setForm({...form, addressBn: v})} />
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
             <Facebook className="text-blue-600" size={20} />
             <input type="text" placeholder="Facebook URL" value={form.facebookUrl} onChange={(e) => setForm({...form, facebookUrl: e.target.value})} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
          </div>
          <div className="flex items-center gap-3">
             <Instagram className="text-pink-600" size={20} />
             <input type="text" placeholder="Instagram URL" value={form.instagramUrl} onChange={(e) => setForm({...form, instagramUrl: e.target.value})} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
          </div>
          <div className="flex items-center gap-3">
             <Youtube className="text-red-600" size={20} />
             <input type="text" placeholder="Youtube URL" value={form.youtubeUrl} onChange={(e) => setForm({...form, youtubeUrl: e.target.value})} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="pt-6 border-t">
       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">হোমপেজ ব্যানার কন্টেন্ট</h4>
       <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <InputField label="Hero Title (English)" value={form.heroTitleEn} onChange={(v:any) => setForm({...form, heroTitleEn: v})} />
             <InputField label="Hero Subtitle (English)" value={form.heroSubtitleEn} onChange={(v:any) => setForm({...form, heroSubtitleEn: v})} />
          </div>
          <div className="space-y-4">
             <InputField label="Hero Title (বাংলা)" value={form.heroTitleBn} onChange={(v:any) => setForm({...form, heroTitleBn: v})} />
             <InputField label="Hero Subtitle (বাংলা)" value={form.heroSubtitleBn} onChange={(v:any) => setForm({...form, heroSubtitleBn: v})} />
          </div>
       </div>
    </div>

    <div className="pt-6">
      <button type="submit" className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-800 transition">
        সেটিংস সেভ করুন
      </button>
    </div>
  </form>
);

const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition" />
  </div>
);

const AdminModal = ({ type, item, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState<any>(item || {
    name: '', nameBn: '', price: 0, stock: 0, category: Category.LED, image: '', descriptionBn: '', titleBn: '', contentBn: '', date: new Date().toISOString()
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-black uppercase tracking-tight">{item ? 'Update' : 'Create New'} {type}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition"><X size={24}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-10 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="English Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} />
            <InputField label="Bangla Name" value={formData.nameBn} onChange={(v:any) => setFormData({...formData, nameBn: v})} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField type="number" label="Price" value={formData.price} onChange={(v:any) => setFormData({...formData, price: Number(v)})} />
            <InputField type="number" label="Stock" value={formData.stock} onChange={(v:any) => setFormData({...formData, stock: Number(v)})} />
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none">
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <InputField label="Image URL" value={formData.image} onChange={(v:any) => setFormData({...formData, image: v})} />
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Bangla)</label>
            <textarea value={formData.descriptionBn} onChange={(e) => setFormData({...formData, descriptionBn: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none" rows={3} />
          </div>
          
          <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition flex items-center justify-center gap-2 mt-6">
            <Save size={20}/> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
