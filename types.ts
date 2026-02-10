
export enum Category {
  Solar = 'Solar Panel',
  IPS = 'IPS / Inverter',
  Battery = 'Battery',
  LED = 'LED Light & Bulb',
  Switch = 'Switch & Socket',
  Cable = 'Cable & Wire',
  Charger = 'Charger & Adapter',
  Accessories = 'Electrical Accessories'
}

export interface Product {
  id: string; // Internal Doc ID
  barcode: string; // For Scanner support
  sku: string; // Stock Keeping Unit
  name: string;
  nameBn: string;
  category: Category;
  brand?: string;
  price: number; // Selling Price
  purchasePrice: number; // For Profit Calculation
  image: string;
  description: string;
  descriptionBn: string;
  isBestSeller?: boolean;
  isOffer?: boolean;
  discountPrice?: number;
  specs: Record<string, string>;
  warranty?: string;
  stock: number;
  minStockLevel: number; // For low-stock alerts
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  change: number; // + or -
  reason: 'Sale' | 'Purchase' | 'Adjustment' | 'Damage';
  date: string;
  user: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SiteSettings {
  siteName: string;
  siteNameBn: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  addressBn: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  heroTitleEn: string;
  heroTitleBn: string;
  heroSubtitleEn: string;
  heroSubtitleBn: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  excerpt: string;
  excerptBn: string;
  date: string;
  image: string;
}

export interface ServiceAd {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  descriptionBn: string;
  priceLabel: string;
  areaCoverage: string;
  responseTime: string;
  image: string;
  isEmergency?: boolean;
  hasOffer?: boolean;
}

export type StaffSkill = 'IPS' | 'Solar' | 'Wiring' | 'Repair' | 'Installation';
export type StaffStatus = 'Available' | 'Busy' | 'Offline';
export type StaffRole = 'Technician' | 'Cashier' | 'Manager';
export type SalaryType = 'Monthly' | 'Daily' | 'Per Job' | 'Commission';

export interface Staff {
  id: string; 
  name: string;
  photo: string;
  phone: string;
  whatsapp: string;
  skills: StaffSkill[];
  area: string;
  experience: number;
  status: StaffStatus;
  role: StaffRole;
  baseSalary: number;
  salaryType: SalaryType;
  commissionPerService: number;
  overtimeRate: number;
  isActive: boolean;
  isEmergencyStaff: boolean;
  rating: number;
  totalJobs: number;
  joinedAt: string;
}

export interface StaffReview {
  id: string;
  staffId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export type ServiceStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ServiceRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceType: string;
  problemDescription: string;
  preferredDate: string;
  preferredTime: string;
  manualPrice?: number; 
  photoUrl?: string;
  status: ServiceStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  rating?: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warranty?: string;
  manualItem?: boolean;
  note?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Sale {
  id: string;
  userId?: string; 
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  totalDue: number;
  lastUpdate: string;
}

export interface CustomerUser {
  uid: string;
  accountId: string; 
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  role?: 'customer' | 'technician' | 'admin' | 'pos';
  createdAt: string;
}

export type Language = 'en' | 'bn';
