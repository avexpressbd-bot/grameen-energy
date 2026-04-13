
// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import BarcodeScanner from '../components/BarcodeScanner';
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
    addStaff, updateStaff, deleteStaff, updateSale, refreshData
  } = useProducts();

  console.log("AdminDashboard products state:", products);
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  
  // Editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  
  // Barcode state
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  
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
    setScannedBarcode(product?.barcode || '');
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
      barcode: scannedBarcode || fd.get('barcode') || Date.now().toString(),
      image: primaryImage,
      images: productImages, // Storing all 5 photos
      description: fd.get('description'),
      descriptionBn: fd.get('descriptionBn'),
      specs: editingProduct?.specs || {}
    };

    try {
      if (editingProduct) await updateProduct(editingProduct.id, p);
      else await addProduct(p);
      setIsProductModalOpen(false);
      setProductImages([]);
      setScannedBarcode('');
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save product. Please check your connection and permissions.");
    }
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
                    <div className="flex gap-2 w-full md:w-auto">
                       <button 
                         onClick={refreshData}
                         className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
                       >
                         Refresh
                       </button>
                       <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold border-none"
                            onChange={(e) => setInventorySearch(e.target.value)}
                          />
                       </div>
                       <button 
                         onClick={() => setIsBarcodeScannerOpen(true)}
                         className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                       >
                         <Camera size={18} />
                       </button>
                    </div>
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
                      {products.filter(p => {
                        const search = inventorySearch.toLowerCase();
                        return (
                          p.name?.toLowerCase().includes(search) || 
                          p.nameBn?.toLowerCase().includes(search) ||
                          p.barcode?.includes(search) ||
                          p.sku?.toLowerCase().includes(search)
                        );
                      }).map(p => (
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
           {/* Overview Tab */}
           {activeTab === 'overview' && (
             <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Inventory Value', value: `৳${stats.totalValue.toLocaleString()}`, icon: Box, color: 'bg-blue-500' },
                   { label: 'Potential Profit', value: `৳${stats.potentialProfit.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-500' },
                   { label: 'Total Receivables', value: `৳${stats.totalReceivables.toLocaleString()}`, icon: Wallet, color: 'bg-amber-500' },
                   { label: 'Sales Today', value: stats.salesToday, icon: ShoppingCart, color: 'bg-purple-500' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
                     <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                       <stat.icon size={24} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="text-xl font-black text-slate-800">{stat.value}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="grid lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Recent Sales</h3>
                       <button onClick={() => setActiveTab('sales')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All</button>
                    </div>
                    <div className="space-y-4">
                       {sales.slice(0, 5).map(sale => (
                         <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                  <ShoppingCart size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800">{sale.customerName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(sale.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <p className="font-black text-slate-800">৳{sale.total}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Pending Services</h3>
                       <button onClick={() => setActiveTab('service-requests')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Manage</button>
                    </div>
                    <div className="space-y-4">
                       {serviceRequests.filter(sr => sr.status === 'Pending').slice(0, 5).map(sr => (
                         <div key={sr.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                  <Wrench size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800">{sr.serviceType}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{sr.customerName}</p>
                               </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-full">Pending</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             </div>
           )}

           {/* Service Requests Tab */}
           {activeTab === 'service-requests' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Service Jobs Queue</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                           <th className="px-8 py-5 text-left">Customer</th>
                           <th className="px-6 py-5 text-left">Service</th>
                           <th className="px-6 py-5 text-left">Status</th>
                           <th className="px-6 py-5 text-left">Assigned To</th>
                           <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {serviceRequests.map(sr => (
                          <tr key={sr.id} className="hover:bg-slate-50">
                             <td className="px-8 py-4">
                                <p className="text-sm font-black text-slate-800">{sr.customerName}</p>
                                <p className="text-[10px] font-bold text-slate-400">{sr.customerPhone}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-600">{sr.serviceType}</p>
                                <p className="text-[10px] text-slate-400 italic truncate max-w-[150px]">{sr.problemDescription}</p>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                  sr.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                  sr.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                  sr.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {sr.status}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-800">{sr.assignedStaffName || 'Unassigned'}</p>
                             </td>
                             <td className="px-8 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <select 
                                    className="text-[10px] font-black uppercase bg-slate-100 border-none rounded-lg p-2"
                                    onChange={(e) => {
                                      const tech = technicians.find(t => t.id === e.target.value);
                                      if (tech) updateServiceRequest(sr.id, { assignedStaffId: tech.id, assignedStaffName: tech.name, status: 'Assigned' });
                                    }}
                                    value={sr.assignedStaffId || ''}
                                  >
                                    <option value="">Assign Tech</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                  </select>
                                  <button 
                                    onClick={() => updateServiceRequest(sr.id, { status: 'Completed' })}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             </div>
           )}

           {/* Technicians & Shop Staff Tabs */}
           {(activeTab === 'technicians' || activeTab === 'shop-staff') && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                   {activeTab === 'technicians' ? 'Technicians' : 'Shop Staff'}
                 </h2>
                 <button onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg">
                    <Plus size={16}/> New Staff
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {(activeTab === 'technicians' ? technicians : shopStaffMembers).map(s => (
                   <div key={s.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group">
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit2 size={14}/></button>
                        <button onClick={() => deleteStaff(s.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={14}/></button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <img src={s.photo} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50" />
                        <div>
                          <h4 className="font-black text-slate-800">{s.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-2 h-2 rounded-full ${s.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span className="text-[9px] font-black uppercase text-slate-500">{s.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                          <p className="text-xs font-bold text-slate-700">{s.phone}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                          <p className="text-xs font-bold text-slate-700">{s.experience} Years</p>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Salary Profiles Tab */}
           {activeTab === 'staff-salary' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Staff Salary Profiles</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Staff Name</th>
                         <th className="px-6 py-5 text-left">Role</th>
                         <th className="px-6 py-5 text-left">Type</th>
                         <th className="px-6 py-5 text-right">Base Salary</th>
                         <th className="px-8 py-5 text-right">Commission</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-slate-800 text-sm">{s.name}</td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{s.role}</td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{s.salaryType}</td>
                           <td className="px-6 py-4 text-right font-black text-slate-800">৳{s.baseSalary}</td>
                           <td className="px-8 py-4 text-right font-black text-emerald-600">৳{s.commissionPerService}/job</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Movement Logs Tab */}
           {activeTab === 'stock-logs' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Stock Movement History</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Date</th>
                         <th className="px-6 py-5 text-left">Product</th>
                         <th className="px-6 py-5 text-left">Reason</th>
                         <th className="px-6 py-5 text-right">Change</th>
                         <th className="px-8 py-5 text-right">User</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stockLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 text-xs font-bold text-slate-500">{new Date(log.date).toLocaleString()}</td>
                           <td className="px-6 py-4 font-black text-slate-800 text-sm">{log.productName}</td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                log.reason === 'Sale' ? 'bg-blue-100 text-blue-700' :
                                log.reason === 'Purchase' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {log.reason}
                              </span>
                           </td>
                           <td className={`px-6 py-4 text-right font-black ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {log.change > 0 ? '+' : ''}{log.change}
                           </td>
                           <td className="px-8 py-4 text-right text-xs font-bold text-slate-500">{log.user}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Sales Records Tab */}
           {activeTab === 'sales' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Sales History</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Order ID</th>
                         <th className="px-6 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Date</th>
                         <th className="px-6 py-5 text-right">Total</th>
                         <th className="px-6 py-5 text-right">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {sales.map(sale => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-slate-800 text-xs">#{sale.id.slice(-6)}</td>
                           <td className="px-6 py-4">
                              <p className="text-sm font-black text-slate-800">{sale.customerName}</p>
                              <p className="text-[10px] font-bold text-slate-400">{sale.customerPhone}</p>
                           </td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-right font-black text-slate-800">৳{sale.total}</td>
                           <td className="px-8 py-4 text-right">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                 sale.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                 sale.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                 sale.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                 'bg-blue-100 text-blue-700'
                               }`}>
                                 {sale.status || 'Paid'}
                               </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                               <button 
                                 onClick={() => { setEditingSale(sale); setIsSaleModalOpen(true); }}
                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                               >
                                 <Edit2 size={16} />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Due Ledger Tab */}
           {activeTab === 'customers' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Customer Due Ledger</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Last Update</th>
                         <th className="px-6 py-5 text-right">Total Due</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-slate-800 text-sm">{c.name} <span className="text-slate-400 font-normal ml-2">({c.id})</span></td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(c.lastUpdate).toLocaleDateString()}</td>
                           <td className={`px-6 py-4 text-right font-black ${c.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>৳{c.totalDue}</td>
                           <td className="px-8 py-4 text-right">
                              <button 
                                onClick={() => { setSelectedCustomer(c); setCollectionAmount(0); }}
                                className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition"
                              >
                                Collect
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Reports Tab */}
           {activeTab === 'reports' && (
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                      <p className="text-2xl font-black text-slate-800">৳{stats.totalRevenue.toLocaleString()}</p>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cost</p>
                      <p className="text-2xl font-black text-slate-800">৳{(stats.totalRevenue - stats.potentialProfit).toLocaleString()}</p>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Gross Profit</p>
                      <p className="text-2xl font-black text-emerald-600">৳{stats.potentialProfit.toLocaleString()}</p>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px] mb-8">Monthly Performance</h3>
                   <div className="h-64 flex items-end gap-4">
                      {[65, 45, 75, 55, 85, 95, 70].map((val, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group">
                           <div 
                             className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-2xl transition-all duration-500 group-hover:bg-blue-600" 
                             style={{ height: `${val}%` }}
                           ></div>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 px-2">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(m => (
                        <span key={m} className="text-[10px] font-black uppercase text-slate-400">{m}</span>
                      ))}
                   </div>
                </div>
             </div>
           )}

        </div>
      </main>

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 animate-in zoom-in duration-300 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">{editingStaff ? 'Update' : 'New'} Staff Member</h2>
                 <button onClick={() => setIsStaffModalOpen(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">✕</button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const s = {
                  id: editingStaff?.id || 'ST-' + Date.now(),
                  name: fd.get('name') as string,
                  phone: fd.get('phone') as string,
                  whatsapp: fd.get('whatsapp') as string,
                  photo: fd.get('photo') as string || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                  role: fd.get('role') as StaffRole,
                  status: (fd.get('status') as StaffStatus) || 'Available',
                  skills: (fd.get('skills') as string).split(',').map(s => s.trim()) as StaffSkill[],
                  area: fd.get('area') as string,
                  experience: Number(fd.get('experience')),
                  baseSalary: Number(fd.get('baseSalary')),
                  salaryType: fd.get('salaryType') as SalaryType,
                  commissionPerService: Number(fd.get('commissionPerService')),
                  overtimeRate: Number(fd.get('overtimeRate')),
                  isActive: true,
                  isEmergencyStaff: fd.get('isEmergencyStaff') === 'on',
                  rating: editingStaff?.rating || 5,
                  totalJobs: editingStaff?.totalJobs || 0,
                  joinedAt: editingStaff?.joinedAt || new Date().toISOString()
                };
                if (editingStaff) await updateStaff(editingStaff.id, s);
                else await addStaff(s);
                setIsStaffModalOpen(false);
              }} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.name} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <input name="phone" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.phone} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                       <select name="role" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.role}>
                          <option value="Technician">Technician</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Manager">Manager</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Type</label>
                       <select name="salaryType" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.salaryType}>
                          <option value="Monthly">Monthly</option>
                          <option value="Daily">Daily</option>
                          <option value="Per Job">Per Job</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary (৳)</label>
                       <input name="baseSalary" type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.baseSalary} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commission (৳)</label>
                       <input name="commissionPerService" type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.commissionPerService} />
                    </div>
                 </div>
                 <div className="pt-6 border-t flex gap-4">
                    <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition">
                       {editingStaff ? 'Update Staff' : 'Add Staff Member'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Collection Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 animate-in zoom-in duration-300 shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-2">Collect Payment</h2>
              <p className="text-slate-400 text-sm mb-8 font-bold">Customer: {selectedCustomer.name}</p>
              
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                    <p className="text-2xl font-black text-red-600">৳{selectedCustomer.totalDue}</p>
                 </div>
                 
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Collect</label>
                    <input 
                      type="number" 
                      className="w-full p-6 bg-slate-50 rounded-2xl font-black text-2xl border-none text-emerald-600" 
                      value={collectionAmount}
                      onChange={(e) => setCollectionAmount(Number(e.target.value))}
                    />
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setSelectedCustomer(null)} className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                    <button 
                      onClick={async () => {
                        await updateCustomerDue(selectedCustomer.id, selectedCustomer.name, collectionAmount);
                        setSelectedCustomer(null);
                      }}
                      className="flex-[2] py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20"
                    >
                      Confirm Collection
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

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
      {/* Barcode Scanner Modal */}
      {isBarcodeScannerOpen && (
        <BarcodeScanner 
          onScan={(code) => {
            setScannedBarcode(code);
            setIsBarcodeScannerOpen(false);
          }}
          onClose={() => setIsBarcodeScannerOpen(false)}
        />
      )}

      {/* Sale Edit Modal */}
      {isSaleModalOpen && editingSale && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-xl font-black text-slate-800">Edit Order History</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Order #{editingSale.id.slice(-6)}</p>
                 </div>
                 <button onClick={() => setIsSaleModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition text-slate-400">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const updatedSale = {
                  ...editingSale,
                  customerName: fd.get('customerName'),
                  customerPhone: fd.get('customerPhone'),
                  customerAddress: fd.get('customerAddress'),
                  status: fd.get('status') as OrderStatus,
                  total: Number(fd.get('total')),
                  paidAmount: Number(fd.get('paidAmount')),
                  dueAmount: Number(fd.get('total')) - Number(fd.get('paidAmount')),
                };
                try {
                  await updateSale(editingSale.id, updatedSale);
                  setIsSaleModalOpen(false);
                } catch (err) {
                  alert("Failed to update sale");
                }
              }} className="flex-1 overflow-y-auto p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                       <input name="customerName" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingSale.customerName} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <input name="customerPhone" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingSale.customerPhone} />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                    <textarea name="customerAddress" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none h-20" defaultValue={editingSale.customerAddress} />
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount</label>
                       <input name="total" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingSale.total} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid Amount</label>
                       <input name="paidAmount" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingSale.paidAmount} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                       <select name="status" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingSale.status}>
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="pt-6 border-t flex gap-4">
                    <button type="button" onClick={() => setIsSaleModalOpen(false)} className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition">
                       Cancel
                    </button>
                    <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition">
                       Update Order
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
