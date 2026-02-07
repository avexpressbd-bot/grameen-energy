
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
  stock: number; // New property to track quantity
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warranty?: string;
}

export interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  date: string;
  image: string;
}

export type Language = 'en' | 'bn';
