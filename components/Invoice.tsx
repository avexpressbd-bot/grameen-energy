
import React from 'react';
import { Sale } from '../types';
import { useLanguage } from './LanguageContext';
import { ShieldCheck } from 'lucide-react';

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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 print:shadow-none print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-blue-900">Grameen Energy</h1>
            <p className="text-emerald-600 font-bold">গ্রামিন এনার্জি</p>
            <p className="text-xs text-gray-500">Uttara, Sector 10, Dhaka</p>
            <p className="text-xs text-gray-500">Phone: +880 1234 567 890</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">{t('INVOICE', 'ইনভয়েস')}</h2>
            <p className="text-sm text-gray-500">#{sale.id}</p>
            <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8 bg-gray-50 p-4 rounded-xl print:bg-transparent print:border">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{t('Bill To', 'ক্রেতার তথ্য')}</h3>
          <p className="font-bold text-lg">{sale.customerName || t('Walk-in Customer', 'সাধারণ কাস্টমার')}</p>
          <p className="text-gray-600">{sale.customerPhone || 'N/A'}</p>
        </div>

        {/* Table */}
        <table className="w-full mb-8">
          <thead className="border-b-2 border-gray-100">
            <tr>
              <th className="py-3 text-left font-bold text-gray-600">{t('Item Description', 'পণ্যের বিবরণ')}</th>
              <th className="py-3 text-center font-bold text-gray-600">{t('Qty', 'পরিমাণ')}</th>
              <th className="py-3 text-right font-bold text-gray-600">{t('Price', 'মূল্য')}</th>
              <th className="py-3 text-right font-bold text-gray-600">{t('Total', 'মোট')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4">
                  <p className="text-sm font-bold text-gray-800">{item.name}</p>
                  {item.warranty && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">
                        {t('Warranty:', 'ওয়ারেন্টি:')} {item.warranty}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-4 text-center text-sm">{item.quantity}</td>
                <td className="py-4 text-right text-sm">৳ {item.unitPrice}</td>
                <td className="py-4 text-right text-sm font-black text-blue-900">৳ {item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('Subtotal', 'সাবটোটাল')}</span>
              <span className="font-bold">৳ {sale.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('Discount', 'ডিসকাউন্ট')}</span>
              <span className="font-bold text-red-600">- ৳ {sale.discount}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-blue-900 border-t pt-3">
              <span>{t('Total Payable', 'মোট প্রদেয়')}</span>
              <span>৳ {sale.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-400 border-t pt-8 space-y-2">
          <p className="font-bold text-gray-600">{t('Thank you for your business!', 'কেনাকাটার জন্য ধন্যবাদ!')}</p>
          <p>{t('Please keep this invoice for warranty claims.', 'ওয়ারেন্টি ক্লেইমের জন্য এই ইনভয়েসটি সংরক্ষণ করুন।')}</p>
          <p className="hidden print:block">{t('Software generated invoice - No signature required.', 'সফটওয়্যার জেনারেটেড ইনভয়েস - স্বাক্ষরের প্রয়োজন নেই।')}</p>
        </div>

        {/* Action Buttons (Hidden in print) */}
        <div className="mt-12 flex gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            {t('Close Window', 'বন্ধ করুন')}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition shadow-xl"
          >
            {t('Print & Save PDF', 'প্রিন্ট ও পিডিএফ')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
