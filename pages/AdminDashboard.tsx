
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Customer, BlogPost, SiteSettings, Sale, OrderStatus, CustomerUser } from '../types';
// Fixed: Added CreditCard and Banknote to imports from lucide-react
import { 
  Plus, Edit2, Trash2, Box, X, Save, Search, DollarSign, RefreshCw, Star, Tag, Users, User,
  Wallet, CheckCircle, Settings, LayoutDashboard, FileText, ShoppingCart, Info, 
  Image as ImageIcon, MapPin, Phone, Eye, ArrowRight, Loader2, Bell, Volume2, 
  Download, Filter, CheckCircle2, Truck, XCircle, Clock, Printer, AlertTriangle, TrendingUp, Hash, Activity, BarChart3,
  CreditCard, Banknote
} from 'lucide-react';

type AdminTab = 'overview' | 'inventory' | 'dues' | 'sales' | 'customers' | 'blogs' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, customers, registeredUsers, blogs, settings, 
    addProduct, updateProduct, deleteProduct, updateSaleStatus, updateCustomerDue, updateSettings, addBlog, deleteBlog 
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [newOrderAlert, setNewOrderAlert] = useState<Sale | null>(null);
  const prevSalesCountRef = useRef(sales.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sales.length > prevSalesCountRef.current) {
      const latestSale = sales[0];
      if (latestSale && latestSale.id.startsWith('GE-')) {
        setNewOrderAlert(latestSale);
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play blocked'));
        }
      }
    }
    prevSalesCountRef.current = sales.length;
  }, [sales]);

  // Daily Pulse Stats
  const todaySales = useMemo(() => sales.filter(s => {
    const saleDate = new Date(s.date).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }), [sales]);

  const dailyStats = useMemo(() => ({
    revenue: todaySales.reduce((acc, s) => acc + s.total, 0),
    count: todaySales.length,
    cash: todaySales.filter(s => s.paymentMethod === 'Cash' || s.paymentMethod === 'Cash on Delivery').length,
    digital: todaySales.filter(s => s.paymentMethod !== 'Cash' && s.paymentMethod !== 'Cash on Delivery').length,
    web: todaySales.filter(s => s.id.startsWith('GE-')).length,
    pos: todaySales.filter(s => s.id.startsWith('POS-')).length,
  }), [todaySales]);

  const lowStockProducts = products.filter(p => p.stock < 5);

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings || {
    siteName: 'Grameen Energy', siteNameBn: 'গ্রামিন এনার্জি',
    contactPhone: '', contactEmail: '', address: '', addressBn: '', whatsappNumber: '',
    heroTitleEn: '', heroTitleBn: '', heroSubtitleEn: '', heroSubtitleBn: ''
  });

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    alert('Settings Updated!');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 relative">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {newOrderAlert && (
        <div className="fixed top-6 right-6 z-[300] w-96 bg-blue-900 text-white p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-500 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Bell className="animate-swing text-emerald-400" size={24}/>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-widest mb-1">New Order!</h4>
              <p className="text-xs text-blue-200 font-bold">#{newOrderAlert.id} from {newOrderAlert.customerName}.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setActiveTab('sales'); setNewOrderAlert(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:bg-emerald-600">View</button>
                <button onClick={() => setNewOrderAlert(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:bg-white/20">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-blue-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-xl">GE</div>
          <h2 className="font-black text-xl tracking-tight uppercase">Admin Panel</h2>
          <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] mt-1">Management Hub</p>
        </div>
        <nav className="p-6 space-y-2 flex-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'ওভারভিউ' },
            { id: 'inventory', icon: Box, label: 'স্টক ম্যানেজমেন্ট' },
            { id: 'sales', icon: ShoppingCart, label: 'অর্ডার ও বিক্রয়' },
            { id: 'customers', icon: Users, label: 'কাস্টমার তালিকা' },
            { id: 'dues', icon: Wallet, label: 'বাকি তালিকা' },
            { id: 'blogs', icon: FileText, label: 'ব্লগ ও আপডেট' },
            { id: 'settings', icon: Settings, label: 'সাইট সেটিংস' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as AdminTab)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${activeTab === item.id ? 'bg-white text-blue-900 shadow-xl scale-[1.02]' : 'hover:bg-white/5 text-blue-100'}`}
            >
              <item.icon size={20}/> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
           <button onClick={() => onNavigate('pos')} className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition shadow-lg">
             <Activity size={16}/> Go to POS
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto bg-[#f8fafc]">
        {/* TOP COMPONENT: Today's Sales Pulse (Pinned at top) */}
        <section className="mb-12 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-10">
             <div className="space-y-4 text-center xl:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full font-black uppercase text-[10px] tracking-widest border border-emerald-500/20">
                 <TrendingUp size={14}/> Today's Sales Pulse
               </div>
               <div>
                 <p className="text-6xl font-black tracking-tighter mb-1">৳{dailyStats.revenue.toLocaleString()}</p>
                 <p className="text-slate-400 font-bold text-sm">{dailyStats.count} Total Transactions Finalized Today</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
               {[
                 { label: 'Web Orders', val: dailyStats.web, icon: ShoppingCart, color: 'blue' },
                 { label: 'POS Sales', val: dailyStats.pos, icon: Activity, color: 'emerald' },
                 { label: 'Digital Pay', val: dailyStats.digital, icon: CreditCard, color: 'purple' },
                 { label: 'Cash Sales', val: dailyStats.cash, icon: Banknote, color: 'amber' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 text-center flex flex-col items-center gap-2 hover:bg-white/10 transition">
                   <stat.icon size={20} className={`text-${stat.color}-400`} />
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black">{stat.val}</p>
                 </div>
               ))}
             </div>
          </div>
          {/* Background visuals */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        </section>

        {/* Dynamic Tab Content */}
        <div className="space-y-10">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3">
                    <BarChart3 size={20} className="text-blue-600"/> Recent Sales Activities
                  </h3>
                  <SalesTab sales={sales.slice(0, 10)} searchTerm="" onUpdateStatus={updateSaleStatus} />
                  <button onClick={() => setActiveTab('sales')} className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition">
                    View Full Sales History
                  </button>
                </div>
              </div>
              <div className="space-y-8">
                {/* Critical Stock Alert */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" /> Critical Stock
                      </h4>
                      <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{lowStockProducts.length} Items</div>
                   </div>
                   <div className="space-y-4">
                      {lowStockProducts.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center text-slate-300 gap-4">
                          <CheckCircle size={40} className="text-emerald-500 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Inventory Healthy</p>
                        </div>
                      ) : lowStockProducts.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100 group hover:bg-red-100 transition">
                          <div className="flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                            <span className="text-[11px] font-black text-slate-700 truncate w-32">{p.nameBn}</span>
                          </div>
                          <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black">{p.stock}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-6">Quick Tools</h4>
                  <div className="grid grid-cols-1 gap-3 relative z-10">
                    <button onClick={() => { setActiveTab('inventory'); setEditingItem(null); setIsModalOpen(true); }} className="w-full flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition">
                      <Plus size={20} className="text-emerald-400"/>
                      <span className="text-xs font-black uppercase tracking-widest">Add New Product</span>
                    </button>
                    <button onClick={() => { setActiveTab('blogs'); setEditingItem(null); setIsModalOpen(true); }} className="w-full flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition">
                      <FileText size={20} className="text-blue-400"/>
                      <span className="text-xs font-black uppercase tracking-widest">Post Blog Update</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standard Tab Views */}
          {activeTab !== 'overview' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px] animate-in slide-in-from-bottom-6 duration-500">
              {activeTab === 'inventory' && <InventoryTab products={products} searchTerm={searchTerm} onEdit={(p:any) => {setEditingItem(p); setIsModalOpen(true);}} onDelete={deleteProduct}/>}
              {activeTab === 'sales' && <SalesTab sales={sales} searchTerm={searchTerm} onUpdateStatus={updateSaleStatus}/>}
              {activeTab === 'customers' && <CustomersTab users={registeredUsers} searchTerm={searchTerm}/>}
              {activeTab === 'dues' && <DuesTab customers={customers} searchTerm={searchTerm} updateDue={updateCustomerDue}/>}
              {activeTab === 'blogs' && <BlogsTab blogs={blogs} searchTerm={searchTerm} onDelete={deleteBlog}/>}
              {activeTab === 'settings' && <SettingsTab form={settingsForm} setForm={setSettingsForm} onSave={handleSettingsUpdate}/>}
            </div>
          )}
        </div>
      </main>

      {/* Reusable Admin Modal */}
      {isModalOpen && (
        <AdminModal 
          type={activeTab === 'inventory' ? 'inventory' : 'blogs'} 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data:any) => {
            if (activeTab === 'inventory') {
              editingItem ? await updateProduct(editingItem.id, data) : await addProduct({...data, id: 'GE-'+Math.floor(1000+Math.random()*9000)});
            } else if (activeTab === 'blogs') {
              await addBlog({...data, id: 'BLOG-'+Date.now()});
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// --- Sub-Components (Cleanly separated) ---

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
                <td className="px-8 py-4 text-right">
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

const BlogsTab = ({ blogs, onDelete }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
        <tr>
          <th className="px-8 py-5 text-left">Title</th>
          <th className="px-6 py-5 text-left">Date</th>
          <th className="px-8 py-5 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 font-bold text-sm">
        {blogs.map((b:any) => (
          <tr key={b.id}>
            <td className="px-8 py-4 flex items-center gap-4">
              <img src={b.image} className="w-10 h-10 rounded-lg object-cover" />
              <span>{b.titleBn}</span>
            </td>
            <td className="px-6 py-4 text-slate-500">{new Date(b.date).toLocaleDateString()}</td>
            <td className="px-8 py-4 text-right">
              <button onClick={() => onDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SettingsTab = ({ form, setForm, onSave }: any) => (
  <form onSubmit={onSave} className="p-10 space-y-8">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">ব্র্যান্ডিং ও কন্টাক্ট</h4>
        <InputField label="সাইটের নাম (English)" value={form.siteName} onChange={(v:any) => setForm({...form, siteName: v})} />
        <InputField label="সাইটের নাম (বাংলা)" value={form.siteNameBn} onChange={(v:any) => setForm({...form, siteNameBn: v})} />
        <InputField label="কন্টাক্ট ইমেইল" value={form.contactEmail} onChange={(v:any) => setForm({...form, contactEmail: v})} />
        <InputField label="কন্টাক্ট ফোন" value={form.contactPhone} onChange={(v:any) => setForm({...form, contactPhone: v})} />
      </div>
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">ঠিকানা ও সোশ্যাল</h4>
        <InputField label="ঠিকানা (English)" value={form.address} onChange={(v:any) => setForm({...form, address: v})} />
        <InputField label="ঠিকানা (বাংলা)" value={form.addressBn} onChange={(v:any) => setForm({...form, addressBn: v})} />
        <InputField label="হোয়াটসঅ্যাপ নম্বর" value={form.whatsappNumber} onChange={(v:any) => setForm({...form, whatsappNumber: v})} />
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
          {type === 'inventory' ? (
            <>
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
            </>
          ) : (
            <>
              <InputField label="Blog Title (Bangla)" value={formData.titleBn} onChange={(v:any) => setFormData({...formData, titleBn: v, title: v})} />
              <InputField label="Image URL" value={formData.image} onChange={(v:any) => setFormData({...formData, image: v})} />
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content (Bangla)</label>
                <textarea value={formData.contentBn} onChange={(e) => setFormData({...formData, contentBn: e.target.value, excerptBn: e.target.value.slice(0, 100)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none" rows={5} />
              </div>
            </>
          )}
          
          <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition flex items-center justify-center gap-2 mt-6">
            <Save size={20}/> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
