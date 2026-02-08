
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, Zap, 
  ScanLine, ShoppingCart, Calculator, CreditCard, 
  Smartphone, Banknote, User, Phone, Tag, Box, AlertTriangle
} from 'lucide-react';
import Invoice from '../components/Invoice';

const POS: React.FC = () => {
  const { products, recordSale } = useProducts();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS Machine' | 'Mobile Banking'>('Cash');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

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
        name: product.nameBn,
        quantity: 1,
        unitPrice: product.discountPrice || product.price,
        totalPrice: product.discountPrice || product.price,
        warranty: product.warranty
      }];
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchTerm.trim();
    if (!code) return;

    const product = products.find(p => p.barcode === code || p.sku === code || p.id === code);
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
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const subtotal = currentSale.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = Math.max(0, subtotal - discount);

  // Sync paidAmount with total when total changes, unless user manually edited it
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
  };

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      {completedSale && <Invoice sale={completedSale} onClose={resetPOS} />}

      {/* Main Catalog Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-inner">
        <div className="p-6 bg-white border-b sticky top-0 z-10 space-y-4">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                ref={barcodeInputRef}
                type="text" 
                placeholder={t('SCAN BARCODE OR SEARCH...', 'বারকোড স্ক্যান অথবা সার্চ...')}
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-lg placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
               <ScanLine size={18} className="text-blue-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-blue-900 tracking-widest">Scanner Ready</span>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm))).map(product => (
            <button 
              key={product.id} 
              onClick={() => addToSale(product)}
              className={`group bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-2xl transition-all relative text-left ${product.stock <= 0 ? 'opacity-30' : ''}`}
            >
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3">
                 <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <p className="text-[9px] font-black text-blue-600 uppercase mb-1">{product.category}</p>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 h-8 leading-tight">{t(product.name, product.nameBn)}</h4>
              <div className="mt-3 flex justify-between items-baseline">
                <span className="font-black text-slate-900">৳{product.price}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${product.stock < product.minStockLevel ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                  Qty: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* POS Terminal Sidebar */}
      <div className="w-[450px] bg-slate-900 flex flex-col text-white">
        <div className="p-8 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <ShoppingCart size={24} className="text-emerald-400" /> 
            {t('Terminal 01', 'টার্মিনাল ০১')}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Customer</p>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-white/10" placeholder="Walk-in" />
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Phone</p>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-white/10 font-mono" placeholder="01XXX" />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
          {currentSale.map(item => (
            <div key={item.productId} className="flex items-center gap-4 py-4 border-b border-white/5 group">
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs truncate">{item.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">৳{item.unitPrice} x {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-500 transition"><Minus size={14}/></button>
                 <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                 <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-emerald-500 transition"><Plus size={14}/></button>
              </div>
              <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>

        <div className="p-8 bg-slate-950 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
           <div className="space-y-3">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</span>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-400">৳</span>
                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="bg-transparent text-right font-black text-lg w-24 outline-none border-b border-dashed border-red-400/30" />
                 </div>
              </div>
              <div className="flex justify-between items-center bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Paid Amount</span>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-400">৳</span>
                    <input type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} className="bg-transparent text-right font-black text-lg w-24 outline-none border-b border-dashed border-blue-400/30" />
                 </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-black uppercase text-emerald-400 tracking-tighter">Due Balance</span>
                <span className={`text-3xl font-black ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>৳ {dueAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-sm font-black uppercase text-slate-400">Grand Total</span>
                <span className="text-xl font-black">৳ {total}</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote },
                { id: 'POS Machine', icon: CreditCard },
                { id: 'Mobile Banking', icon: Smartphone }
              ].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition ${paymentMethod === m.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                  <m.icon size={18}/>
                  <span className="text-[7px] font-black uppercase tracking-widest">{m.id}</span>
                </button>
              ))}
           </div>

           <button 
             disabled={currentSale.length === 0}
             onClick={finalizeSale}
             className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm hover:bg-emerald-400 transition transform active:scale-95 disabled:opacity-20 shadow-2xl"
           >
             COMPLETE & PRINT
           </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
