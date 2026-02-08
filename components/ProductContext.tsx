
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale, Customer, SiteSettings, BlogPost, OrderStatus, CustomerUser, ServiceRequest, ServiceAd, ServiceStatus, Staff, StaffReview } from '../types';
import { db } from '../services/firebase';
import { 
  collection, onSnapshot, updateDoc, deleteDoc, doc, setDoc, query, orderBy, getDocs, increment 
} from "firebase/firestore";

interface ProductContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  registeredUsers: CustomerUser[];
  blogs: BlogPost[];
  serviceRequests: ServiceRequest[];
  serviceAds: ServiceAd[];
  staff: Staff[];
  reviews: StaffReview[];
  settings: SiteSettings | null;
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordSale: (sale: Sale) => Promise<void>;
  updateSaleStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateCustomerDue: (phone: string, name: string, amountPaid: number) => Promise<void>;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  addBlog: (blog: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateServiceStatus: (id: string, status: ServiceStatus, staffId?: string, staffName?: string) => Promise<void>;
  updateServiceRequest: (id: string, data: Partial<ServiceRequest>) => Promise<void>; // New generic update
  addServiceAd: (ad: ServiceAd) => Promise<void>;
  deleteServiceAd: (id: string) => Promise<void>;
  addStaff: (s: Staff) => Promise<void>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addReview: (review: StaffReview) => Promise<void>;
  syncWithFirebase: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<CustomerUser[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceAds, setServiceAds] = useState<ServiceAd[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const unsubProducts = onSnapshot(collection(db, "products"), (s) => setProducts(s.docs.map(d => ({...d.data(), id: d.id})) as Product[]));
    const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("date", "desc")), (s) => setSales(s.docs.map(d => ({...d.data(), id: d.id})) as Sale[]));
    const unsubCustomers = onSnapshot(collection(db, "customers"), (s) => setCustomers(s.docs.map(d => ({...d.data(), id: d.id})) as Customer[]));
    const unsubUsers = onSnapshot(collection(db, "users"), (s) => setRegisteredUsers(s.docs.map(d => ({...d.data(), uid: d.id})) as CustomerUser[]));
    const unsubBlogs = onSnapshot(query(collection(db, "blogs"), orderBy("date", "desc")), (s) => setBlogs(s.docs.map(d => ({...d.data(), id: d.id})) as BlogPost[]));
    const unsubServiceRequests = onSnapshot(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")), (s) => setServiceRequests(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceRequest[]));
    const unsubServiceAds = onSnapshot(collection(db, "serviceAds"), (s) => setServiceAds(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceAd[]));
    const unsubStaff = onSnapshot(collection(db, "staff"), (s) => setStaff(s.docs.map(d => ({...d.data(), id: d.id})) as Staff[]));
    const unsubReviews = onSnapshot(collection(db, "staffReviews"), (s) => setReviews(s.docs.map(d => ({...d.data(), id: d.id})) as StaffReview[]));
    const unsubSettings = onSnapshot(doc(db, "site", "config"), (d) => d.exists() && setSettings(d.data() as SiteSettings));

    setLoading(false);
    return () => { 
      unsubProducts(); unsubSales(); unsubCustomers(); unsubUsers(); unsubBlogs(); 
      unsubServiceRequests(); unsubServiceAds(); unsubStaff(); unsubReviews(); unsubSettings(); 
    };
  }, []);

  const addServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = 'SR-' + Date.now();
    const newRequest: ServiceRequest = {
      ...request,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "serviceRequests", id), newRequest);
    return id;
  };

  const updateServiceStatus = async (id: string, status: ServiceStatus, staffId?: string, staffName?: string) => {
    const updateData: any = { status };
    if (staffId) updateData.assignedStaffId = staffId;
    if (staffName) updateData.assignedStaffName = staffName;
    await updateDoc(doc(db, "serviceRequests", id), updateData);
  };

  const updateServiceRequest = async (id: string, data: Partial<ServiceRequest>) => {
    await updateDoc(doc(db, "serviceRequests", id), data as any);
  };

  const addStaff = async (s: Staff) => {
    await setDoc(doc(db, "staff", s.id), s);
  };

  const updateStaff = async (id: string, data: Partial<Staff>) => {
    await updateDoc(doc(db, "staff", id), data);
  };

  const deleteStaff = async (id: string) => {
    await deleteDoc(doc(db, "staff", id));
  };

  const addReview = async (review: StaffReview) => {
    await setDoc(doc(db, "staffReviews", review.id), review);
  };

  const addServiceAd = async (ad: ServiceAd) => {
    await setDoc(doc(db, "serviceAds", ad.id), ad);
  };

  const deleteServiceAd = async (id: string) => {
    await deleteDoc(doc(db, "serviceAds", id));
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    await setDoc(doc(db, "site", "config"), newSettings);
  };

  const addProduct = async (p: Product) => {
    const { id, ...data } = p;
    await setDoc(doc(db, "products", id), data);
  };

  const updateProduct = async (id: string, p: Product) => {
    const { id: _, ...data } = p;
    await updateDoc(doc(db, "products", id), data as any);
  };

  const deleteProduct = async (id: string) => {
    if(confirm('ডিলিট?')) await deleteDoc(doc(db, "products", id));
  };

  const addBlog = async (b: BlogPost) => {
    await setDoc(doc(db, "blogs", b.id), b);
  };

  const deleteBlog = async (id: string) => {
    await deleteDoc(doc(db, "blogs", id));
  };

  const recordSale = async (sale: Sale) => {
    const { id, ...data } = sale;
    await setDoc(doc(db, "sales", id), data);
    
    for (const item of sale.items) {
      const pRef = doc(db, "products", item.productId);
      await updateDoc(pRef, { stock: increment(-item.quantity) });
    }

    if (sale.customerPhone) {
      const cRef = doc(db, "customers", sale.customerPhone);
      const cSnap = await getDocs(query(collection(db, "customers")));
      if (!cSnap.docs.some(d => d.id === sale.customerPhone)) {
        await setDoc(cRef, { name: sale.customerName || "Walking", totalDue: sale.dueAmount, lastUpdate: new Date().toISOString() });
      } else {
        await updateDoc(cRef, { totalDue: increment(sale.dueAmount), lastUpdate: new Date().toISOString() });
      }
    }
  };

  const updateSaleStatus = async (id: string, status: OrderStatus) => {
    await updateDoc(doc(db, "sales", id), { status });
  };

  const updateCustomerDue = async (phone: string, name: string, amount: number) => {
    await updateDoc(doc(db, "customers", phone), { totalDue: increment(-amount), lastUpdate: new Date().toISOString() });
  };

  const syncWithFirebase = async () => {};

  return (
    <ProductContext.Provider value={{ 
      products, sales, customers, registeredUsers, blogs, settings, loading, 
      serviceRequests, serviceAds, staff, reviews,
      addProduct, updateProduct, deleteProduct, recordSale, 
      updateSaleStatus, updateCustomerDue, updateSettings, addBlog, deleteBlog,
      addServiceRequest, updateServiceStatus, updateServiceRequest, addServiceAd, deleteServiceAd,
      addStaff, updateStaff, deleteStaff, addReview,
      syncWithFirebase 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts error');
  return context;
};
