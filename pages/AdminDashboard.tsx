// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, Customer, ServiceRequest, StockLog, Staff, StaffSkill } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Search, DollarSign, BarChart3, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity,
  UserPlus, UserMinus, CreditCard, Banknote, Wrench, Clock, MapPin, Calendar, FileText, ArrowUpRight, ArrowDownRight, Briefcase, UserCheck, ShieldOff
} from 'lucide-react';
import BarcodeLabel from '../components/BarcodeLabel';

type AdminTab = 'overview' | 'inventory' | 'service-requests' | 'staff' | 'stock-logs' | 'sales' | 'customers' | 'reports';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, stockLogs, customers, serviceRequests, staff, 
    addProduct, updateProduct, deleteProduct, updateServiceRequest, updateCustomerDue,
    addStaff, updateStaff, deleteStaff
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  
  // Editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number>(0);

  // Service Management State
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assigningStaffId, setAssigningStaffId] = useState('');
  const [manualPrice, setManualPrice] = useState(0);

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.minStockLevel), [products]);

  const stats = useMemo(() => ({
    totalValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    potentialProfit: products.reduce((acc, p) => acc + (p.stock * (p.price - p.purchasePrice)), 0),
    totalReceivables: (customers || []).reduce((acc, c) => acc + c.totalDue, 0),
    salesToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length,
    revenueToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0),
    pendingServices: (serviceRequests || []).filter(sr => sr.status === 'Pending').length
  }), [products, sales, customers, serviceRequests]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const p: any = {
      name: formData.get('name'),
      nameBn: formData.get('name'),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      purchasePrice: Number(formData.get('purchasePrice') || 0),
      stock: Number(formData.get('stock')),
      minStockLevel: Number(formData.get('minStockLevel') || 5),
      image: formData.get('image') || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200',
      description: '',
      descriptionBn: '',
      specs: {},
      barcode: formData.get('barcode') || Date.now().toString()
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, p);
    } else {
      await addProduct(p);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const s: any = {
      id: editingStaff?.id || 'ST-' + Date.now(),
      name: formData.get('name'),
      phone: formData.get('phone'),
      whatsapp: formData.get('whatsapp'),
      area: formData.get('area'),
      experience: Number(formData.get('experience')),
      photo: formData.get('photo') || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      status: formData.get('status') as any,
      role: formData.get('role') as any,
      baseSalary: Number(formData.get('baseSalary') || 0),
      salaryType: formData.get('salaryType') as any,
      commissionPerService: Number(formData.get('commission') || 0),
      overtimeRate: Number(formData.get('overtime') || 0),
      isActive: formData.get('isActive') === 'on',
      skills: formData.get('skills')?.toString().split(',').map(s => s.trim()) as any[],
      isEmergencyStaff: formData.get('isEmergency') === 'on',
      rating: editingStaff?.rating || 5.0,
      totalJobs: editingStaff?.totalJobs || 0,
      joinedAt: formData.get('joinedAt') || editingStaff?.joinedAt || new Date().toISOString()
    };

    if (editingStaff) {
      await updateStaff(editingStaff.id, s);
    } else {
      await addStaff(s);
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleDueCollection = async () => {
    if (!selectedCustomer || collectionAmount <= 0) return;
    await updateCustomerDue(selectedCustomer.id, selectedCustomer.name, collectionAmount);
    setSelectedCustomer(null);
    setCollectionAmount(0);
    alert('Payment recorded successfully!');
  };

  const handleServiceUpdate = async () => {
    if (!selectedRequest) return;
    const staffMember = staff.find(s => s.id === assigningStaffId);
    
    await updateServiceRequest(selectedRequest.id, {
      assignedStaffId: assigningStaffId || selectedRequest.assignedStaffId,
      assignedStaffName: staffMember?.name || selectedRequest.assignedStaffName,
      manualPrice: manualPrice || selectedRequest.manualPrice,
      status: assigningStaffId ? 'Assigned' : selectedRequest.status
    });
    
    setSelectedRequest(null);
    setAssigningStaffId('');
    setManualPrice(0);
    alert('Service request updated!');
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
            { id: 'staff', icon: Briefcase, label: 'Staff Master' },
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
           <div className="flex items-center gap-4">
              {lowStockItems.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
                   <AlertTriangle size={16}/>
                   <span className="text-[10px] font-black uppercase tracking-widest">{lowStockItems.length} LOW STOCK</span>
                </div>
              )}
              {activeTab === 'inventory' && (
                <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                   New Product
                </button>
              )}
              {activeTab === 'staff' && (
                <button onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                   Add Staff Member
                </button>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           {/* Tab: OVERVIEW */}
           {activeTab === 'overview' && (
             <div className="space-y-8">
                <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {[
                     { label: 'Stock Value', val: `৳${stats.totalValue}`, icon: Wallet, color: 'blue' },
                     { label: 'Profit Projection', val: `৳${stats.potentialProfit}`, icon: TrendingUp, color: 'emerald' },
                     { label: 'Total Due', val: `৳${stats.totalReceivables}`, icon: UserMinus, color: 'red' },
                     { label: 'Revenue Today', val: `৳${stats.revenueToday}`, icon: DollarSign, color: 'purple' },
                     { label: 'Services', val: stats.pendingServices, icon: Wrench, color: 'amber' },
                   ].map(s => (
                     <div key={s.label} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`w-10 h-10 bg-${s.color}-50 text-${s.color}-600 rounded-xl flex items-center justify-center shrink-0`}><s.icon size={20}/></div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                          <p className="text-base font-black text-slate-900">{s.val}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2">Critical Stock Levels</h3>
                    <div className="space-y-3">
                      {lowStockItems.length > 0 ? lowStockItems.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                          <span className="text-xs font-black text-slate-700">{p.name}</span>
                          <span className="text-xs font-black text-red-600">Stock: {p.stock}</span>
                        </div>
                      )) : <p className="text-center text-slate-400 text-xs py-4">All stock levels are healthy.</p>}
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2">Staff Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Team</p>
                        <p className="text-xl font-black">{staff.length}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Staff</p>
                        <p className="text-xl font-black text-emerald-600">{staff.filter(s => s.isActive).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           )}

           {/* Tab: STAFF MASTER */}
           {activeTab === 'staff' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Staff & Salary Profiles</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                           <th className="px-8 py-5 text-left">Member</th>
                           <th className="px-6 py-5 text-left">Role</th>
                           <th className="px-6 py-5 text-left">Salary Type</th>
                           <th className="px-6 py-5 text-left">Base Pay</th>
                           <th className="px-6 py-5 text-left">Status</th>
                           <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {staff && staff.length > 0 ? (
                          staff.map(s => (
                            <tr key={s.id} className={`hover:bg-slate-50 transition ${!s.isActive ? 'opacity-50' : ''}`}>
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                     <img src={s.photo} className="w-10 h-10 rounded-xl object-cover border" alt="" />
                                     <div>
                                        <p className="text-sm font-black text-slate-800">{s.name}</p>
                                        <p className="text-[10px] font-mono text-blue-600">{s.phone}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase`}>{s.role || 'Member'}</span>
                               </td>
                               <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{s.salaryType}</td>
                               <td className="px-6 py-4 font-black text-sm">৳{s.baseSalary}</td>
                               <td className="px-6 py-4">
                                  {s.isActive ? (
                                    <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                      <UserCheck size={12}/> Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                      <ShieldOff size={12}/> Inactive
                                    </span>
                                  )}
                               </td>
                               <td className="px-8 py-4 text-right space-x-2">
                                  <button onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                                  <button onClick={() => deleteStaff(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                               </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase">No Staff Registered</td></tr>
                        )}
                     </tbody>
                  </table>
                </div>
             </div>
           )}

           {/* Tab: STOCK LOGS */}
           {activeTab === 'stock-logs' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Date</th>
                         <th className="px-6 py-5 text-left">Product</th>
                         <th className="px-6 py-5 text-left">Reason</th>
                         <th className="px-6 py-5 text-right">Change</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stockLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 text-xs font-bold text-slate-500">{new Date(log.date).toLocaleString()}</td>
                           <td className="px-6 py-4 font-black text-sm text-slate-800">{log.productName}</td>
                           <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500">{log.reason}</span></td>
                           <td className={`px-6 py-4 text-right font-black ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{log.change > 0 ? `+${log.change}` : log.change}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Tab: SALES RECORDS */}
           {activeTab === 'sales' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Inv ID</th>
                         <th className="px-6 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Total</th>
                         <th className="px-6 py-5 text-left">Status</th>
                         <th className="px-8 py-5 text-right">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {sales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-mono font-black text-xs text-blue-600">#{s.id}</td>
                           <td className="px-6 py-4">
                              <p className="text-xs font-black text-slate-800">{s.customerName}</p>
                              <p className="text-[10px] text-slate-400">{s.customerPhone}</p>
                           </td>
                           <td className="px-6 py-4 font-black text-sm">৳{s.total}</td>
                           <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">{s.status}</span></td>
                           <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Tab: CUSTOMERS */}
           {activeTab === 'customers' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Name</th>
                         <th className="px-6 py-5 text-left">Phone</th>
                         <th className="px-6 py-5 text-left">Balance Due</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {customers.map(c => (
                        <tr key={c.id} className={`hover:bg-slate-50 ${c.totalDue > 0 ? 'bg-red-50/10' : ''}`}>
                           <td className="px-8 py-4 font-black text-sm text-slate-800">{c.name}</td>
                           <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.id}</td>
                           <td className={`px-6 py-4 font-black ${c.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>৳{c.totalDue}</td>
                           <td className="px-8 py-4 text-right">
                              <button 
                                onClick={() => setSelectedCustomer(c)}
                                className="px-4 py-2 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-blue-800 transition"
                              >
                                Record Payment
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Tab: REPORTS */}
           {activeTab === 'reports' && (
             <div className="space-y-8">
               <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Sales Revenue</p>
                   <p className="text-3xl font-black text-blue-900">৳{sales.reduce((acc, s) => acc + s.total, 0)}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Cost</p>
                   <p className="text-3xl font-black text-slate-800">৳{stats.totalValue}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Projected Profit</p>
                   <p className="text-3xl font-black text-emerald-600">৳{stats.potentialProfit}</p>
                 </div>
               </div>
             </div>
           )}

        </div>
      </main>

      {/* Staff Modal (With Salary Profile) */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight">{editingStaff ? 'Edit Staff Profile' : 'New Staff Registration'}</h2>
                 <button onClick={() => setIsStaffModalOpen(false)} className="p-2 text-red-500">✕</button>
              </div>
              <form onSubmit={handleStaffSubmit} className="space-y-8">
                 {/* Basic Info */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Name" defaultValue={editingStaff?.name} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input name="phone" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="01XXXXXXXXX" defaultValue={editingStaff?.phone} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                      <select name="role" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingStaff?.role || 'Technician'}>
                         <option value="Technician">Technician</option>
                         <option value="Cashier">Cashier</option>
                         <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Join Date</label>
                      <input name="joinedAt" type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingStaff?.joinedAt ? editingStaff.joinedAt.split('T')[0] : ''} />
                    </div>
                 </div>

                 {/* Salary Profile Section */}
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2">
                       <DollarSign size={16}/> Salary & Benefits
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Type</label>
                         <select name="salaryType" className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" defaultValue={editingStaff?.salaryType || 'Monthly'}>
                            <option value="Monthly">Monthly</option>
                            <option value="Daily">Daily</option>
                            <option value="Per Job">Per Job</option>
                            <option value="Commission">Commission Based</option>
                         </select>
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary (৳)</label>
                         <input name="baseSalary" type="number" required className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" defaultValue={editingStaff?.baseSalary} />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comm. Per Service (৳)</label>
                         <input name="commission" type="number" className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" defaultValue={editingStaff?.commissionPerService} />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overtime Rate (৳/hr)</label>
                         <input name="overtime" type="number" className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" defaultValue={editingStaff?.overtimeRate} />
                       </div>
                    </div>
                 </div>

                 {/* Additional Details */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Area</label>
                      <input name="area" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Ex: Uttara" defaultValue={editingStaff?.area} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <input name="whatsapp" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="8801..." defaultValue={editingStaff?.whatsapp} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Photo URL</label>
                      <input name="photo" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingStaff?.photo} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skills (Comma separated)</label>
                      <input name="skills" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingStaff?.skills?.join(', ')} />
                    </div>
                 </div>

                 {/* Status Switches */}
                 <div className="flex flex-wrap gap-8 py-4 border-t">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input name="isActive" type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked={editingStaff ? editingStaff.isActive : true} />
                       <span className="text-xs font-black uppercase text-slate-700 tracking-tight group-hover:text-emerald-600 transition">Active Status</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input name="isEmergency" type="checkbox" className="w-5 h-5 accent-red-500" defaultChecked={editingStaff?.isEmergencyStaff} />
                       <span className="text-xs font-black uppercase text-slate-700 tracking-tight group-hover:text-red-600 transition">Emergency Duty</span>
                    </label>
                 </div>

                 <button className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition">Save Staff Profile</button>
              </form>
           </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight">{editingProduct ? 'Update' : 'New'} Product</h2>
                 <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-red-500">✕</button>
              </div>
              <form onSubmit={handleProductSubmit} className="grid md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                   <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Ex: Super Star 12W LED" defaultValue={editingProduct?.name} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                   <select name="category" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingProduct?.category}>
                      {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price (৳)</label>
                   <input name="price" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingProduct?.price} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price (৳)</label>
                   <input name="purchasePrice" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingProduct?.purchasePrice} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                   <input name="stock" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" defaultValue={editingProduct?.stock} />
                 </div>
                 <div className="md:col-span-2 space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                   <input name="image" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="https://..." defaultValue={editingProduct?.image} />
                 </div>
                 <button className="md:col-span-2 w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-4">Save Product</button>
              </form>
           </div>
        </div>
      )}

      {/* Due Collection Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black uppercase tracking-tight">Record Payment</h2>
                 <button onClick={() => setSelectedCustomer(null)} className="p-2 text-red-500">✕</button>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                    <p className="text-lg font-black text-slate-800">{selectedCustomer.name}</p>
                    <p className="text-xs font-bold text-slate-500">{selectedCustomer.id}</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">Outstanding</p>
                    <p className="text-2xl font-black text-red-600">৳{selectedCustomer.totalDue}</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receive Amount</label>
                    <input 
                      type="number" 
                      max={selectedCustomer.totalDue}
                      value={collectionAmount}
                      onChange={e => setCollectionAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-xl outline-none" 
                    />
                 </div>
                 <button 
                   onClick={handleDueCollection}
                   className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition"
                 >
                   Confirm Payment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
