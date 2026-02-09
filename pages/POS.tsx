// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, Zap, 
  ScanLine, ShoppingCart, Calculator, CreditCard, 
  Smartphone, Banknote, User, Phone, Tag, Box, AlertTriangle, Filter, ChevronLeft, ChevronRight, X as CloseIcon
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

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input every 2 seconds if not already focused
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        barcodeInputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Robust filtering logic to prevent crashes if data is missing
  const filteredCatalog = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return products.filter(p => {
      // Safe checks for all string properties
      const pName = (p.name || '').toLowerCase();
      const pNameBn = (p.nameBn || '');
      const pBarcode = (p.barcode || '');
      const pSku = (p.sku || '').toLowerCase();
      const pId = (p.id || '').toLowerCase();
      const pCategory = p.category || '';

      const matchesCategory = selectedCategory === 'All' || pCategory === selectedCategory;
      const matchesSearch = 
        !lowerSearch ||
        pName.includes(lowerSearch) || 
        pNameBn.includes(searchTerm) ||
        pBarcode.includes(searchTerm) ||
        pSku.includes(lowerSearch) ||
        pId.includes(lowerSearch);
      
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

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
    // On mobile, if we add an item, maybe stay in catalog but show a toast
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

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCurrentSale(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > (product.stock || 0)) return item;
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const subtotal = currentSale.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = Math.max(0, subtotal - discount);

  // Sync paidAmount with total when total changes
  useEffect(() => {
    setPaidAmount(total);
  }, [total]);

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

  const resetPOS = () => {
    setCurrentSale([]); 
    setCustomerName(''); 
    setCustomerPhone(''); 
    setDiscount(0); 
    setPaidAmount(0);
    setCompletedSale(null);
    setActiveMobileView('catalog');
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row overflow-hidden relative">
      {completedSale && <Invoice sale={completedSale} onClose={resetPOS} />}

      {/* Main Catalog Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white shadow-inner ${activeMobileView === 'cart' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 bg-white border-b sticky top-0 z-10 space-y-4">
          <div className="flex items-center gap-4">
            <form onSubmit={handleBarcodeSubmit} className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  ref={barcodeInputRef}
                  type="text" 
                  placeholder={t('SCAN BARCODE OR SEARCH...', 'বারকোড স্ক্যান অথবা সার্চ...')}
                  className="w-full pl-12 pr-4 py-4 md:py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-base md:text-lg placeholder:text-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
               <ScanLine size={18} className="text-blue-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-blue-900 tracking-widest">Scanner Ready</span>
            </div>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition ${selectedCategory === 'All' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {t('All Items', 'সব পণ্য')}
            </button>
            {Object.values(Category).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {t(cat, cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredCatalog.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredCatalog.map(product => (
                <button 
                  key={product.id} 
                  onClick={() => addToSale(product)}
                  className={`group bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-3 md:p-4 hover:shadow-2xl transition-all relative text-left flex flex-col h-full ${product.stock <= 0 ? 'opacity-30 grayscale' : 'hover:border-blue-500/30 shadow-sm'}`}
                >
                  <div className="aspect-square bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3">
                     <img 
                       src={product.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200'} 
                       className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                       alt={product.name}
                     />
                  </div>
                  <p className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase mb-1 tracking-tighter truncate">{product.category}</p>
                  <h4 className="text-[10px] md:text-xs font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] leading-tight mb-auto">
                    {t(product.name || 'Unnamed', product.nameBn || 'নামহীন')}
                  </h4>
                  <div className="mt-2 md:mt-3 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-sm md:text-base">৳{product.discountPrice || product.price || 0}</span>
                    <span className={`text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded ${product.stock < (product.minStockLevel || 0) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      Qty: {product.stock || 0}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
               <div className="p-6 md:p-8 bg-slate-50 rounded-full">
                 <Box size={48} md:size={64} strokeWidth={1} />
               </div>
               <div className="text-center">
                 <p className="text-base md:text-lg font-black uppercase tracking-widest text-slate-400">{t('No Products Found', 'কোনো পণ্য পাওয়া যায়নি')}</p>
                 <p className="text-xs md:text-sm font-bold text-slate-300 mt-1">{t('Try changing keywords or category', 'শব্দ বা ক্যাটাগরি পরিবর্তন করে দেখুন')}</p>
                 <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} 
                    className="mt-6 text-blue-500 font-black uppercase text-[10px] md:text-xs tracking-widest hover:underline"
                  >
                    {t('Clear Filters', 'ফিল্টার মুছুন')}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setActiveMobileView(activeMobileView === 'catalog' ? 'cart' : 'catalog')}
          className="w-14 h-14 bg-blue-900 text-white rounded-full shadow-2xl flex items-center justify-center relative border-4 border-white"
        >
          {activeMobileView === 'catalog' ? (
            <>
              <ShoppingCart size={24} />
              {currentSale.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{currentSale.length}</span>}
            </>
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>
      </div>

      {/* POS Terminal Sidebar */}
      <div className={`w-full md:w-[400px] lg:w-[450px] bg-slate-900 flex flex-col text-white h-screen md:h-auto ${activeMobileView === 'catalog' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 md:p-8 border-b border-white/5 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <ShoppingCart size={20} className="text-emerald-400" /> 
              {t('Terminal 01', 'টার্মিনাল ০১')}
            </h2>
            <button onClick={() => setActiveMobileView('catalog')} className="md:hidden p-2 text-slate-400 hover:text-white"><CloseIcon size={20}/></button>
          </div>
          <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4">
             <div className="space-y-1">
                <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest">Customer</p>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white/10" placeholder="Walk-in" />
             </div>
             <div className="space-y-1">
                <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest">Phone</p>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white/10 font-mono" placeholder="01XXX" />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
          {currentSale.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
               <ShoppingCart size={48} />
               <p className="font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">Empty Cart</p>
            </div>
          ) : (
            currentSale.map(item => (
              <div key={item.productId} className="flex items-center gap-3 md:gap-4 py-3 md:py-4 border-b border-white/5 group">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[10px] md:text-xs truncate">{item.name}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">৳{item.unitPrice} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                   <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 md:w-8 md:h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-500 transition"><Minus size={12}/></button>
                   <span className="w-5 md:w-6 text-center font-black text-[10px] md:text-xs">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.productId, 1)} className="w-7 h-7 md:w-8 md:h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-emerald-500 transition"><Plus size={12}/></button>
                </div>
                <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 md:p-8 bg-slate-950 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pb-24 md:pb-8">
           <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-black text-red-400">৳</span>
                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="bg-transparent text-right font-black text-base md:text-lg w-20 md:w-24 outline-none border-b border-dashed border-red-400/30" />
                 </div>
              </div>
              <div className="flex justify-between items-center bg-blue-500/10 p-3 md:p-4 rounded-xl md:rounded-2xl border border-blue-500/20">
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-400">Paid Amount</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-black text-blue-400">৳</span>
                    <input type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} className="bg-transparent text-right font-black text-base md:text-lg w-20 md:w-24 outline-none border-b border-dashed border-blue-400/30" />
                 </div>
              </div>
              <div className="flex justify-between items-center pt-1 md:pt-2">
                <span className="text-base md:text-xl font-black uppercase text-emerald-400 tracking-tighter">Due Balance</span>
                <span className={`text-2xl md:text-3xl font-black ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>৳ {dueAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-1 md:pt-2 border-t border-white/5">
                <span className="text-xs md:text-sm font-black uppercase text-slate-400">Grand Total</span>
                <span className="text-lg md:text-xl font-black">৳ {total}</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote },
                { id: 'POS Machine', icon: CreditCard },
                { id: 'Mobile Banking', icon: Smartphone }
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl flex flex-col items-center gap-1 md:gap-2 transition ${paymentMethod === m.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                  <m.icon size={16} md:size={18}/>
                  <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest">{m.id}</span>
                </button>
              ))}
           </div>

           <button 
             disabled={currentSale.length === 0}
             onClick={finalizeSale}
             className="w-full bg-white text-slate-900 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] md:text-sm hover:bg-emerald-400 transition transform active:scale-95 disabled:opacity-20 shadow-2xl"
           >
             COMPLETE & PRINT
           </button>
        </div>
      </div>
    </div>
  );
};

export default POS;