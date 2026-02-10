
// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, Zap, 
  ScanLine, ShoppingCart, Calculator, CreditCard, 
  Smartphone, Banknote, User, Phone, Tag, Box, AlertTriangle, Filter, ChevronLeft, ChevronRight, X as CloseIcon, PlusCircle, Edit3, Keyboard
} from 'lucide-react';
import Invoice from '../components/Invoice';

const POS: React.FC = () => {
  const { products, recordSale } = useProducts();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS Machine' | 'Mobile Banking'>('Cash');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [activeMobileView, setActiveMobileView] = useState<'catalog' | 'cart'>('catalog');

  // Manual Item States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    price: '',
    quantity: 1,
    note: ''
  });

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const paidAmountRef = useRef<HTMLInputElement>(null);

  // Derived Calculations
  const subtotal = currentSale.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = Math.max(0, subtotal - discount);
  const dueAmount = Math.max(0, total - paidAmount);

  const finalizeSale = async () => {
    if (currentSale.length === 0) return;
    const newSale: Sale = {
      id: 'POS-' + Date.now().toString().slice(-8),
      customerName: customerName || t('Walk-in Customer', 'সাধারণ কাস্টমার'), 
      customerPhone, 
      customerAddress: t('Counter Sale', 'কাউন্টার বিক্রয়'),
      customerCity: t('Store Front', 'শপ ফ্রন্ট'),
      items: currentSale, 
      subtotal, 
      discount, 
      total, 
      paidAmount: paidAmount, 
      dueAmount: dueAmount, 
      paymentMethod, 
      status: 'Delivered',
      date: new Date().toISOString()
    };
    await recordSale(newSale);
    setCompletedSale(newSale);
  };

  const addToSale = (product: Product) => {
    if (product.stock <= 0) {
      alert(`${product.name}: ${t('Out of stock!', 'স্টকে নেই!')}`);
      return;
    }
    setCurrentSale(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(t('Cannot exceed available stock', 'স্টকের বেশি বিক্রয় সম্ভব নয়'));
          return prev;
        }
        return prev.map(item => item.productId === product.id ? 
          { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice } : 
          item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.nameBn || product.name || 'Unnamed Product',
        quantity: 1,
        unitPrice: product.discountPrice || product.price || 0,
        totalPrice: product.discountPrice || product.price || 0,
        warranty: product.warranty
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCurrentSale(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (!item.manualItem && product && newQty > (product.stock || 0)) return item;
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const editManualItemInline = (id: string, field: 'name' | 'unitPrice', value: string | number) => {
    setCurrentSale(prev => prev.map(item => {
      if (item.productId === id) {
        const updated = { ...item, [field]: value };
        updated.totalPrice = updated.quantity * (field === 'unitPrice' ? Number(value) : updated.unitPrice);
        return updated;
      }
      return item;
    }));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchTerm.trim();
    if (!code) return;
    const product = products.find(p => (p.barcode || '') === code || (p.sku || '') === code || (p.id || '') === code);
    if (product) {
      addToSale(product);
      setSearchTerm('');
    }
  };

  const addManualItemToSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;

    const price = Number(manualForm.price) || 0;
    const manualItem: SaleItem = {
      productId: 'MANUAL-' + Date.now(),
      name: manualForm.name,
      quantity: manualForm.quantity,
      unitPrice: price,
      totalPrice: price * manualForm.quantity,
      manualItem: true,
      note: manualForm.note
    };

    setCurrentSale(prev => [...prev, manualItem]);
    setIsManualModalOpen(false);
    setManualForm({ name: '', price: '', quantity: 1, note: '' });
  };

  const resetPOS = () => {
    setCurrentSale([]); 
    setCustomerName(''); 
    setCustomerPhone(''); 
    setDiscount(0); 
    setPaidAmount(0);
    setCompletedSale(null);
    setActiveMobileView('catalog');
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsManualModalOpen(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        paidAmountRef.current?.focus();
        paidAmountRef.current?.select();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (currentSale.length > 0) finalizeSale();
      }
      if (e.key === 'Escape') {
        setIsManualModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSale, paidAmount, subtotal, discount]);

  // Auto-focus barcode input
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !isManualModalOpen) {
        barcodeInputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isManualModalOpen]);

  const filteredCatalog = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return products.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pNameBn = (p.nameBn || '');
      const pBarcode = (p.barcode || '');
      const pSku = (p.sku || '').toLowerCase();
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = !lowerSearch || pName.includes(lowerSearch) || pNameBn.includes(searchTerm) || pBarcode.includes(searchTerm) || pSku.includes(lowerSearch);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    setPaidAmount(total);
  }, [total]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row overflow-hidden relative font-sans">
      {completedSale && <Invoice sale={completedSale} onClose={resetPOS} />}

      {/* Manual Item Modal (F2) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 animate-in zoom-in duration-300 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                       <PlusCircle size={24}/>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{t('Add Manual Item', 'ম্যানুয়াল আইটেম')}</h2>
                 </div>
                 <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-red-500 p-2 transition">
                   <CloseIcon size={24}/>
                 </button>
              </div>
              <form onSubmit={addManualItemToSale} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Item Description', 'পণ্যের বিবরণ')}</label>
                    <input autoFocus required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-bold outline-none transition" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} placeholder="e.g. Repairing Service / Loose Wire" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Unit Price (৳)', 'মূল্য')}</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-black text-lg outline-none transition" value={manualForm.price} onChange={e => setManualForm({...manualForm, price: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Qty', 'পরিমাণ')}</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-black text-lg outline-none transition" value={manualForm.quantity} onChange={e => setManualForm({...manualForm, quantity: Number(e.target.value)})} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Special Note', 'নোট')}</label>
                    <input className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl font-bold outline-none transition" value={manualForm.note} onChange={e => setManualForm({...manualForm, note: e.target.value})} placeholder="Warranty or info..." />
                 </div>
                 <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 active:scale-95 transition">
                    Add to Cart
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Catalog / Left Panel */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white shadow-inner ${activeMobileView === 'cart' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 bg-white border-b sticky top-0 z-10 space-y-4">
          <div className="flex items-center gap-4">
            <form onSubmit={handleBarcodeSubmit} className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  ref={barcodeInputRef}
                  type="text" 
                  placeholder={t('SCAN OR SEARCH (F1)...', 'বারকোড স্ক্যান অথবা সার্চ...')}
                  className="w-full pl-12 pr-4 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-base md:text-lg placeholder:text-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-4 md:py-5 rounded-2xl border-2 border-blue-100 hover:bg-blue-100 transition whitespace-nowrap group shadow-sm"
            >
               <PlusCircle size={20} className="group-hover:rotate-90 transition duration-300" />
               <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t('Manual Item (F2)', 'ম্যানুয়াল আইটেম')}</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', ...Object.values(Category)].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {t(cat, cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {filteredCatalog.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredCatalog.map(product => (
                <button 
                  key={product.id} 
                  onClick={() => addToSale(product)}
                  className={`group bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-2xl transition-all relative text-left flex flex-col h-full ${product.stock <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-blue-500/30 shadow-sm active:scale-95'}`}
                >
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3">
                     <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={product.name} />
                  </div>
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-widest truncate">{product.category}</p>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] leading-tight mb-auto">
                    {t(product.name, product.nameBn)}
                  </h4>
                  <div className="mt-3 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-base">৳{product.discountPrice || product.price}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${product.stock < (product.minStockLevel || 0) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
               <Box size={80} strokeWidth={1} />
               <p className="text-xl font-black uppercase tracking-widest mt-4">{t('No results found', 'পণ্য পাওয়া যায়নি')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Sidebar / Cart */}
      <div className={`w-full md:w-[450px] bg-slate-900 flex flex-col text-white h-screen md:h-auto ${activeMobileView === 'catalog' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <ShoppingCart size={24} className="text-emerald-400" /> 
              {t('Terminal 01', 'টার্মিনাল ০১')}
            </h2>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-400">SHIFT: DAY</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Customer</p>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white/10" placeholder="Walk-in Customer" />
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Phone</p>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white/10 font-mono" placeholder="01XXXXXXXXX" />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-dark px-4 py-2">
          {currentSale.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
               <ShoppingCart size={80} />
               <p className="font-black uppercase tracking-[0.4em] text-sm">Scan Items</p>
            </div>
          ) : (
            currentSale.map(item => (
              <div key={item.productId} className="flex flex-col gap-3 py-5 border-b border-white/5 group animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.manualItem ? (
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 group-focus-within:bg-white/10 transition border border-white/5 focus-within:border-emerald-500">
                           <Edit3 size={12} className="text-emerald-400" />
                           <input 
                             value={item.name} 
                             onChange={(e) => editManualItemInline(item.productId, 'name', e.target.value)}
                             className="font-black text-xs bg-transparent outline-none w-full"
                           />
                        </div>
                      ) : (
                        <p className="font-black text-xs truncate uppercase tracking-tight">{item.name}</p>
                      )}
                      {item.manualItem && <span className="text-[7px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Manual</span>}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      {item.manualItem ? (
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1 border border-white/5 focus-within:border-emerald-500">
                          <span className="text-[10px] text-slate-500 font-black">৳</span>
                          <input 
                            type="number"
                            value={item.unitPrice} 
                            onChange={(e) => editManualItemInline(item.productId, 'unitPrice', e.target.value)}
                            className="text-[10px] font-black text-slate-300 bg-transparent w-16 outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-[10px] font-black text-slate-500">৳ {item.unitPrice}</p>
                      )}
                      <p className="text-[10px] font-bold text-slate-600">x {item.quantity}</p>
                      <p className="text-[10px] font-black text-emerald-400 ml-auto">৳ {item.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                     <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition"><Minus size={14}/></button>
                     <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="p-2 text-slate-700 hover:text-red-500 transition"><Trash2 size={18}/></button>
                </div>
                {item.note && <p className="text-[9px] text-slate-500 italic px-1 ml-4 border-l border-white/10">{item.note}</p>}
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-950 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5">
           <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <span>Items Subtotal</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-2">
                    <Tag size={14} className="text-red-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apply Discount</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-400">৳</span>
                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="bg-transparent text-right font-black text-xl w-24 outline-none border-b border-white/10 focus:border-red-400 transition" />
                 </div>
              </div>
              <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
                 <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Paid Amount (F4)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-400">৳</span>
                    <input ref={paidAmountRef} type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} className="bg-transparent text-right font-black text-xl w-24 outline-none border-b border-white/10 focus:border-blue-400 transition" />
                 </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black uppercase text-slate-400 tracking-widest">Total Bill</span>
                <span className="text-2xl font-black">৳ {total}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className={`text-sm font-black uppercase tracking-widest ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {dueAmount > 0 ? 'Due Balance' : 'Change Return'}
                </span>
                <span className={`text-2xl font-black ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ৳ {dueAmount}
                </span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Cash', icon: Banknote },
                { id: 'POS Machine', icon: CreditCard },
                { id: 'Mobile Banking', icon: Smartphone }
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition border-2 ${paymentMethod === m.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>
                  <m.icon size={18}/>
                  <span className="text-[7px] font-black uppercase tracking-widest">{m.id}</span>
                </button>
              ))}
           </div>

           <button 
             disabled={currentSale.length === 0}
             onClick={finalizeSale}
             className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm hover:bg-emerald-400 transition transform active:scale-95 disabled:opacity-20 shadow-2xl disabled:grayscale"
           >
             COMPLETE & PRINT (F9)
           </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default POS;
