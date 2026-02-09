// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, Customer, ServiceRequest, StockLog } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Search, DollarSign, BarChart3, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity,
  UserPlus, UserMinus, CreditCard, Banknote, Wrench, Clock, MapPin, Calendar, FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import BarcodeLabel from '../components/BarcodeLabel';

type AdminTab = 'overview' | 'inventory' | 'stock-logs' | 'sales' | 'customers' | 'service-requests' | 'reports' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, stockLogs, customers, serviceRequests, staff, 
    addProduct, updateProduct, deleteProduct, updateServiceRequest, updateCustomerDue, updateSettings, settings 
  } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printingBarcode, setPrintingBarcode] = useState<Product | null>(null);
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

  const handleProductSubmit = async (p: Product) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, p);
    } else {
      await addProduct(p);
    }
    setIsModalOpen(false);
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
              <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                 New Product
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           {/* Tab 1: OVERVIEW */}
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
                      {lowStockItems.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                          <span className="text-xs font-black text-slate-700">{p.name}</span>
                          <span className="text-xs font-black text-red-600">Stock: {p.stock}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2">Quick Reports</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</p>
                        <p className="text-xl font-black">{sales.length}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customers</p>
                        <p className="text-xl font-black">{customers.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           )}

           {/* Tab 2: INVENTORY */}
           {activeTab === 'inventory' && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex items-center gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search SKU or Name..." 
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
                         <th className="px-6 py-5 text-left">Category</th>
                         <th className="px-6 py-5 text-left">Price</th>
                         <th className="px-6 py-5 text-left">Stock</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-sm">{p.name}</td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.category}</td>
                           <td className="px-6 py-4 font-black">৳{p.price}</td>
                           <td className={`px-6 py-4 font-black ${p.stock <= p.minStockLevel ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock}</td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           )}

           {/* Tab 3: SERVICE REQUESTS */}
           {activeTab === 'service-requests' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Service Management</h3>
                </div>
                <table className="w-full">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                         <th className="px-8 py-5 text-left">Customer</th>
                         <th className="px-6 py-5 text-left">Problem</th>
                         <th className="px-6 py-5 text-left">Assignment</th>
                         <th className="px-6 py-5 text-left">Price</th>
                         <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {serviceRequests && serviceRequests.length > 0 ? (
                        serviceRequests.map(sr => (
                          <tr key={sr.id} className="hover:bg-slate-50 transition">
                             <td className="px-8 py-4">
                                <p className="text-sm font-black text-slate-800">{sr.customerName}</p>
                                <p className="text-[10px] font-mono text-blue-600">{sr.customerPhone}</p>
                             </td>
                             <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">{sr.serviceType}</span>
                                <p className="text-[10px] text-slate-400 mt-1 italic truncate max-w-[200px]">{sr.problemDescription}</p>
                             </td>
                             <td className="px-6 py-4">
                                {sr.assignedStaffName ? (
                                  <p className="text-xs font-black text-slate-700">{sr.assignedStaffName}</p>
                                ) : (
                                  <span className="text-[9px] font-black text-amber-500 uppercase">Unassigned</span>
                                )}
                             </td>
                             <td className="px-6 py-4 font-black text-sm">৳{sr.manualPrice || 0}</td>
                             <td className="px-8 py-4 text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedRequest(sr);
                                    setAssigningStaffId(sr.assignedStaffId || '');
                                    setManualPrice(sr.manualPrice || 0);
                                  }}
                                  className="px-4 py-2 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase"
                                >
                                  Manage
                                </button>
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase">No requests found</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}

           {/* Tab 4: MOVEMENT LOGS */}
           {activeTab === 'stock-logs' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Inventory Movement History</h3>
                </div>
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
                           <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">{log.reason}</span></td>
                           <td className={`px-6 py-4 text-right font-black ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                             {log.change > 0 ? `+${log.change}` : log.change}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Tab 5: SALES RECORDS */}
           {activeTab === 'sales' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Invoice History</h3>
                </div>
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

           {/* Tab 6: DUE LEDGER */}
           {activeTab === 'customers' && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Customer Accounts & Receivables</h3>
                </div>
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

           {/* Tab 7: PROFIT & LOSS */}
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
               
               <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                 <h3 className="font-black uppercase tracking-tight mb-6">Financial Summary</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="font-black text-slate-600">Total Uncollected Dues</span>
                     <span className="font-black text-red-600">৳{stats.totalReceivables}</span>
                   </div>
                   <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="font-black text-slate-600">Sales Count (All Time)</span>
                     <span className="font-black text-slate-900">{sales.length}</span>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Service Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-8">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black uppercase">Manage Service</h2>
                 <button onClick={() => setSelectedRequest(null)} className="p-2 text-red-500">✕</button>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-blue-50 rounded-2xl">
                    <p className="text-[8px] font-black text-blue-400 uppercase">Issue</p>
                    <p className="text-sm font-bold italic">"{selectedRequest.problemDescription}"</p>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase">Assign Technician</label>
                       <select 
                         value={assigningStaffId}
                         onChange={e => setAssigningStaffId(e.target.value)}
                         className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold"
                       >
                         <option value="">Select Technician...</option>
                         {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.area})</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase">Service Price (৳)</label>
                       <input 
                         type="number" 
                         value={manualPrice}
                         onChange={e => setManualPrice(Number(e.target.value))}
                         className="w-full bg-slate-50 rounded-xl px-4 py-3 font-black text-lg" 
                       />
                    </div>
                 </div>
                 <button 
                   onClick={handleServiceUpdate}
                   className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase"
                 >
                   Save Updates
                 </button>
              </div>
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black uppercase">{editingProduct ? 'Update' : 'New'} Product</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-red-500">✕</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(editingProduct || {}); }} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                   <input required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Name" defaultValue={editingProduct?.name} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price</label>
                     <input required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Price" type="number" defaultValue={editingProduct?.price} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                     <input required className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" placeholder="Stock" type="number" defaultValue={editingProduct?.stock} />
                   </div>
                 </div>
                 <button className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-4">Save Product</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
