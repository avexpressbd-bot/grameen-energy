
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Customer, BlogPost, SiteSettings, Sale } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Save, Search, DollarSign, RefreshCw, Star, Tag, Users, 
  Wallet, CheckCircle, Settings, LayoutDashboard, FileText, ShoppingCart, Info, Image as ImageIcon
} from 'lucide-react';

type AdminTab = 'inventory' | 'dues' | 'sales' | 'blogs' | 'settings';

const AdminDashboard: React.FC = () => {
  const { 
    products, sales, customers, blogs, settings, 
    addProduct, updateProduct, deleteProduct, updateCustomerDue, updateSettings, addBlog, deleteBlog 
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Stats
  const stats = {
    inventory: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
    revenue: sales.reduce((acc, s) => acc + s.total, 0),
    dues: customers.reduce((acc, c) => acc + c.totalDue, 0),
    count: products.length
  };

  // Site Settings Form State
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-blue-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-lg shadow-emerald-500/20">GE</div>
          <h2 className="font-black text-xl tracking-tight uppercase">Admin Panel</h2>
          <p className="text-[10px] text-blue-200 font-bold tracking-widest uppercase mt-1">Command Center</p>
        </div>
        
        <nav className="p-6 space-y-2 flex-1">
          {[
            { id: 'inventory', icon: Box, label: 'স্টক ম্যানেজমেন্ট' },
            { id: 'sales', icon: ShoppingCart, label: 'বিক্রয় রিপোর্ট' },
            { id: 'dues', icon: Wallet, label: 'বাকি তালিকা' },
            { id: 'blogs', icon: FileText, label: 'ব্লগ ও আপডেট' },
            { id: 'settings', icon: Settings, label: 'সাইট সেটিংস' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${activeTab === item.id ? 'bg-white text-blue-900 shadow-xl' : 'hover:bg-white/5 text-blue-100'}`}
            >
              <item.icon size={20}/>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{activeTab}</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage your business details</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-3 text-slate-400" size={18}/>
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-64 outline-none font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'inventory' && (
              <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-emerald-700 transition flex items-center gap-2">
                <Plus size={20}/> নতুন পণ্য
              </button>
            )}
            {activeTab === 'blogs' && (
              <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                <Plus size={20}/> নতুন ব্লগ
              </button>
            )}
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="স্টক মূল্য" value={`৳${stats.inventory.toLocaleString()}`} icon={Box} color="blue" />
          <StatCard label="মোট বিক্রয়" value={`৳${stats.revenue.toLocaleString()}`} icon={ShoppingCart} color="emerald" />
          <StatCard label="মোট বাকি" value={`৳${stats.dues.toLocaleString()}`} icon={Wallet} color="red" />
          <StatCard label="আইটেম সংখ্যা" value={stats.count.toString()} icon={Tag} color="purple" />
        </div>

        {/* Tab Content Rendering */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
          {activeTab === 'inventory' && <InventoryTab products={products} searchTerm={searchTerm} onEdit={(p) => {setEditingItem(p); setIsModalOpen(true);}} onDelete={deleteProduct}/>}
          {activeTab === 'sales' && <SalesTab sales={sales} searchTerm={searchTerm}/>}
          {activeTab === 'dues' && <DuesTab customers={customers} searchTerm={searchTerm} updateDue={updateCustomerDue}/>}
          {activeTab === 'blogs' && <BlogsTab blogs={blogs} searchTerm={searchTerm} onDelete={deleteBlog}/>}
          {activeTab === 'settings' && <SettingsTab form={settingsForm} setForm={setSettingsForm} onSave={handleSettingsUpdate}/>}
        </div>
      </main>

      {/* Dynamic Modals for Inventory and Blogs */}
      {isModalOpen && (
        <AdminModal 
          type={activeTab} 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
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

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}><Icon size={28}/></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const InventoryTab = ({ products, searchTerm, onEdit, onDelete }: any) => (
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
      {products.filter((p:any) => p.nameBn.includes(searchTerm)).map((p:any) => (
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
            <span className={`px-2 py-1 rounded text-[10px] ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.stock} PCS</span>
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
);

const SettingsTab = ({ form, setForm, onSave }: any) => (
  <form onSubmit={onSave} className="p-10 space-y-8 max-w-4xl">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-black text-sm uppercase text-blue-600 border-b pb-2">Business Info</h3>
        <InputField label="Site Name (English)" value={form.siteName} onChange={(v) => setForm({...form, siteName: v})} />
        <InputField label="Site Name (Bangla)" value={form.siteNameBn} onChange={(v) => setForm({...form, siteNameBn: v})} />
        <InputField label="Contact Phone" value={form.contactPhone} onChange={(v) => setForm({...form, contactPhone: v})} />
        <InputField label="WhatsApp Number" value={form.whatsappNumber} onChange={(v) => setForm({...form, whatsappNumber: v})} />
      </div>
      <div className="space-y-4">
        <h3 className="font-black text-sm uppercase text-emerald-600 border-b pb-2">Branding Info</h3>
        <InputField label="Hero Title (English)" value={form.heroTitleEn} onChange={(v) => setForm({...form, heroTitleEn: v})} />
        <InputField label="Hero Title (Bangla)" value={form.heroTitleBn} onChange={(v) => setForm({...form, heroTitleBn: v})} />
        <InputField label="Address" value={form.address} onChange={(v) => setForm({...form, address: v})} />
      </div>
    </div>
    <button type="submit" className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition flex items-center gap-2">
      <Save size={20}/> Save All Settings
    </button>
  </form>
);

const SalesTab = ({ sales, searchTerm }: any) => (
  <table className="w-full">
    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
      <tr>
        <th className="px-8 py-5 text-left">Invoice</th>
        <th className="px-6 py-5 text-left">Customer</th>
        <th className="px-6 py-5 text-left">Date</th>
        <th className="px-6 py-5 text-left">Status</th>
        <th className="px-8 py-5 text-right">Total</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50 font-bold text-sm">
      {sales.map((s: Sale) => (
        <tr key={s.id}>
          <td className="px-8 py-4 font-mono text-blue-600">{s.id}</td>
          <td className="px-6 py-4">{s.customerName} <br/><span className="text-[10px] text-slate-400">{s.customerPhone}</span></td>
          <td className="px-6 py-4 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
          <td className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-[10px] ${s.dueAmount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{s.dueAmount > 0 ? 'DUE' : 'PAID'}</span>
          </td>
          <td className="px-8 py-4 text-right font-black text-slate-900">৳{s.total}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const DuesTab = ({ customers, searchTerm, updateDue }: any) => {
  const [selected, setSelected] = useState<any>(null);
  const [amount, setAmount] = useState(0);

  return (
    <div className="p-4">
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
