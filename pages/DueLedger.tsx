// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, RefreshCw, FileSpreadsheet, Info, Phone, User, 
  DollarSign, Calendar, ChevronUp, ChevronDown, CheckCircle, 
  AlertTriangle, Clock, ArrowUpDown, SlidersHorizontal, ExternalLink, Settings, X, ChevronRight, BookOpen
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { useProducts } from '../components/ProductContext';

interface LedgerItem {
  customerName: string;
  phone: string;
  totalDue: number;
  lastPaymentDate: string;
  status: string;
}

// Realistic default local ledger data for instant loading and previewing
const DEFAULT_LEDGER_DATA: LedgerItem[] = [
  { customerName: 'আবুল কাশেম (Abul Kashem)', phone: '01712345678', totalDue: 15000, lastPaymentDate: '2026-06-25', status: 'Outstanding' },
  { customerName: 'মোঃ হাসান (Md. Hasan)', phone: '01823456789', totalDue: 0, lastPaymentDate: '2026-07-02', status: 'Paid' },
  { customerName: 'সাজ্জাদ রহমান (Sajjad Rahman)', phone: '01934567890', totalDue: 4500, lastPaymentDate: '2026-06-10', status: 'Outstanding' },
  { customerName: 'রহিমা বেগম (Rahima Begum)', phone: '01545678901', totalDue: 0, lastPaymentDate: '2026-07-05', status: 'Paid' },
  { customerName: 'তারেক মাহমুদ (Tarek Mahmud)', phone: '01356789012', totalDue: 28000, lastPaymentDate: '2026-05-15', status: 'Overdue' },
  { customerName: 'জসিম উদ্দিন (Josim Uddin)', phone: '01678901234', totalDue: 7200, lastPaymentDate: '2026-06-28', status: 'Outstanding' },
  { customerName: 'নাজমুল হুদা (Nazmul Huda)', phone: '01723456789', totalDue: 0, lastPaymentDate: '2026-07-01', status: 'Paid' },
  { customerName: 'ফারুক আহমেদ (Faruk Ahmed)', phone: '01834567890', totalDue: 42000, lastPaymentDate: '2026-04-20', status: 'Overdue' },
  { customerName: 'লুৎফর রহমান (Lutfor Rahman)', phone: '01945678901', totalDue: 12500, lastPaymentDate: '2026-06-18', status: 'Outstanding' },
];

const DueLedger: React.FC = () => {
  const { t, language } = useLanguage();
  
  // URL configurations
  const { settings } = useProducts();
  const csvUrl = settings?.dueLedgerCsvUrl || '';
  
  // Data states
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>(DEFAULT_LEDGER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return localStorage.getItem('due_ledger_last_synced') || null;
  });
  
  // Interactive control states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Outstanding' | 'Overdue'>('All');
  const [sortField, setSortField] = useState<'customerName' | 'totalDue' | 'lastPaymentDate'>('totalDue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showInstructions, setShowInstructions] = useState(false);

  // Helper to parse line-by-line CSV without external library dependency issues
  const parseCSV = (text: string): LedgerItem[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    // Parse single CSV line safely handling quotes
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.replace(/^"|"$/g, ''));
      return result;
    };

    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map(h => h.trim().toLowerCase());
    const parsedItems: LedgerItem[] = [];

    // Attempt to dynamically map standard column names (English or Bangla equivalents)
    const findIndex = (keywords: string[]): number => {
      return headers.findIndex(h => keywords.some(keyword => h.includes(keyword)));
    };

    const nameIdx = findIndex(['name', 'customer', 'নাম', 'গ্রাহক']);
    const phoneIdx = findIndex(['phone', 'mobile', 'নাম্বার', 'ফোন', 'মোবাইল', 'কন্টাক্ট']);
    const dueIdx = findIndex(['due', 'amount', 'total due', 'বাকি', 'মোট বাকি', 'বকেয়া', 'টাকা']);
    const dateIdx = findIndex(['date', 'payment', 'last payment', 'তারিখ', 'সর্বশেষ']);
    const statusIdx = findIndex(['status', 'state', 'অবস্থা', 'স্ট্যাটাস', 'ধরণ']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      
      // Fallback index assignments if headings are not matched perfectly
      const customerName = nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : (values[0] || 'Unknown Customer');
      const phone = phoneIdx !== -1 && values[phoneIdx] ? values[phoneIdx] : (values[1] || 'N/A');
      
      const rawDue = dueIdx !== -1 && values[dueIdx] ? values[dueIdx] : (values[2] || '0');
      // Strip currency symbols, commas, spaces
      const totalDue = parseFloat(rawDue.replace(/[^\d.-]/g, '')) || 0;
      
      const lastPaymentDate = dateIdx !== -1 && values[dateIdx] ? values[dateIdx] : (values[3] || 'N/A');
      
      let status = statusIdx !== -1 && values[statusIdx] ? values[statusIdx] : '';
      if (!status) {
        if (totalDue === 0) {
          status = 'Paid';
        } else if (totalDue > 20000) {
          status = 'Overdue';
        } else {
          status = 'Outstanding';
        }
      }

      parsedItems.push({
        customerName: customerName.trim(),
        phone: phone.trim(),
        totalDue,
        lastPaymentDate: lastPaymentDate.trim(),
        status: status.trim()
      });
    }

    return parsedItems;
  };

  const fetchLedgerData = async (urlToFetch = csvUrl) => {
    if (!urlToFetch) {
      setError(language === 'en' ? 'Please configure your Google Sheet CSV URL first.' : 'অনুগ্রহ করে প্রথমে আপনার গুগল শিট CSV লিঙ্কটি কনফিগার করুন।');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let correctedUrl = urlToFetch.trim();
      if (correctedUrl.includes('docs.google.com/spreadsheets')) {
        // Extract Spreadsheet ID
        const idMatch = correctedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
          const sheetId = idMatch[1];
          // Try to get gid if it exists in the url
          const gidMatch = correctedUrl.match(/[#&?]gid=([0-9]+)/);
          const gid = gidMatch ? gidMatch[1] : '0';
          // Convert to direct export CSV URL which works for both shared links and published links!
          correctedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        }
      }

      const response = await fetch(correctedUrl);
      if (!response.ok) {
        throw new Error(language === 'en' ? 'Failed to fetch spreadsheet. Verify permissions/URL.' : 'শিট ফাইলটি লোড করা সম্ভব হয়নি। লিঙ্ক এবং অনুমতি চেক করুন।');
      }

      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        throw new Error(language === 'en' ? 'No records found in CSV.' : 'CSV ফাইলে কোনো তথ্য পাওয়া যায়নি।');
      }

      setLedgerData(parsed);
      const timeStr = new Date().toLocaleString(language === 'en' ? 'en-US' : 'bn-BD');
      setLastSynced(timeStr);
      localStorage.setItem('due_ledger_last_synced', timeStr);
      localStorage.setItem('due_ledger_cached_data', JSON.stringify(parsed));
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'en' ? 'Failed to sync. Please ensure Google Sheet is Published to the Web as CSV or Shared as Anyone with Link.' : 'সিঙ্ক করতে সমস্যা হয়েছে। গুগল শিট "Publish to web" অথবা "Anyone with link" দিয়ে শেয়ার করা আছে কিনা নিশ্চিত করুন।'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial loading from cache if exists
  useEffect(() => {
    const cached = localStorage.getItem('due_ledger_cached_data');
    if (cached) {
      try {
        setLedgerData(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync on csvUrl mount or update
  useEffect(() => {
    if (csvUrl) {
      fetchLedgerData(csvUrl);
    } else if (settings !== null) {
      // Revert to default demo data if no URL
      setLedgerData(DEFAULT_LEDGER_DATA);
    }
  }, [csvUrl, settings]);

  const handleSort = (field: 'customerName' | 'totalDue' | 'lastPaymentDate') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter & Search & Sort logical chain
  const processedData = useMemo(() => {
    let result = [...ledgerData];

    // 1. Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        item.customerName.toLowerCase().includes(term) ||
        item.phone.includes(term)
      );
    }

    // 2. Status filter
    if (statusFilter !== 'All') {
      result = result.filter(item => {
        const itemStatus = item.status.toLowerCase();
        if (statusFilter === 'Paid') return item.totalDue === 0 || itemStatus.includes('paid') || itemStatus.includes('পরিশোধিত') || itemStatus.includes('জমা');
        if (statusFilter === 'Overdue') return itemStatus.includes('overdue') || itemStatus.includes('মেয়াদোত্তীর্ণ') || (item.totalDue > 20000);
        if (statusFilter === 'Outstanding') return item.totalDue > 0 && !itemStatus.includes('overdue') && !itemStatus.includes('মেয়াদোত্তীর্ণ');
        return true;
      });
    }

    // 3. Sort logic
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'totalDue') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ledgerData, searchTerm, statusFilter, sortField, sortDirection]);

  // Derived Summary Metrics
  const stats = useMemo(() => {
    const totalDueSum = ledgerData.reduce((sum, item) => sum + (Number(item.totalDue) || 0), 0);
    const activeDebtorsCount = ledgerData.filter(item => item.totalDue > 0).length;
    const paidCount = ledgerData.filter(item => item.totalDue === 0).length;
    const highDueCount = ledgerData.filter(item => item.totalDue > 15000).length;

    return {
      totalDueSum,
      activeDebtorsCount,
      paidCount,
      highDueCount
    };
  }, [ledgerData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 space-y-8" id="due-ledger-container">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 bg-red-50 text-red-500 rounded-3xl inline-flex shadow-sm">
              <FileSpreadsheet size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {t('Due Ledger (বকেয়া খাতা)', 'বকেয়া খাতা (Due Ledger)')}
              </h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                {csvUrl ? t('Synced Online with Google Sheets', 'গুগল শিটের সাথে অনলাইন সিঙ্কড') : t('Interactive Offline Demo Ledger', 'ইন্টারেক্টিভ অফলাইন ডেমো লেজার')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {csvUrl && (
            <button 
              onClick={() => fetchLedgerData(csvUrl)}
              disabled={isLoading}
              className={`flex-1 sm:flex-none px-6 py-3.5 bg-[#005CB9] hover:bg-blue-800 disabled:bg-blue-200 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10`}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? t('Syncing...', 'সিঙ্ক হচ্ছে...') : t('Refresh Sync', 'রিফ্রেশ সিঙ্ক')}
            </button>
          )}
        </div>
      </div>

      {/* Status Warning / Status Banner */}
      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-5 flex items-start gap-4 animate-in fade-in duration-300">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={24} />
          <div className="space-y-1">
            <p className="text-sm font-black text-red-800">{t('Spreadsheet Connection Failed', 'গুগল শিট কানেকশন ব্যর্থ হয়েছে')}</p>
            <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Outstanding Due */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-red-50 text-red-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Total Outstanding Due', 'মোট বাকি টাকা')}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">৳{stats.totalDueSum.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full translate-x-8 -translate-y-8" />
        </div>

        {/* Active Debtors */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Active Debtors', 'মোট বাকি থাকা কাস্টমার')}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {stats.activeDebtorsCount} {t('Persons', 'জন')}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8" />
        </div>

        {/* High Risk Accounts */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('High Risk Accounts', 'উচ্চ ঝুঁকি সম্পন্ন হিসাব')}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {stats.highDueCount} {t('Persons', 'জন')}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full translate-x-8 -translate-y-8" />
        </div>

        {/* Sync details Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Clock size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Last Synced', 'সর্বশেষ সিঙ্ক')}</p>
            <p className="text-[11px] font-black text-slate-800 mt-2 truncate font-mono">
              {lastSynced ? lastSynced : t('Never Synced (Demo)', 'এখনো সিঙ্ক হয়নি')}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8" />
        </div>
      </div>

      {/* Help Instructions Toggle Banner */}
      <div className="bg-slate-100 rounded-[2rem] p-5">
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between font-black text-xs text-slate-700 uppercase tracking-widest outline-none px-2"
        >
          <span className="flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            {t('Google Sheets Integration Guide', 'গুগল শিট থেকে আপনার নিজের বাকি খাতা কানেক্ট করার নির্দেশিকা')}
          </span>
          {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showInstructions && (
          <div className="mt-4 p-5 bg-white rounded-2xl border border-slate-200 text-slate-600 space-y-4 text-xs font-semibold leading-relaxed animate-in slide-in-from-top-3 duration-200">
            <p className="font-bold text-slate-800">
              {t('By connecting your Google Sheets ledger, you can see live baki accounts in real-time. Follow these steps:', 'আপনার নিজস্ব গুগল শিট কানেক্ট করে সরাসরি কাস্টমারদের বকেয়া দেখতে পারবেন। এই প্রসেসটি অত্যন্ত সহজ:')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <p className="font-black text-slate-800 text-[10px] uppercase tracking-widest text-[#005CB9]">{t('1. Format Spreadsheet Columns', '১. কলামের হেডার ফরম্যাট করা')}</p>
                <p>{t('Create columns in your sheet with headers like:', 'আপনার এক্সেল বা গুগল শিটে নিচের নাম অনুযায়ী কলামের প্রথম লাইন (Header Row) তৈরি করুন:')}</p>
                <div className="bg-slate-50 p-3 rounded-xl border font-mono text-[10px] text-slate-800 flex flex-wrap gap-2">
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Customer Name</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Phone</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Total Due</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Last Payment Date</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Status</span>
                </div>
                <p className="text-[10px] text-slate-400">{t('* Both English & Bengali column headers are supported automatically.', '* কলামের নাম বাংলা অথবা ইংরেজি যেকোনোটা হলেই চলবে।')}</p>
              </div>

              <div className="space-y-2">
                <p className="font-black text-slate-800 text-[10px] uppercase tracking-widest text-[#005CB9]">{t('2. Share & Paste Link', '২. লিঙ্ক কানেক্ট করা (সহজ নিয়ম)')}</p>
                <p>{t('Simply click "Share" on your Google Sheet, change General Access to "Anyone with the link" as Viewer, then copy your browser URL and paste it into the Sheet Setup modal. Our app automatically handles the connection!', 'গুগল শিটের ডানে "Share" বাটনে ক্লিক করে General Access থেকে "Anyone with the link" (লিঙ্ক আছে এমন যে কেউ) সিলেক্ট করে দিন। এরপর ব্রাউজারের সাধারণ গুগল শিটের লিংকটি কপি করে "Sheet Setup" বক্সে পেস্ট করে দিন। আমাদের অ্যাপ নিজে থেকেই এটি প্রসেস করে নিবে!')}</p>
                <button 
                  onClick={() => {
                    setIsUrlModalOpen(true);
                    setShowInstructions(false);
                  }}
                  className="px-4 py-2 bg-[#005CB9] hover:bg-blue-800 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest transition"
                >
                  {t('Open Sheet Setup Now', 'এখনই শিট লিঙ্ক সেট করুন')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Database Table and Interactive Controls Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Filter and Search header bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Search by customer name or phone...', 'নাম বা মোবাইল নাম্বার দিয়ে খুঁজুন...')}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition shadow-inner"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
              <SlidersHorizontal size={12} />
              {t('Filter Status:', 'ফিল্টার স্ট্যাটাস:')}
            </div>
            {(['All', 'Paid', 'Outstanding', 'Overdue'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  statusFilter === filter 
                    ? 'bg-[#005CB9] text-white shadow-md' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {filter === 'All' ? t('All', 'সবাই') : 
                 filter === 'Paid' ? t('Fully Paid', 'পরিশোধিত') : 
                 filter === 'Outstanding' ? t('Outstanding', 'বকেয়া') : 
                 t('Overdue', 'মেয়াদোত্তীর্ণ')}
              </button>
            ))}
          </div>

        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                
                {/* Header: Name */}
                <th 
                  onClick={() => handleSort('customerName')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    {t('Customer Name', 'কাস্টমার নাম')}
                    {sortField === 'customerName' ? (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#005CB9]" /> : <ChevronDown size={14} className="text-[#005CB9]" />
                    ) : <ArrowUpDown size={12} className="text-slate-300" />}
                  </div>
                </th>

                {/* Header: Phone */}
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                  {t('Phone Number', 'মোবাইল নাম্বার')}
                </th>

                {/* Header: Total Due */}
                <th 
                  onClick={() => handleSort('totalDue')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition select-none text-right"
                >
                  <div className="flex items-center gap-1.5 justify-end">
                    {t('Total Due', 'মোট বকেয়া / বাকি')}
                    {sortField === 'totalDue' ? (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#005CB9]" /> : <ChevronDown size={14} className="text-[#005CB9]" />
                    ) : <ArrowUpDown size={12} className="text-slate-300" />}
                  </div>
                </th>

                {/* Header: Last Payment Date */}
                <th 
                  onClick={() => handleSort('lastPaymentDate')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    {t('Last Payment Date', 'সর্বশেষ পেমেন্টের তারিখ')}
                    {sortField === 'lastPaymentDate' ? (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#005CB9]" /> : <ChevronDown size={14} className="text-[#005CB9]" />
                    ) : <ArrowUpDown size={12} className="text-slate-300" />}
                  </div>
                </th>

                {/* Header: Status */}
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none text-center">
                  {t('Status', 'অবস্থা')}
                </th>

              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedData.length > 0 ? (
                processedData.map((item, index) => {
                  const isPaid = item.totalDue === 0;
                  const isOverdue = !isPaid && (
                    item.status.toLowerCase().includes('overdue') || 
                    item.status.toLowerCase().includes('মেয়াদোত্তীর্ণ') || 
                    item.totalDue > 20000
                  );

                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-slate-50/50 transition group"
                    >
                      {/* Name Column */}
                      <td className="px-8 py-4.5 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${
                            isPaid ? 'bg-emerald-50 text-emerald-600' :
                            isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.customerName ? item.customerName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <span className="block text-slate-800 group-hover:text-blue-900 transition font-black">
                              {item.customerName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone Column */}
                      <td className="px-8 py-4.5 font-bold text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-slate-300" />
                          {item.phone || 'N/A'}
                        </div>
                      </td>

                      {/* Total Due Column */}
                      <td className="px-8 py-4.5 text-right font-black">
                        <span className={`text-base font-black ${isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                          ৳{item.totalDue.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}
                        </span>
                      </td>

                      {/* Last Payment Date Column */}
                      <td className="px-8 py-4.5 font-bold text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-300" />
                          {item.lastPaymentDate || 'N/A'}
                        </div>
                      </td>

                      {/* Status badge Column */}
                      <td className="px-8 py-4.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : isOverdue 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {isPaid ? (
                            <>
                              <CheckCircle size={10} />
                              {t('Fully Paid', 'পরিশোধিত')}
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertTriangle size={10} />
                              {t('Overdue', 'মেয়াদোত্তীর্ণ')}
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              {t('Outstanding', 'বকেয়া')}
                            </>
                          )}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="p-4 bg-slate-100 text-slate-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                        <Search size={24} />
                      </div>
                      <p className="font-black text-slate-800 text-sm">{t('No Customers Found', 'কোনো গ্রাহক পাওয়া যায়নি')}</p>
                      <p className="text-xs text-slate-400 font-bold">{t('Try searching with a different name or telephone number.', 'অনুগ্রহ করে ভিন্ন নাম বা মোবাইল নাম্বার লিখে পুনরায় চেষ্টা করুন।')}</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition"
                        >
                          {t('Clear Search', 'সার্চ মুছে ফেলুন')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info row */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
          <div>
            {t(`Showing ${processedData.length} of ${ledgerData.length} records`, `মোট ${ledgerData.length} টি রেকর্ডের মধ্যে ${processedData.length} টি দেখানো হচ্ছে`)}
          </div>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-400">
            {t('Sync updates occur safely on user action.', 'সকল হিসাব নিরাপদে গুগল শিট থেকে লোড করা হয়')}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DueLedger;
