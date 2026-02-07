import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product } from '../types';
import { 
  Plus, Edit2, Trash2, Package, TrendingUp, AlertCircle, X, Save, 
  Zap, ChevronRight, ShieldCheck, Box, 
  Search, BarChart3, History, Download, DollarSign, RefreshCw
} from 'lucide-react';

const AdminDashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { products, sales, addProduct, updateProduct, deleteProduct, syncWithFirebase } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'analytics'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', nameBn: '', price: 0, category: Category.LED, image: '', description: '', descriptionBn: '', specs: {}, warranty: '', stock: 0
  });

  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.nameBn.includes(searchTerm) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formData.image || 'https://via.placeholder.com/400?text=No+Image';
    if (editingProduct) {
      updateProduct(editingProduct.id, { ...editingProduct, ...formData, image: finalImage } as Product);
    } else {
      addProduct({ ...formData, image: finalImage, id: 'GE-' + Math.random().toString(36).substr(2, 6).toUpperCase() } as Product);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('Control Center', 'নিয়ন্ত্রণ কেন্দ্র')}</h1>
          <p className="text-slate-500 font-medium">{t('Grameen Energy Professional Inventory System', 'গ্রামিন এনার্জি প্রফেশনাল ইনভেন্টরি সিস্টেম')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={syncWithFirebase}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition flex items-center gap-2"
          >
            <RefreshCw size={18}/> {t('Sync Firebase', 'ফায়ারবেস সিঙ্ক')}
          </button>
          <button onClick={() => onNavigate?.('pos')} className="px-6 py-3 bg-blue-100 text-blue-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-200 transition flex items-center gap-2">
            <Zap size={18}/> {t('Sales Terminal', 'বিক্রয় টার্মিনাল')}
          </button>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl flex items-center gap-2">
            <Plus size={18}/> {t('New Entry', 'নতুন এন্ট্রি')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Box size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Total Inventory', 'মোট স্টক')}</p><p className="text-2xl font-black text-slate-900">৳ {totalStockValue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Total Revenue', 'মোট বিক্রয়')}</p><p className="text-2xl font-black text-slate-900">৳ {totalSalesRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Low Stock', 'কম স্টক')}</p><p className="text-2xl font-black text-orange-600">{products.filter(p => p.stock <= 5).length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Transactions', 'লেনদেন')}</p><p className="text-2xl font-black text-slate-900">{sales.length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-6 border-b flex justify-between items-center gap-4">
          <div className="relative flex-1 max-md">
            <Search className="absolute left-4 top-3 text-slate-400" size={18}/>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
              placeholder={t('Search Inventory...', 'স্টক খুঁজুন...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Item Details', 'পণ্যের বিবরণ')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Stock Level', 'স্টক লেভেল')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Asset Value', 'সম্পদ মূল্য')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Control', 'নিয়ন্ত্রণ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover border" alt="" />
                      <div>
                        <p className="font-black text-sm text-slate-900">{p.nameBn}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tighter uppercase">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {p.stock} {t('pcs', 'পিস')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-blue-900">৳ {(p.price * p.stock).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-4 text-right space-x-2">
                    <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingProduct ? t('Update Stock', 'স্টক আপডেট') : t('Inventory Entry', 'স্টক এন্ট্রি')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 transition rounded-xl"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ইংরেজি নাম</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">বাংলা নাম</label>
                  <input required value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">মূল্য</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-black text-blue-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">স্টক</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-black text-blue-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ক্যাটাগরি</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold">
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase text-slate-400">{t('Cancel', 'বাতিল')}</button>
                <button type="submit" className="flex-[2] bg-blue-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl hover:bg-blue-800 transition flex items-center justify-center gap-2">
                  <Save size={16}/> {t('Save Record', 'রেকর্ড সেভ করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;