import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product } from '../types';
import { 
  Plus, Edit2, Trash2, Package, TrendingUp, AlertCircle, X, Save, 
  Zap, ChevronRight, ShieldCheck, Box, 
  Search, BarChart3, History, Download, DollarSign, RefreshCw, ImageIcon, Star, Tag
} from 'lucide-react';

const AdminDashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { products, sales, addProduct, updateProduct, deleteProduct, syncWithFirebase } = useProducts();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const initialForm: Partial<Product> = {
    name: '', 
    nameBn: '', 
    price: 0, 
    discountPrice: 0,
    category: Category.LED, 
    image: '', 
    description: '', 
    descriptionBn: '', 
    specs: { 'Wattage': '', 'Type': '' }, 
    warranty: '', 
    stock: 0,
    isBestSeller: false,
    isOffer: false
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialForm);

  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.nameBn.includes(searchTerm) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formData.image || 'https://via.placeholder.com/400?text=No+Image';
    
    if (editingProduct) {
      await updateProduct(editingProduct.id, { ...editingProduct, ...formData, image: finalImage } as Product);
    } else {
      const newId = 'GE-' + Math.floor(1000 + Math.random() * 9000);
      await addProduct({ ...formData, image: finalImage, id: newId } as Product);
    }
    
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('Admin Control', 'অ্যাডমিন প্যানেল')}</h1>
          <p className="text-slate-500 font-medium">{t('Grameen Energy Professional Inventory', 'গ্রামিন এনার্জি ইনভেন্টরি ম্যানেজমেন্ট')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={syncWithFirebase}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition flex items-center gap-2"
          >
            <RefreshCw size={18}/> {t('Reload Data', 'ডাটা লোড করুন')}
          </button>
          <button onClick={openAddModal} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl flex items-center gap-2">
            <Plus size={18}/> {t('Add New Product', 'নতুন পণ্য যোগ করুন')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Box size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Total Inventory', 'মোট স্টক মূল্য')}</p><p className="text-2xl font-black text-slate-900">৳ {totalStockValue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Total Revenue', 'মোট বিক্রয়')}</p><p className="text-2xl font-black text-slate-900">৳ {totalSalesRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Low Stock', 'স্টক কম আছে')}</p><p className="text-2xl font-black text-orange-600">{products.filter(p => p.stock <= 5).length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Transactions', 'মোট মেমো')}</p><p className="text-2xl font-black text-slate-900">{sales.length}</p></div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-6 border-b flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3 text-slate-400" size={18}/>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
              placeholder={t('Search Inventory...', 'স্টক থেকে পণ্য খুঁজুন...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Product Info', 'পণ্যের তথ্য')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Category', 'ক্যাটাগরি')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Stock', 'স্টক')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Price', 'মূল্য')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Control', 'নিয়ন্ত্রণ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover border bg-white" alt="" />
                      <div>
                        <p className="font-black text-sm text-slate-900">{p.nameBn}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {p.stock} {t('pcs', 'পিস')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-blue-900">৳ {p.discountPrice || p.price}</p>
                  </td>
                  <td className="px-8 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
              কোনো পণ্য পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
            <div className="px-10 py-6 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  {editingProduct ? <Edit2 size={20}/> : <Plus size={20}/>}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {editingProduct ? t('Update Product', 'পণ্য আপডেট করুন') : t('Add New Product', 'নতুন পণ্য যোগ করুন')}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 transition rounded-xl"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Names */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ইংরেজি নাম (English Name)</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="e.g. Solar Panel 100W" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">বাংলা নাম (Bangla Name)</label>
                    <input required value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="যেমন: সোলার প্যানেল ১০০ ওয়াট" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">মূল দাম (Regular Price)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 rounded-2xl px-5 py-3 text-sm font-black text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">অফার দাম (Offer Price)</label>
                      <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: Number(e.target.value)})} className="w-full bg-emerald-50/30 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl px-5 py-3 text-sm font-black text-emerald-600 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Meta & Category */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ক্যাটাগরি</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none cursor-pointer">
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">স্টক পরিমাণ</label>
                      <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-black text-blue-900 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ওয়ারেন্টি (Warranty)</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-3 text-slate-300" size={18}/>
                      <input value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full pl-12 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="যেমন: ২ বছর" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-3 p-4 bg-yellow-50/50 rounded-2xl cursor-pointer border border-transparent hover:border-yellow-200 transition">
                      <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                      <div className="flex items-center gap-1.5 font-bold text-xs text-yellow-700 uppercase"><Star size={14}/> Best Seller</div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl cursor-pointer border border-transparent hover:border-emerald-200 transition">
                      <input type="checkbox" checked={formData.isOffer} onChange={e => setFormData({...formData, isOffer: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 uppercase"><Tag size={14}/> active offer</div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">বিবরণ (Bangla Description)</label>
                  <textarea rows={3} value={formData.descriptionBn} onChange={e => setFormData({...formData, descriptionBn: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-medium outline-none resize-none" placeholder="পণ্যের বিস্তারিত বাংলা বিবরণ..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ছবির লিংক (Image URL)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-3 text-slate-300" size={18}/>
                    <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full pl-12 bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-mono outline-none" placeholder="https://image-url.com/photo.jpg" />
                  </div>
                  {formData.image && (
                    <div className="mt-2 h-20 w-20 rounded-xl overflow-hidden border border-slate-100">
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Invalid')} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition">{t('Cancel', 'বাতিল')}</button>
                <button type="submit" className="flex-[2] bg-blue-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-800 transition flex items-center justify-center gap-2 transform active:scale-95">
                  <Save size={18}/> {editingProduct ? t('Update Record', 'রেকর্ড আপডেট করুন') : t('Save Product', 'পণ্য সেভ করুন')}
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