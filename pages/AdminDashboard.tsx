
// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, Customer, ServiceRequest, StockLog, Staff, StaffSkill } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Search, DollarSign, BarChart3, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity,
  UserPlus, UserMinus, CreditCard, Banknote, Wrench, Clock, MapPin, Calendar, FileText, ArrowUpRight, ArrowDownRight, Briefcase, UserCheck, ShieldOff, Coins, UserCog,
  Upload, Camera, Image as ImageIcon, Loader2
} from 'lucide-react';

type AdminTab = 'overview' | 'inventory' | 'service-requests' | 'technicians' | 'shop-staff' | 'staff-salary' | 'stock-logs' | 'sales' | 'customers' | 'reports';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, stockLogs, customers, serviceRequests, staff, 
    addProduct, updateProduct, deleteProduct, updateServiceRequest, updateCustomerDue,
    addStaff, updateStaff, deleteStaff
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  
  // Editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // Image Upload States (Multi-photo support: 1-5)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number>(0);

  // Service Management State
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assigningStaffId, setAssigningStaffId] = useState('');
  const [manualPrice, setManualPrice] = useState(0);

  const technicians = useMemo(() => {
    return (staff || []).filter(s => !s.role || s.role === 'Technician');
  }, [staff]);

  const shopStaffMembers = useMemo(() => {
    return (staff || []).filter(s => s.role === 'Cashier' || s.role === 'Manager');
  }, [staff]);

  const stats = useMemo(() => ({
    totalValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    potentialProfit: products.reduce((acc, p) => acc + (p.stock * (p.price - p.purchasePrice)), 0),
    totalReceivables: (customers || []).reduce((acc, c) => acc + c.totalDue, 0),
    salesToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length,
    revenueToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0),
    pendingServices: (serviceRequests || []).filter(sr => sr.status === 'Pending').length,
    totalRevenue: (sales || []).reduce((acc, s) => acc + s.total, 0)
  }), [products, sales, customers, serviceRequests]);

  // Image Upload Logic for Multiple Files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 5 - productImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach(file => {
        processImage(file);
      });
    }
  };

  const processImage = (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);
    
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(40);
    reader.onprogress = (data) => {
      if (data.lengthComputable) {
        const progress = Math.round((data.loaded / data.total) * 100);
        setUploadProgress(progress);
      }
    };
    reader.onloadend = () => {
      setProductImages(prev => [...prev, reader.result as string].slice(0, 5));
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const openProductModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      const existingImages = product.images || [];
      const primaryImage = product.image;
      // Ensure primary image is included if it's not already in the array
      setProductImages(existingImages.length > 0 ? existingImages : [primaryImage]);
    } else {
      setProductImages([]);
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    // Main image is the first one, or a placeholder
    const primaryImage = productImages[0] || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400';
    
    const p = {
      name: fd.get('name'),
      nameBn: fd.get('nameBn') || fd.get('name'),
      category: fd.get('category'),
      price: Number(fd.get('price')),
      purchasePrice: Number(fd.get('purchasePrice')),
      stock: Number(fd.get('stock')),
      minStockLevel: Number(fd.get('minStockLevel') || 5),
      sku: fd.get('sku') || 'SKU-'+Date.now(),
      barcode: fd.get('barcode') || Date.now().toString(),
      image: primaryImage,
      images: productImages, // Storing all 5 photos
      description: fd.get('description'),
      descriptionBn: fd.get('descriptionBn'),
      specs: editingProduct?.specs || {}
    };

    if (editingProduct) await updateProduct(editingProduct.id, p);
    else await addProduct(p);
    
    setIsProductModalOpen(false);
    setProductImages([]);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center font-black">GE</div>
           <h2 className="font-black uppercase tracking-widest text-sm">Management</h2>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'inventory', icon: Box, label: 'Stock Master' },
            { id: 'service-requests', icon: Wrench, label: 'Service Jobs', badge: stats.pendingServices },
            { id: 'technicians', icon: Award, label: 'Technicians' },
            { id: 'shop-staff', icon: UserCog, label: 'Shop Staff' },
            { id: 'staff-salary', icon: Coins, label: 'Salary Profiles' },
            { id: 'stock-logs', icon: Activity, label: 'Movement Logs' },
            { id: 'sales', icon: ShoppingCart, label: 'Sales Records' },
            { id: 'customers', icon: Users, label: 'Due Ledger' },
            { id: 'reports', icon: BarChart3, label: 'Profit & Loss' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={18}/> 
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge > 0 && <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full">{tab.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b px-8 flex justify-between items-center shrink-0">
           <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{activeTab.replace('-', ' ')}</h1>
           <div className="flex gap-4">
              {activeTab === 'inventory' && (
                <button onClick={() => openProductModal()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg">
                  <Plus size={16}/> New Product
                </button>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {/* Inventory Tab */}
           {activeTab === 'inventory' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Product Inventory</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Product</th>
                         <th className="px-6 py-5 text-left">Category</th>
                         <th className="px-6 py-5 text-left">Stock</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 flex items-center gap-3">
                              <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                              <p className="text-sm font-black text-slate-800">{p.name}</p>
                           </td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.category}</td>
                           <td className={`px-6 py-4 font-black ${p.stock <= p.minStockLevel ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock}</td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => openProductModal(p)} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
           {/* Other tabs remain same... */}
        </div>
      </main>

      {/* Product Modal with Multiple Image Upload */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] p-10 animate-in zoom-in duration-300 overflow-y-auto max-h-[95vh] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">{editingProduct ? 'Update' : 'New'} Product</h2>
                 <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">✕</button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="grid lg:grid-cols-2 gap-10">
                 
                 {/* Left Column: Image Gallery Upload */}
                 <div className="space-y-6">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1">Product Gallery (Max 5 Photos)</label>
                    
                    <div className="grid grid-cols-5 gap-3 h-24">
                       {[0, 1, 2, 3, 4].map((index) => (
                         <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                            {productImages[index] ? (
                              <>
                                <img src={productImages[index]} className="w-full h-full object-cover" />
                                <button 
                                  type="button" 
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                                >
                                  <X size={12} />
                                </button>
                                {index === 0 && <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[6px] font-black uppercase px-1 rounded-sm">Main</span>}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={20} />
                              </div>
                            )}
                         </div>
                       ))}
                    </div>

                    <div className="relative">
                      {productImages.length > 0 ? (
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                           <img src={productImages[0]} className="w-full h-full object-cover" />
                           <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Primary Preview</div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-[4/3] rounded-[2rem] border-4 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-400 group"
                        >
                           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition group-hover:text-emerald-500">
                              <Upload size={32} />
                           </div>
                           <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Upload Photos</p>
                           <p className="text-[9px] font-bold text-slate-300 mt-1">Select up to 5 photos</p>
                        </div>
                      )}

                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center z-20">
                           <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
                           <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         type="button"
                         disabled={productImages.length >= 5}
                         onClick={() => fileInputRef.current?.click()}
                         className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30"
                       >
                          <ImageIcon size={18} /> {productImages.length > 0 ? 'Add More' : 'Pick from Gallery'}
                       </button>
                       <button 
                         type="button"
                         disabled={productImages.length >= 5}
                         onClick={() => cameraInputRef.current?.click()}
                         className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30"
                       >
                          <Camera size={18} /> Camera
                       </button>
                    </div>

                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                 </div>

                 {/* Right Column: Details */}
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title (EN)</label>
                          <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.name} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title (BN)</label>
                          <input name="nameBn" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.nameBn} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                             <select name="category" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.category}>
                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                             <input name="stock" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.stock} />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (৳)</label>
                             <input name="price" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.price} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost (৳)</label>
                             <input name="purchasePrice" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.purchasePrice} />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                          <textarea name="description" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none h-24" defaultValue={editingProduct?.description} />
                       </div>
                    </div>

                    <div className="pt-6 border-t flex gap-4">
                       <button 
                         type="button" 
                         onClick={() => setIsProductModalOpen(false)}
                         className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit"
                         className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition"
                       >
                         {editingProduct ? 'Update Inventory' : 'Add to Catalog'}
                       </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
