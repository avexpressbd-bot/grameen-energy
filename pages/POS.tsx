
import React, { useState, useMemo, useRef } from 'react';
import { useProducts } from '../components/ProductContext';
import { useLanguage } from '../components/LanguageContext';
import { Product, Sale, SaleItem, Category } from '../types';
import { 
  Search, Plus, Minus, Trash2, Printer, User, Phone, Tag, Zap, 
  ScanLine, Edit3, PackagePlus, PlusCircle, X, Save, ImageIcon, 
  ShoppingCart, ShieldCheck, Banknote, Wallet, CreditCard
} from 'lucide-react';
import Invoice from '../components/Invoice';
import BarcodeScanner from '../components/BarcodeScanner';

const POS: React.FC = () => {
  const { products, addProduct, updateProduct, recordSale } = useProducts();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isManualItemModalOpen, setIsManualItemModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '', nameBn: '', price: 0, category: Category.LED, image: '', description: '', descriptionBn: '', specs: {}, warranty: '', stock: 0
  });
  const [manualItemData, setManualItemData] = useState({ name: '', price: 0, qty: 1, warranty: '' });

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
        if (existing.quantity >= product.stock) {
          alert(t('Insufficient stock!', 'স্টকে আর নেই!'));
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

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCurrentSale(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stock) {
          alert(t('Max stock reached!', 'স্টকের বেশি দেয়া সম্ভব নয়!'));
          return item;
        }
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const subtotal = currentSale.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = Math.max(0, subtotal - discount);

  const finalizeSale = () => {
    if (currentSale.length === 0) return;
    const newSale: Sale = {
      id: 'INV-' + Date.now().toString().slice(-6),
      customerName, 
      customerPhone, 
      items: currentSale, 
      subtotal, 
      discount, 
      total, 
      paymentMethod, 
      date: new Date().toISOString()
    };
    recordSale(newSale); // Permanently save to history and deduct stock
    setCompletedSale(newSale);
  };

  const resetPOS = () => {
    setCurrentSale([]); 
    setCustomerName(''); 
    setCustomerPhone(''); 
    setDiscount(0); 
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

      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl relative z-10">
        <div className="p-4 bg-white border-b space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={t('Search products...', 'পণ্য খুঁজুন...')}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all font-bold">
                <ScanLine size={18} />
                <span className="hidden sm:inline">{t('Scan', 'স্ক্যান')}</span>
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold border-2 ${selectedCategory === 'All' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
              {t('All Items', 'সব আইটেম')}
            </button>
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold border-2 ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
                {t(cat, cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#f8fafc] custom-scrollbar">
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => addToSale(product)} className={`group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden p-2 ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase ${product.stock <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
                  {product.stock} {t('in Stock', 'স্টক')}
                </div>
              </div>
              <div className="px-1 flex flex-col flex-1">
                <h4 className="font-bold text-slate-800 text-[11px] leading-snug line-clamp-2 min-h-[30px] mb-1">{t(product.name, product.nameBn)}</h4>
                <div className="mt-auto flex items-center justify-between pt-1.5 border-t">
                  <span className="text-[9px] text-slate-400 font-mono">{product.id}</span>
                  <span className="text-blue-900 font-black text-sm">৳{product.discountPrice || product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[450px] flex flex-col bg-white border-l shadow-2xl relative z-20">
        <div className="p-4 bg-slate-900 text-white shrink-0">
          <h2 className="text-sm font-black uppercase tracking-tight mb-4">{t('Checkout Order', 'চেকআউট অর্ডার')}</h2>
          <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex-1 space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase">{t('Customer', 'ক্রেতা')}</p>
              <input type="text" className="w-full bg-transparent border-none text-xs font-bold placeholder:text-slate-500 outline-none" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('Enter Name', 'নাম লিখুন')} />
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex-1 space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase">{t('Phone', 'ফোন')}</p>
              <input type="tel" className="w-full bg-transparent border-none text-xs font-bold placeholder:text-slate-500 outline-none" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          {currentSale.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest">{t('Empty Cart', 'কার্ট খালি')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentSale.map((item, index) => (
                <div key={item.productId} className="flex items-center gap-3 bg-white p-3 hover:bg-blue-50/30 transition-colors">
                  <div className="w-6 h-6 shrink-0 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center text-[10px] font-black">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                    <span className="text-[10px] text-slate-500 font-bold">৳{item.unitPrice}</span>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 shrink-0">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded transition text-slate-500"><Minus size={12}/></button>
                    <span className="w-6 text-center font-black text-xs text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded transition text-slate-500"><Plus size={12}/></button>
                  </div>
                  <div className="w-16 text-right shrink-0 font-black text-xs text-blue-900">৳{item.totalPrice}</div>
                  <button onClick={() => setCurrentSale(prev => prev.filter(i => i.productId !== item.productId))} className="text-slate-200 hover:text-red-500 p-1 shrink-0"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 space-y-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span className="uppercase">{t('Subtotal', 'সাবটোটাল')}</span>
              <span className="text-slate-900">৳{subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('Discount', 'ডিসকাউন্ট')}</span>
              <input type="number" className="w-24 px-2 py-1 bg-slate-50 border rounded-lg text-right font-black text-blue-900 text-xs" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('Payable', 'প্রদেয়')}</span>
                <div className="text-3xl font-black text-slate-900">৳{total}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="text-[8px] font-black text-slate-400 uppercase">{t('Method', 'পদ্ধতি')}</p>
                <div className="flex gap-1">
                  {['Cash', 'bKash', 'Nagad'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[8px] font-black ${paymentMethod === m ? 'bg-blue-900 border-transparent text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {m.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button disabled={currentSale.length === 0} onClick={finalizeSale} className="w-full bg-blue-900 py-4 rounded-xl font-black text-xs text-white uppercase tracking-widest shadow-xl hover:bg-blue-800 transition-all disabled:opacity-30">
            <Printer size={16} className="inline mr-2" /> {t('Complete Order', 'অর্ডার সম্পন্ন')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
