
import React from 'react';
import { Sale } from '../types';
import { useLanguage } from './LanguageContext';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface InvoiceProps {
  sale: Sale;
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ sale, onClose }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:relative print:inset-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 print:shadow-none print:max-w-none animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter">Grameen Energy</h1>
            <p className="text-emerald-600 font-bold text-sm">গ্রামিন এনার্জি</p>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2">
              <p>House 12, Road 5, Sector 10, Uttara, Dhaka</p>
              <p>Phone: +880 1234 567 890</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-gray-900 tracking-widest">{t('INVOICE', 'ইনভয়েস')}</h2>
            <p className="text-xs font-mono text-gray-400">ID: #{sale.id}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Status */}
        <div className="flex justify-between items-end mb-10 bg-gray-50 p-6 rounded-3xl print:border print:bg-transparent">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Bill To', 'ক্রেতার তথ্য')}</h3>
            <p className="font-black text-xl text-slate-900">{sale.customerName || t('Walk-in Customer', 'সাধারণ কাস্টমার')}</p>
            <p className="text-sm font-bold text-slate-500 font-mono">{sale.customerPhone || 'N/A'}</p>
          </div>
          <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-black text-xs tracking-widest uppercase ${sale.dueAmount > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            {sale.dueAmount > 0 ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
            {sale.dueAmount > 0 ? t('DUE PENDING', 'বকেয়া আছে') : t('FULLY PAID', 'পরিশোধিত')}
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-10">
          <thead className="border-b-2 border-slate-100">
            <tr>
              <th className="py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Product Details', 'পণ্যের বিবরণ')}</th>
              <th className="py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Qty', 'পরিমাণ')}</th>
              <th className="py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Unit Price', 'মূল্য')}</th>
              <th className="py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Subtotal', 'মোট')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sale.items.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="py-5">
                  <p className="text-sm font-black text-slate-800">{item.name}</p>
                  {item.warranty && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                      <ShieldCheck size={12} /> {t('Warranty:', 'ওয়ারেন্টি:') } {item.warranty}
                    </div>
                  )}
                </td>
                <td className="py-5 text-center text-sm font-bold text-slate-600">{item.quantity}</td>
                <td className="py-5 text-right text-sm font-bold text-slate-600">৳{item.unitPrice}</td>
                <td className="py-5 text-right text-sm font-black text-slate-900">৳{item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Detailed Payment Summary */}
        <div className="flex flex-col items-end space-y-3 mb-12">
          <div className="w-72 border-t-2 border-slate-900 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">{t('Gross Amount', 'মোট মূল্য')}</span>
              <span className="font-black text-slate-600">৳ {sale.subtotal}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">{t('Discount Given', 'ডিসকাউন্ট')}</span>
                <span className="font-black text-red-500">- ৳ {sale.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-slate-900 py-2">
              <span>{t('Grand Total', 'সর্বমোট বিল')}</span>
              <span>৳ {sale.total}</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
               <div className="flex justify-between text-xs font-black text-emerald-600">
                 <span>{t('Amount Received', 'জমা')}</span>
                 <span>৳ {sale.paidAmount}</span>
               </div>
               {sale.dueAmount > 0 && (
                 <div className="flex justify-between text-xs font-black text-red-600 border-t border-red-100 pt-2">
                   <span>{t('Balance Due', 'বাকি')}</span>
                   <span>৳ {sale.dueAmount}</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 border-t pt-10">
          <p className="text-sm font-black text-blue-900 uppercase tracking-widest">{t('Thank you for choosing Grameen Energy!', 'গ্রামিন এনার্জি-তে কেনাকাটা করার জন্য ধন্যবাদ!')}</p>
          <div className="flex justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>Genuine Quality</span>
            <span>Expert Support</span>
            <span>Safe Energy</span>
          </div>
          <p className="text-[9px] text-slate-300 font-bold pt-4">{t('Note: Keep this invoice safe for warranty claims. Terms & conditions apply.', 'বিঃদ্রঃ ওয়ারেন্টি ক্লেইমের জন্য এই ইনভয়েসটি যত্ন করে রাখুন।')}</p>
        </div>

        {/* Buttons */}
        <div className="mt-12 flex gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition"
          >
            {t('Close Window', 'বন্ধ করুন')}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-800 transition shadow-2xl"
          >
            {t('Print Invoice', 'প্রিন্ট ইনভয়েস')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
