// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, Customer, ServiceRequest, StockLog, Staff, StaffSkill } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Search, DollarSign, BarChart3, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity,
  UserPlus, UserMinus, CreditCard, Banknote, Wrench, Clock, MapPin, Calendar, FileText, ArrowUpRight, ArrowDownRight, Briefcase, UserCheck, ShieldOff, Coins, UserCog
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
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number>(0);

  // Service Management State
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assigningStaffId, setAssigningStaffId] = useState('');
  const [manualPrice, setManualPrice] = useState(0);

  // LEGACY SUPPORT: If a staff has no role, they are a Technician (your missing 2 techs)
  const technicians = useMemo(() => {
    return (staff || []).filter(s => !s.role || s.role === 'Technician');
  }, [staff]);

  const shopStaffMembers = useMemo(() => {
    return (staff || []).filter(s => s.role === 'Cashier' || s.role === 'Manager');
  }, [staff]);

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.minStockLevel), [products]);

  const stats = useMemo(() => ({
    totalValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    potentialProfit: products.reduce((acc, p) => acc + (p.stock * (p.price - p.purchasePrice)), 0),
    totalReceivables: (customers || []).reduce((acc, c) => acc + c.totalDue, 0),
    salesToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length,
    revenueToday: (sales || []).filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0),
    pendingServices: (serviceRequests || []).filter(sr => sr.status === 'Pending').length,
    totalRevenue: (sales || []).reduce((acc, s) => acc + s.total, 0)
  }), [products, sales, customers, serviceRequests]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const s: any = {
      id: editingStaff?.id || 'ST-' + Date.now(),
      name: formData.get('name'),
      phone: formData.get('phone'),
      whatsapp: formData.get('whatsapp') || formData.get('phone'),
      area: formData.get('area') || 'Field',
      experience: Number(formData.get('experience') || 0),
      photo: formData.get('photo') || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      status: formData.get('status') || 'Available',
      role: formData.get('role') as any,
      baseSalary: Number(formData.get('baseSalary') || 0),
      salaryType: formData.get('salaryType') as any,
      commissionPerService: Number(formData.get('commission') || 0),
      overtimeRate: Number(formData.get('overtime') || 0),
      isActive: formData.get('isActive') === 'on',
      skills: formData.get('skills')?.toString().split(',').map(s => s.trim()) || [],
      isEmergencyStaff: formData.get('isEmergency') === 'on',
      rating: editingStaff?.rating || 5.0,
      totalJobs: editingStaff?.totalJobs || 0,
      joinedAt: formData.get('joinedAt') || editingStaff?.joinedAt || new Date().toISOString()
    };

    if (editingStaff?.id) {
      await updateStaff(editingStaff.id, s);
    } else {
      await addStaff(s);
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const openAddStaffModal = (rolePreference: 'Technician' | 'Cashier' | 'Manager') => {
    setEditingStaff({ role: rolePreference, isActive: true, salaryType: 'Monthly', baseSalary: 0, skills: [], experience: 0 } as any);
    setIsStaffModalOpen(true);
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
              {activeTab === 'technicians' && (
                <button onClick={() => openAddStaffModal('Technician')} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg">
                  <Plus size={16}/> Add Technician
                </button>
              )}
              {activeTab === 'shop-staff' && (
                <button onClick={() => openAddStaffModal('Cashier')} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg">
                  <Plus size={16}/> Add Shop Staff
                </button>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           {/* Tab Logic - RESTORED FULL TAB CONTENT */}
           {activeTab === 'overview' && (
             <div className="space-y-8">
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                   {[
                     { label: 'Stock Value', val: `৳${stats.totalValue}`, icon: Wallet, color: 'blue' },
                     { label: 'Profit Proj.', val: `৳${stats.potentialProfit}`, icon: TrendingUp, color: 'emerald' },
                     { label: 'Total Due', val: `৳${stats.totalReceivables}`, icon: UserMinus, color: 'red' },
                     { label: 'Revenue Today', val: `৳${stats.revenueToday}`, icon: DollarSign, color: 'purple' },
                     { label: 'Jobs Pending', val: stats.pendingServices, icon: Wrench, color: 'amber' },
                   ].map(s => (
                     <div key={s.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`w-10 h-10 bg-${s.color}-50 text-${s.color}-600 rounded-xl flex items-center justify-center shrink-0`}><s.icon size={20}/></div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                          <p className="text-sm font-black text-slate-900">{s.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2 text-slate-800">Team Activity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Technicians</p>
                        <p className="text-2xl font-black text-emerald-900">{technicians.length}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Shop Personnel</p>
                        <p className="text-2xl font-black text-blue-900">{shopStaffMembers.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           )}

           {activeTab === 'inventory' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Product Inventory</h3>
                   <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                     <Plus size={16}/> New Product
                   </button>
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
                           <td className="px-8 py-4"><p className="text-sm font-black text-slate-800">{p.name}</p></td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.category}</td>
                           <td className={`px-6 py-4 font-black ${p.stock <= p.minStockLevel ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock}</td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'technicians' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Member</th>
                         <th className="px-6 py-5 text-left">Expertise</th>
                         <th className="px-6 py-5 text-left">Status</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {technicians.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                           <td className="px-8 py-4 flex items-center gap-3">
                              <img src={s.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} className="w-10 h-10 rounded-xl object-cover border" />
                              <div>
                                 <p className="text-sm font-black text-slate-800">{s.name}</p>
                                 <p className="text-[9px] text-slate-400">{s.phone}</p>
                              </div>
                           </td>
                           <td className="px-6 py-4 flex flex-wrap gap-1">
                              {s.skills?.map(sk => <span key={sk} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">{sk}</span>) || <span className="text-[8px] text-slate-400">N/A</span>}
                           </td>
                           <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{s.status || 'Available'}</span></td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                              <button onClick={() => deleteStaff(s.id)} className="p-2 text-red-400"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                      {technicians.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-300 uppercase font-black">No Technicians Found</td></tr>}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'shop-staff' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Staff Member</th>
                         <th className="px-6 py-5 text-left">Role</th>
                         <th className="px-6 py-5 text-left">Status</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {shopStaffMembers.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4">
                              <p className="text-sm font-black text-slate-800">{s.name}</p>
                              <p className="text-[9px] text-slate-400">{s.phone}</p>
                           </td>
                           <td className="px-6 py-4"><span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase">{s.role}</span></td>
                           <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                           <td className="px-8 py-4 text-right">
                              <button onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                      {shopStaffMembers.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-300 uppercase font-black">No Shop Staff Found</td></tr>}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'stock-logs' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Timestamp</th>
                         <th className="px-6 py-5 text-left">Product</th>
                         <th className="px-6 py-5 text-left">Reason</th>
                         <th className="px-8 py-5 text-right">Change</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stockLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 text-[10px] font-bold text-slate-500">{new Date(log.date).toLocaleString()}</td>
                           <td className="px-6 py-4 font-black text-sm text-slate-800">{log.productName}</td>
                           <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{log.reason}</td>
                           <td className={`px-8 py-4 text-right font-black ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                             {log.change > 0 ? `+${log.change}` : log.change}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'sales' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Invoice</th>
                         <th className="px-6 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Total</th>
                         <th className="px-8 py-5 text-right">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {sales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-mono font-black text-xs text-blue-600">#{s.id}</td>
                           <td className="px-6 py-4"><p className="text-xs font-black text-slate-800">{s.customerName}</p></td>
                           <td className="px-6 py-4 font-black text-sm">৳{s.total}</td>
                           <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'customers' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Total Due</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-sm text-slate-800">{c.name}</td>
                           <td className={`px-6 py-4 font-black ${c.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>৳{c.totalDue}</td>
                           <td className="px-8 py-4 text-right">
                              <button onClick={() => setSelectedCustomer(c)} className="px-4 py-2 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase">Record Payment</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'reports' && (
             <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gross Sales</p>
                     <p className="text-3xl font-black text-blue-900">৳{stats.totalRevenue}</p>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Dues</p>
                     <p className="text-3xl font-black text-red-500">৳{stats.totalReceivables}</p>
                   </div>
                   <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Value</p>
                     <p className="text-3xl font-black text-slate-800">৳{stats.totalValue}</p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'staff-salary' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Staff Name</th>
                         <th className="px-6 py-5 text-left">Pay Model</th>
                         <th className="px-6 py-5 text-left">Base Pay</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                           <td className="px-8 py-4 font-black text-sm text-slate-800">{s.name}</td>
                           <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{s.salaryType || 'Monthly'}</td>
                           <td className="px-6 py-4 font-black text-emerald-600">৳{s.baseSalary || 0}</td>
                           <td className="px-8 py-4 text-right">
                              <button onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'service-requests' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Service</th>
                         <th className="px-6 py-5 text-left">Status</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {serviceRequests.map(sr => (
                        <tr key={sr.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4"><p className="text-sm font-black text-slate-800">{sr.customerName}</p></td>
                           <td className="px-6 py-4 text-xs font-bold text-blue-600 uppercase">{sr.serviceType}</td>
                           <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${sr.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{sr.status}</span></td>
                           <td className="px-8 py-4 text-right">
                              <button onClick={() => { setSelectedRequest(sr); setAssigningStaffId(sr.assignedStaffId || ''); setManualPrice(sr.manualPrice || 0); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Assign</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

        </div>
      </main>

      {/* MODALS */}

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight">{editingStaff?.id ? 'Edit Profile' : 'New Staff'}</h2>
                 <button onClick={() => setIsStaffModalOpen(false)} className="p-2 text-red-500">✕</button>
              </div>
              <form onSubmit={handleStaffSubmit} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                       <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.name} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                       <input name="phone" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.phone} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                       <select name="role" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.role}>
                          <option value="Technician">Technician</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Manager">Manager</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary (৳)</label>
                       <input name="baseSalary" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.baseSalary} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Type</label>
                       <select name="salaryType" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.salaryType || 'Monthly'}>
                          <option value="Monthly">Monthly</option>
                          <option value="Daily">Daily</option>
                          <option value="Commission">Commission Based</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission (৳)</label>
                       <input name="commission" type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingStaff?.commissionPerService} />
                    </div>
                 </div>
                 <div className="flex gap-4 items-center pt-4 border-t">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input type="checkbox" name="isActive" className="w-5 h-5" defaultChecked={editingStaff?.isActive ?? true} />
                       <span className="text-xs font-black uppercase text-slate-700">Active Duty</span>
                    </label>
                 </div>
                 <button className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Update Staff Record</button>
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const p = {
                  name: fd.get('name'),
                  category: fd.get('category'),
                  price: Number(fd.get('price')),
                  purchasePrice: Number(fd.get('purchasePrice')),
                  stock: Number(fd.get('stock')),
                  minStockLevel: Number(fd.get('minStockLevel') || 5),
                  sku: fd.get('sku') || 'SKU-'+Date.now(),
                  barcode: fd.get('barcode') || Date.now().toString(),
                  image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400',
                  description: '', descriptionBn: '', specs: {}
                };
                if(editingProduct) await updateProduct(editingProduct.id, p);
                else await addProduct(p);
                setIsProductModalOpen(false);
              }} className="grid md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                   <input name="name" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.name} />
                 </div>
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
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Price</label>
                   <input name="price" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.price} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Cost</label>
                   <input name="purchasePrice" type="number" required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none" defaultValue={editingProduct?.purchasePrice} />
                 </div>
                 <button className="md:col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Save Product</button>
              </form>
           </div>
        </div>
      )}

      {/* Due Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black uppercase tracking-tight">Record Payment</h2>
                 <button onClick={() => setSelectedCustomer(null)} className="p-2 text-red-500">✕</button>
              </div>
              <div className="space-y-4">
                 <p className="font-bold text-slate-600">Collecting from: <span className="text-slate-900 font-black">{selectedCustomer.name}</span></p>
                 <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-400 uppercase">Current Due</span>
                    <span className="text-xl font-black text-red-600">৳{selectedCustomer.totalDue}</span>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receive Amount</label>
                    <input 
                      type="number" 
                      value={collectionAmount}
                      onChange={e => setCollectionAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-xl outline-none" 
                    />
                 </div>
                 <button 
                   onClick={async () => {
                     await updateCustomerDue(selectedCustomer.id, selectedCustomer.name, collectionAmount);
                     setSelectedCustomer(null);
                     setCollectionAmount(0);
                     alert('Payment Recorded Successfully!');
                   }}
                   className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl"
                 >
                   Confirm Payment
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Service Assignment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black uppercase">Service Deployment</h2>
                 <button onClick={() => setSelectedRequest(null)} className="text-red-500">✕</button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Select Technician</label>
                    <select value={assigningStaffId} onChange={e => setAssigningStaffId(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl mt-1 font-bold">
                       <option value="">-- Choose Staff --</option>
                       {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Estimation (৳)</label>
                    <input type="number" value={manualPrice} onChange={e => setManualPrice(Number(e.target.value))} className="w-full p-4 bg-slate-50 rounded-xl mt-1 font-black text-lg" />
                 </div>
                 <button onClick={async () => {
                   const staffMember = staff.find(s => s.id === assigningStaffId);
                   await updateServiceRequest(selectedRequest.id, {
                     assignedStaffId: assigningStaffId,
                     assignedStaffName: staffMember?.name,
                     manualPrice: manualPrice,
                     status: assigningStaffId ? 'Assigned' : selectedRequest.status
                   });
                   setSelectedRequest(null);
                 }} className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Publish Assignment</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
