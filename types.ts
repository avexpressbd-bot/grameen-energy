
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
  id: string;
  name: string;
  nameBn: string;
  category: Category;
  price: number;
  image: string;
  description: string;
  descriptionBn: string;
  isBestSeller?: boolean;
  isOffer?: boolean;
  discountPrice?: number;
  specs: Record<string, string>;
  warranty?: string;
  stock: number;
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

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warranty?: string;
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
  createdAt: string;
}

export type Language = 'en' | 'bn';
