
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, StockLog } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Save, Search, DollarSign, RefreshCw, BarChart3, Tag, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity
} from 'lucide-react';
import BarcodeLabel from '../components/BarcodeLabel';

type AdminTab = 'overview' | 'inventory' | 'stock-logs' | 'sales' | 'reports' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, stockLogs, addProduct, updateProduct, deleteProduct, adjustStock, updateSaleStatus, updateSettings, settings
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printingBarcode, setPrintingBarcode] = useState<Product | null>(null);

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.minStockLevel), [products]);

  const stats = useMemo(() => ({
    totalValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    potentialProfit: products.reduce((acc, p) => acc + (p.stock * (p.price - p.purchasePrice)), 0),
    salesToday: sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length,
    revenueToday: sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0)
  }), [products, sales]);

  const handleProductSubmit = async (p: Product) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, p);
    } else {
      await addProduct(p);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center font-black">GE</div>
           <h2 className="font-black uppercase tracking-widest text-sm">Management</h2>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'inventory', icon: Box, label: 'Stock Master' },
            { id: 'stock-logs', icon: Activity, label: 'Movement Logs' },
            { id: 'sales', icon: ShoppingCart, label: 'Sales Records' },
            { id: 'reports', icon: BarChart3, label: 'Profit & Loss' },
            { id: 'settings', icon: Settings, label: 'Configuration' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={18}/> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b px-8 flex justify-between items-center shrink-0">
           <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{activeTab}</h1>
           <div className="flex items-center gap-4">
              {lowStockItems.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
                   <AlertTriangle size={16}/>
                   <span className="text-[10px] font-black uppercase tracking-widest">{lowStockItems.length} LOW STOCK ITEMS</span>
                </div>
              )}
              <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-800 transition">
                 New Product
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {activeTab === 'overview' && (
             <div className="space-y-8">
                <div className="grid md:grid-cols-4 gap-6">
                   {[
                     { label: 'Stock Value (Cost)', val: `৳${stats.totalValue}`, icon: Wallet, color: 'blue' },
                     { label: 'Projected Profit', val: `৳${stats.potentialProfit}`, icon: TrendingUp, color: 'emerald' },
                     { label: 'Revenue Today', val: `৳${stats.revenueToday}`, icon: DollarSign, color: 'purple' },
                     { label: 'Daily Sales', val: stats.salesToday, icon: ShoppingCart, color: 'amber' },
                   ].map(s => (
                     <div key={s.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className={`w-14 h-14 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center`}><s.icon size={28}/></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                          <p className="text-2xl font-black text-slate-900">{s.val}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                   <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                         <AlertTriangle size={20} className="text-red-500" /> Critical Stock Levels
                      </h3>
                      <div className="space-y-4">
                         {lowStockItems.map(item => (
                           <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                              <div className="flex items-center gap-4">
                                 <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                                 <div>
                                    <p className="text-xs font-black text-slate-800">{item.name}</p>
                                    <p className="text-[10px] text-red-600 font-bold">In Stock: {item.stock} / Alert: {item.minStockLevel}</p>
                                 </div>
                              </div>
                              <button onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} className="text-xs font-black uppercase text-blue-600 border-b-2 border-blue-100">Purchase</button>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                         <Activity size={20} className="text-blue-500" /> Recent Movements
                      </h3>
                      <div className="space-y-4">
                        {stockLogs.slice(0, 5).map(log => (
                          <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-xs">
                             <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${log.change > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                   {log.change > 0 ? '+' : ''}{log.change}
                                </div>
                                <div>
                                   <p className="font-black text-slate-800">{log.productName}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{log.reason} • {new Date(log.date).toLocaleTimeString()}</p>
                                </div>
                             </div>
                             <span className="font-mono text-[9px] text-slate-400">{log.id.slice(-6)}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'inventory' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex items-center gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search SKU, Barcode, or Name..." 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Product</th>
                         <th className="px-6 py-5 text-left">Identities</th>
                         <th className="px-6 py-5 text-left">Pricing</th>
                         <th className="px-6 py-5 text-left">Stock</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                 <img src={p.image} className="w-12 h-12 rounded-xl object-cover border" />
                                 <div>
                                    <p className="text-sm font-black text-slate-800">{p.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{p.category}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-mono font-black text-blue-600">BAR: {p.barcode}</p>
                              <p className="text-[10px] font-mono font-black text-slate-400 mt-1">SKU: {p.sku}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-xs font-black text-slate-900">Sell: ৳{p.price}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Cost: ৳{p.purchasePrice}</p>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                 <div className={`text-xs font-black ${p.stock <= p.minStockLevel ? 'text-red-600' : 'text-emerald-600'}`}>
                                    Qty: {p.stock}
                                 </div>
                                 <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all ${p.stock <= p.minStockLevel ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                      style={{ width: `${Math.min(100, (p.stock/50)*100)}%` }}
                                    ></div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => setPrintingBarcode(p)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" title="Print Barcode"><Printer size={18}/></button>
                              <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 size={18}/></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </main>

      {/* Product Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                 <h2 className="text-2xl font-black uppercase tracking-tight">{editingProduct ? 'Update Product' : 'Add New Product'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 text-red-500 rounded-2xl">✕</button>
              </div>
              <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                 <ProductForm initialData={editingProduct} onSubmit={handleProductSubmit} />
              </div>
           </div>
        </div>
      )}

      {printingBarcode && <BarcodeLabel product={printingBarcode} onClose={() => setPrintingBarcode(null)} />}
    </div>
  );
};

const ProductForm = ({ initialData, onSubmit }: any) => {
  const [form, setForm] = useState<Partial<Product>>(initialData || {
    id: 'GE-' + Math.floor(Math.random() * 900000 + 100000),
    barcode: '',
    sku: '',
    name: '',
    nameBn: '',
    category: Category.LED,
    price: 0,
    purchasePrice: 0,
    stock: 0,
    minStockLevel: 5,
    warranty: '',
    image: '',
    specs: {}
  });

  return (
    <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(form as Product); }}>
       <div className="grid md:grid-cols-3 gap-6">
          <Input label="Name (EN)" value={form.name} onChange={v => setForm({...form, name: v})} />
          <Input label="Name (BN)" value={form.nameBn} onChange={v => setForm({...form, nameBn: v})} />
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
             <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none">
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
       </div>

       <div className="grid md:grid-cols-4 gap-6">
          <Input label="Barcode" value={form.barcode} onChange={v => setForm({...form, barcode: v})} />
          <Input label="SKU" value={form.sku} onChange={v => setForm({...form, sku: v})} />
          <Input label="Purchase Price" type="number" value={form.purchasePrice} onChange={v => setForm({...form, purchasePrice: Number(v)})} />
          <Input label="Selling Price" type="number" value={form.price} onChange={v => setForm({...form, price: Number(v)})} />
       </div>

       <div className="grid md:grid-cols-4 gap-6">
          <Input label="Opening Stock" type="number" value={form.stock} onChange={v => setForm({...form, stock: Number(v)})} />
          <Input label="Min Alert Level" type="number" value={form.minStockLevel} onChange={v => setForm({...form, minStockLevel: Number(v)})} />
          <Input label="Warranty" value={form.warranty} onChange={v => setForm({...form, warranty: v})} />
          <Input label="Image URL" value={form.image} onChange={v => setForm({...form, image: v})} />
       </div>

       <button type="submit" className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-blue-800 transition">
          {initialData ? 'Update Record' : 'Save To Inventory'}
       </button>
    </form>
  );
};

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
     <input 
       required 
       type={type} 
       value={value} 
       onChange={e => onChange(e.target.value)} 
       className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-blue-50 transition" 
     />
  </div>
);

export default AdminDashboard;
