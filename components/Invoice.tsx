
import React from 'react';
import { Sale } from '../types';
import { useLanguage } from './LanguageContext';
// Fix: Added Printer to the imported icons from lucide-react
import { ShieldCheck, CheckCircle2, AlertCircle, ScanLine, Printer } from 'lucide-react';

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
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-6 print:shadow-none print:max-w-none animate-in zoom-in duration-300 font-sans">
        {/* Header */}
        <div className="text-center space-y-2 border-b-2 border-dashed pb-6 mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Grameen Energy</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
            Uttara, Dhaka • +880 1234 567 890<br/>
            www.grameenenergy.com
          </p>
          <div className="pt-2 flex justify-center">
             <div className="bg-slate-900 text-white px-4 py-1 text-[8px] font-black uppercase tracking-[0.3em] rounded-full">Cash Memo</div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="space-y-1 mb-6 text-[10px] font-bold text-slate-600">
           <div className="flex justify-between"><span>Inv No:</span><span className="font-black text-slate-900">#{sale.id}</span></div>
           <div className="flex justify-between"><span>Date:</span><span>{new Date(sale.date).toLocaleString()}</span></div>
           <div className="flex justify-between border-t border-dashed pt-2"><span>Customer:</span><span className="font-black text-slate-900">{sale.customerName}</span></div>
           {sale.customerPhone && <div className="flex justify-between"><span>Phone:</span><span className="font-mono">{sale.customerPhone}</span></div>}
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-6">
          <thead className="border-b border-dashed">
            <tr className="text-[9px] font-black uppercase text-slate-400">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed">
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 pr-2">
                  <p className="font-black text-slate-800 leading-tight">{item.name}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">@৳{item.unitPrice}</p>
                </td>
                <td className="py-3 text-center font-bold">{item.quantity}</td>
                <td className="py-3 text-right font-black">৳{item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-dashed pt-4 space-y-2 mb-8">
           <div className="flex justify-between text-[10px] font-bold text-slate-500">
             <span>Subtotal</span>
             <span>৳ {sale.subtotal}</span>
           </div>
           {sale.discount > 0 && (
             <div className="flex justify-between text-[10px] font-bold text-red-500">
               <span>Discount</span>
               <span>- ৳ {sale.discount}</span>
             </div>
           )}
           <div className="flex justify-between text-xl font-black text-slate-900 pt-2">
             <span>TOTAL</span>
             <span>৳ {sale.total}</span>
           </div>
           <div className="flex justify-between text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
             <span>RECEIVED ({sale.paymentMethod})</span>
             <span>৳ {sale.paidAmount}</span>
           </div>
           {sale.dueAmount > 0 && (
             <div className="flex justify-between text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded">
               <span>BALANCE DUE</span>
               <span>৳ {sale.dueAmount}</span>
             </div>
           )}
        </div>

        {/* Footer Barcode */}
        <div className="text-center space-y-4 pt-4 border-t border-dashed">
           <div className="flex justify-center flex-col items-center opacity-70">
              <ScanLine size={32} className="text-slate-300 mb-1" />
              <p className="text-[7px] font-mono tracking-widest uppercase">{sale.id}</p>
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Visit us again!', 'আবার দেখা হবে!')}</p>
           <p className="text-[7px] text-slate-300 font-bold">{t('Sold products are non-refundable.', 'বিক্রিত পণ্য ফেরতযোগ্য নয়।')}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 print:hidden">
           <button onClick={handlePrint} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
              <Printer size={18}/> Print Receipt
           </button>
           <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-50 hover:text-red-500 transition">
              Close
           </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: 80mm 200mm; }
          body * { visibility: hidden; }
          .print:relative { position: static; }
          .bg-white { visibility: visible; width: 80mm; position: absolute; left: 0; top: 0; padding: 5mm !important; }
          .bg-white * { visibility: visible; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
