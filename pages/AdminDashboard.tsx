// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Category, Product, Sale, OrderStatus, Customer, ServiceRequest } from '../types';
import { 
  Plus, Edit2, Trash2, Box, X, Search, DollarSign, BarChart3, Users,
  Wallet, CheckCircle, Settings, LayoutDashboard, ShoppingCart, Printer, AlertTriangle, TrendingUp, Award, ChevronRight, Hash, Activity,
  UserPlus, UserMinus, CreditCard, Banknote, Wrench, Clock, MapPin, Calendar
} from 'lucide-react';
import BarcodeLabel from '../components/BarcodeLabel';

type AdminTab = 'overview' | 'inventory' | 'stock-logs' | 'sales' | 'customers' | 'service-requests' | 'reports' | 'settings';

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { 
    products, sales, stockLogs, customers, serviceRequests, staff, 
    addProduct, updateProduct, deleteProduct, updateServiceRequest, updateCustomerDue 
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
                {/* Additional widgets could go here */}
             </div>
           )}

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

           {activeTab === 'inventory' && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
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
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                           <td className="px-8 py-4 font-black text-sm">{p.name}</td>
                           <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.category}</td>
                           <td className="px-6 py-4 font-black">৳{p.price}</td>
                           <td className={`px-6 py-4 font-black ${p.stock <= p.minStockLevel ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock}</td>
                           <td className="px-8 py-4 text-right space-x-2">
                              <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit2 size={16}/></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400"><Trash2 size={16}/></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10">
              <h2 className="text-2xl font-black uppercase mb-8">{editingProduct ? 'Update' : 'New'} Product</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(editingProduct || {}); }} className="space-y-4">
                 <input className="w-full p-4 bg-slate-50 rounded-xl font-bold" placeholder="Product Name" defaultValue={editingProduct?.name} />
                 <input className="w-full p-4 bg-slate-50 rounded-xl font-bold" placeholder="Price" type="number" defaultValue={editingProduct?.price} />
                 <button className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase">Save Product</button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold">Cancel</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
