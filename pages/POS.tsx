
import React, { useState, useMemo } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, Zap, 
  ScanLine, ShoppingCart, Calculator, CreditCard, 
  Smartphone, Banknote, User, Phone, Tag
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
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS Machine' | 'Mobile Banking'>('Cash');
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
    
    // Auto-fill paid amount if fully paid or using non-cash methods
    const actualPaid = (paymentMethod !== 'Cash') ? total : paidAmount;

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
      paidAmount: actualPaid, 
      dueAmount: Math.max(0, total - actualPaid), 
      paymentMethod, 
      status: 'Delivered',
      date: new Date().toISOString()
    };
    
    try {
      await recordSale(newSale);
      setCompletedSale(newSale);
    } catch (e) {
      alert(t("Failed to save sale.", "বিক্রয় তথ্য সংরক্ষণ করা সম্ভব হয়নি।"));
    }
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
    <div className="h-[calc(100vh-80px)] bg-[#f1f5f9] flex overflow-hidden">
      {isScannerOpen && <BarcodeScanner onScan={(code) => { 
        const p = products.find(prod => prod.id === code); 
        if (p) addToSale(p); 
        setIsScannerOpen(false); 
      }} onClose={() => setIsScannerOpen(false)} />}
      
      {completedSale && <Invoice sale={completedSale} onClose={resetPOS} />}

      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-6 bg-white border-b space-y-4 shadow-sm z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={t('Search products by name or scan barcode...', 'নাম দিয়ে পণ্য খুঁজুন অথবা বারকোড স্ক্যান করুন...')}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)} 
              className="flex items-center gap-3 px-8 py-4 bg-blue-900 text-white rounded-2xl hover:bg-blue-800 transition-all font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-900/10"
            >
              <ScanLine size={20} />
              <span className="hidden lg:inline">{t('Scan Code', 'বারকোড স্ক্যান')}</span>
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button onClick={() => setSelectedCategory('All')} className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest border-2 transition ${selectedCategory === 'All' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>
              {t('All Items', 'সব পণ্য')}
            </button>
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest border-2 transition ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 bg-[#f8fafc]">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToSale(product)} 
              className={`group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden p-3 relative ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${product.stock <= 5 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {product.stock} {t('Stock', 'স্টক')}
                </div>
              </div>
              <div className="px-2">
                <h4 className="font-black text-slate-800 text-xs leading-snug line-clamp-2 min-h-[32px] mb-2">{t(product.name, product.nameBn)}</h4>
                <p className="text-blue-900 font-black text-lg">৳{product.discountPrice || product.price}</p>
              </div>
              <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Sales Sidebar (Terminal) */}
      <div className="w-[500px] flex flex-col bg-white border-l shadow-2xl relative z-20">
        {/* Terminal Header */}
        <div className="p-8 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                 <ShoppingCart size={20} className="text-white" />
               </div>
               <div>
                 <h2 className="text-sm font-black uppercase tracking-[0.2em]">{t('Order Items', 'বর্তমান অর্ডার')}</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">{currentSale.length} Products Added</p>
               </div>
             </div>
             <button onClick={() => setCurrentSale([])} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg hover:bg-red-500 hover:text-white transition uppercase tracking-widest">{t('Clear', 'ক্লিয়ার')}</button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white/5 p-5 rounded-3xl border border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <User size={10} /> {t('Customer', 'ক্রেতার নাম')}
              </div>
              <input 
                type="text" 
                className="w-full bg-transparent border-none text-sm font-bold placeholder:text-slate-600 outline-none" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder={t('Optional Name...', 'নাম (ঐচ্ছিক)...')} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <Phone size={10} /> {t('Phone', 'ফোন নম্বর')}
              </div>
              <input 
                type="tel" 
                className="w-full bg-transparent border-none text-sm font-bold placeholder:text-slate-600 outline-none font-mono" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="01XXXXXXXXX" 
              />
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          {currentSale.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-30">
              <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center">
                <ShoppingCart size={64} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em]">{t('No Items Selected', 'কোনো আইটেম নেই')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentSale.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 bg-white p-5 hover:bg-blue-50/30 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs text-slate-800 truncate mb-1">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-600 font-black">৳{item.unitPrice}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total: ৳{item.totalPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl hover:bg-red-50 text-red-500 shadow-sm transition"><Minus size={14}/></button>
                    <span className="w-10 text-center font-black text-sm text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl hover:bg-emerald-50 text-emerald-500 shadow-sm transition"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Controls */}
        <div className="p-8 bg-white border-t border-slate-100 space-y-6 shrink-0 shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
          {/* Discount & Calculation */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <Tag size={12} className="text-red-400" /> {t('Discount', 'ডিসকাউন্ট')}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-slate-300">৳</span>
                  <input 
                    type="number" 
                    className="w-full bg-transparent font-black text-2xl text-red-600 outline-none" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))} 
                  />
                </div>
             </div>
             <div className="bg-blue-900 p-5 rounded-3xl text-white shadow-xl shadow-blue-900/10">
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">{t('Total Payable', 'মোট বিল')}</p>
                <div className="text-2xl font-black">৳ {total}</div>
             </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Select Payment Method', 'পেমেন্ট মেথড')}</p>
             <div className="grid grid-cols-3 gap-3">
               {[
                 { id: 'Cash', label: 'Cash', labelBn: 'নগদ', icon: Banknote, color: 'emerald' },
                 { id: 'POS Machine', label: 'Card/POS', labelBn: 'পিওএস', icon: CreditCard, color: 'blue' },
                 { id: 'Mobile Banking', label: 'Mobile', labelBn: 'মোবাইল', icon: Smartphone, color: 'purple' },
               ].map((method) => (
                 <button 
                   key={method.id}
                   onClick={() => setPaymentMethod(method.id as any)}
                   className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${paymentMethod === method.id ? 'bg-slate-900 border-slate-900 text-white scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                 >
                   <method.icon size={20} className={paymentMethod === method.id ? 'text-emerald-400' : ''} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-center">{t(method.label, method.labelBn)}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* Paid Amount Input (Only for Cash) */}
          {paymentMethod === 'Cash' && (
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                   <Calculator size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">{t('Customer Paid', 'জমা দিয়েছে')}</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-xl font-black text-emerald-300">৳</span>
                     <input 
                        type="number" 
                        className="w-full bg-transparent text-3xl font-black text-emerald-900 outline-none"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        placeholder="0.00"
                     />
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* Balance Indicator */}
          {paymentMethod === 'Cash' && (
            <div className={`p-5 rounded-3xl flex justify-between items-center ${dueAmount > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
               <span className={`text-[10px] font-black uppercase tracking-widest ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                 {dueAmount > 0 ? t('Remaining Due', 'বাকি') : t('Balance Settled', 'সম্পূর্ণ')}
               </span>
               <span className={`text-xl font-black ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>৳ {dueAmount}</span>
            </div>
          )}

          {/* Finalize Button */}
          <button 
            disabled={currentSale.length === 0} 
            onClick={finalizeSale} 
            className="w-full bg-blue-900 py-6 rounded-[2.5rem] font-black text-sm text-white uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-800 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4"
          >
            <Printer size={20} />
            {t('Print & Complete', 'প্রিন্ট ও সম্পন্ন')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
