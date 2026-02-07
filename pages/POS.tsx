
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, Zap, 
  ScanLine, ShoppingCart, Calculator
} from 'lucide-react';
import Invoice from '../components/Invoice';
import BarcodeScanner from '../components/BarcodeScanner';

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
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.nameBn.includes(searchTerm) || 
                           p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToSale = (product: Product) => {
    if (product.stock <= 0) {
      alert(t('Out of stock!', 'এই পণ্যটি স্টকে নেই!'));
      return;
    }
    setCurrentSale(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
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
  const dueAmount = Math.max(0, total - paidAmount);

  const finalizeSale = async () => {
    if (currentSale.length === 0) return;
    if (dueAmount > 0 && !customerPhone) {
      alert(t('Customer phone required for due sales!', 'বাকি বিক্রয়ের জন্য ফোন নম্বর অবশ্যই দিতে হবে!'));
      return;
    }

    const newSale: Sale = {
      id: 'INV-' + Date.now().toString().slice(-6),
      customerName: customerName || t('Walk-in Customer', 'সাধারণ কাস্টমার'), 
      customerPhone, 
      items: currentSale, 
      subtotal, 
      discount, 
      total, 
      paidAmount, 
      dueAmount, 
      paymentMethod, 
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
    <div className="h-[calc(100vh-80px)] bg-[#f8fafc] flex overflow-hidden">
      {isScannerOpen && <BarcodeScanner onScan={(code) => { 
        const p = products.find(prod => prod.id === code); 
        if (p) addToSale(p); 
        setIsScannerOpen(false); 
      }} onClose={() => setIsScannerOpen(false)} />}
      
      {completedSale && <Invoice sale={completedSale} onClose={resetPOS} />}

      {/* Product Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-4 bg-white border-b space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={t('Search products...', 'পণ্য খুঁজুন...')}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl hover:bg-blue-800 transition-all font-black uppercase text-xs tracking-widest">
              <ScanLine size={18} />
              <span className="hidden sm:inline">{t('Scan', 'স্ক্যান')}</span>
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold border-2 transition ${selectedCategory === 'All' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
              {t('All Items', 'সব আইটেম')}
            </button>
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold border-2 transition ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
                {t(cat, cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 bg-[#f8fafc]">
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => addToSale(product)} className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden p-2 ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${product.stock <= 5 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {product.stock} {t('Stock', 'স্টক')}
                </div>
              </div>
              <div className="px-1 text-center">
                <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2 min-h-[32px] mb-2">{t(product.name, product.nameBn)}</h4>
                <p className="text-blue-900 font-black text-sm">৳{product.discountPrice || product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-[480px] flex flex-col bg-white border-l shadow-2xl relative z-20">
        <div className="p-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <ShoppingCart size={18} className="text-emerald-400" />
               {t('Current Order', 'বর্তমান অর্ডার')}
             </h2>
             <button onClick={() => setCurrentSale([])} className="text-[10px] text-red-400 font-bold hover:text-red-300 uppercase tracking-widest">{t('Clear All', 'সব মুছুন')}</button>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('Customer', 'ক্রেতার নাম')}</p>
              <input type="text" className="w-full bg-transparent border-none text-sm font-bold placeholder:text-slate-600 outline-none" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('Walking...', 'ক্রেতার নাম...')} />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('Phone', 'ফোন নম্বর')}</p>
              <input type="tel" className="w-full bg-transparent border-none text-sm font-bold placeholder:text-slate-600 outline-none font-mono" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          {currentSale.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">
              <ShoppingCart size={80} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-[0.2em]">{t('Cart is Empty', 'কার্ট খালি')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentSale.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 bg-white p-4 hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate mb-1">{item.name}</p>
                    <span className="text-[10px] text-slate-500 font-black">৳{item.unitPrice} x {item.quantity}</span>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-red-50 text-red-500 shadow-sm transition"><Minus size={14}/></button>
                    <span className="w-8 text-center font-black text-sm text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-emerald-50 text-emerald-500 shadow-sm transition"><Plus size={14}/></button>
                  </div>
                  <div className="w-20 text-right shrink-0 font-black text-sm text-blue-900">৳{item.totalPrice}</div>
                  <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 space-y-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
               <div className="space-y-1">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Discount Amount', 'ডিসকাউন্ট')}</span>
                 <input type="number" className="w-full bg-transparent font-black text-xl text-red-600 outline-none" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
               </div>
               <div className="h-10 w-px bg-slate-200" />
               <div className="space-y-1 text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Total Payable', 'মোট বিল')}</span>
                 <div className="text-xl font-black text-slate-900">৳ {total}</div>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-5 rounded-3xl group focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
               <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                 <Calculator size={24} />
               </div>
               <div className="flex-1 space-y-1">
                 <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.1em]">{t('Amount Paid by Customer', 'কাস্টমার জমা দিয়েছে')}</p>
                 <input 
                    type="number" 
                    className="w-full bg-transparent text-3xl font-black text-emerald-900 outline-none placeholder:text-emerald-200"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    placeholder="0.00"
                 />
               </div>
            </div>

            <div className={`p-5 rounded-3xl flex justify-between items-center transition-all ${dueAmount > 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
               <div>
                 <p className={`text-[10px] font-black uppercase tracking-widest ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                   {dueAmount > 0 ? t('Remaining Balance (Due)', 'বাকি টাকা') : t('Payment Status', 'পেমেন্ট স্ট্যাটাস')}
                 </p>
                 <p className={`text-2xl font-black ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                   {dueAmount > 0 ? `৳ ${dueAmount}` : t('FULLY PAID', 'সম্পূর্ণ পরিশোধিত')}
                 </p>
               </div>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dueAmount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 <Zap size={20} fill="currentColor" />
               </div>
            </div>
          </div>

          <button 
            disabled={currentSale.length === 0} 
            onClick={finalizeSale} 
            className="w-full bg-blue-900 py-5 rounded-[2rem] font-black text-sm text-white uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-800 transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
          >
            <Printer size={20} />
            {t('Complete Sale & Print', 'বিক্রয় নিশ্চিত ও প্রিন্ট')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
