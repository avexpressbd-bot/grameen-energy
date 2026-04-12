
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale, Customer, SiteSettings, BlogPost, OrderStatus, CustomerUser, ServiceRequest, ServiceAd, ServiceStatus, Staff, StaffReview, StockLog } from '../types';
import { db, auth } from '../services/firebase';
import { 
  collection, onSnapshot, updateDoc, deleteDoc, doc, setDoc, query, orderBy, getDocs, increment, addDoc, getDocFromServer, getDoc 
} from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

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
  stockLogs: StockLog[];
  settings: SiteSettings | null;
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, change: number, reason: StockLog['reason']) => Promise<void>;
  recordSale: (sale: Sale) => Promise<void>;
  updateSaleStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateSale: (id: string, data: Partial<Sale>) => Promise<void>;
  updateCustomerDue: (phone: string, name: string, amountPaid: number) => Promise<void>;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  addBlog: (blog: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateServiceStatus: (id: string, status: ServiceStatus, staffId?: string, staffName?: string) => Promise<void>;
  updateServiceRequest: (id: string, data: Partial<ServiceRequest>) => Promise<void>; 
  addServiceAd: (ad: ServiceAd) => Promise<void>;
  deleteServiceAd: (id: string) => Promise<void>;
  addStaff: (s: Staff) => Promise<void>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addReview: (review: StaffReview) => Promise<void>;
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
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'site', 'config'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
      const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        operationType,
        path,
        authInfo: {
          userId: auth?.currentUser?.uid,
        }
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
    };

    const unsubProducts = onSnapshot(collection(db, "products"), (s) => {
      const pList = s.docs.map(d => ({...d.data(), id: d.id})) as Product[];
      setProducts(pList);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "products"));
    
    const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("date", "desc")), (s) => setSales(s.docs.map(d => ({...d.data(), id: d.id})) as Sale[]), (err) => handleFirestoreError(err, OperationType.LIST, "sales"));
    const unsubCustomers = onSnapshot(collection(db, "customers"), (s) => setCustomers(s.docs.map(d => ({...d.data(), id: d.id})) as Customer[]), (err) => handleFirestoreError(err, OperationType.LIST, "customers"));
    const unsubUsers = onSnapshot(collection(db, "users"), (s) => setRegisteredUsers(s.docs.map(d => ({...d.data(), uid: d.id})) as CustomerUser[]), (err) => handleFirestoreError(err, OperationType.LIST, "users"));
    const unsubBlogs = onSnapshot(query(collection(db, "blogs"), orderBy("date", "desc")), (s) => setBlogs(s.docs.map(d => ({...d.data(), id: d.id})) as BlogPost[]), (err) => handleFirestoreError(err, OperationType.LIST, "blogs"));
    const unsubServiceRequests = onSnapshot(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")), (s) => setServiceRequests(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceRequest[]), (err) => handleFirestoreError(err, OperationType.LIST, "serviceRequests"));
    const unsubServiceAds = onSnapshot(collection(db, "serviceAds"), (s) => setServiceAds(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceAd[]), (err) => handleFirestoreError(err, OperationType.LIST, "serviceAds"));
    const unsubStaff = onSnapshot(collection(db, "staff"), (s) => setStaff(s.docs.map(d => ({...d.data(), id: d.id})) as Staff[]), (err) => handleFirestoreError(err, OperationType.LIST, "staff"));
    const unsubReviews = onSnapshot(collection(db, "staffReviews"), (s) => setReviews(s.docs.map(d => ({...d.data(), id: d.id})) as StaffReview[]), (err) => handleFirestoreError(err, OperationType.LIST, "staffReviews"));
    const unsubLogs = onSnapshot(query(collection(db, "stockLogs"), orderBy("date", "desc")), (s) => setStockLogs(s.docs.map(d => ({...d.data(), id: d.id})) as StockLog[]), (err) => handleFirestoreError(err, OperationType.LIST, "stockLogs"));
    const unsubSettings = onSnapshot(doc(db, "site", "config"), (d) => d.exists() && setSettings(d.data() as SiteSettings), (err) => handleFirestoreError(err, OperationType.GET, "site/config"));

    setLoading(false);
    return () => { 
      unsubProducts(); unsubSales(); unsubCustomers(); unsubUsers(); unsubBlogs(); 
      unsubServiceRequests(); unsubServiceAds(); unsubStaff(); unsubReviews(); unsubSettings(); unsubLogs();
    };
  }, []);

  const adjustStock = async (productId: string, change: number, reason: StockLog['reason']) => {
    try {
      await updateDoc(doc(db, "products", productId), { stock: increment(change) });
      
      const product = products.find(p => p.id === productId);
      await addDoc(collection(db, "stockLogs"), {
        productId,
        productName: product?.name || 'Unknown',
        change,
        reason,
        date: new Date().toISOString(),
        user: "System Admin"
      });
    } catch (e) {
      console.error("Adjust stock error:", e);
    }
  };

  const addProduct = async (p: Product) => {
    try {
      const id = p.id || 'GE-' + Math.floor(Math.random() * 900000 + 100000);
      const { id: _, ...data } = p;
      console.log("Adding product to Firestore:", id, data);
      await setDoc(doc(db, "products", id), { ...data, id }); 
      console.log("Product added successfully:", id);
      
      await addDoc(collection(db, "stockLogs"), {
        productId: id,
        productName: p.name,
        change: p.stock,
        reason: 'Purchase',
        date: new Date().toISOString(),
        user: "System Admin"
      });
    } catch (error) {
      console.error("Firestore addProduct Error:", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, p: Product) => {
    const { id: _, ...data } = p;
    await updateDoc(doc(db, "products", id), data as any);
  };

  const deleteProduct = async (id: string) => {
    if(confirm('Delete Product?')) await deleteDoc(doc(db, "products", id));
  };

  const recordSale = async (sale: Sale) => {
    try {
      const { id, ...data } = sale;
      console.log("Starting recordSale for ID:", id);
      
      // Sanitize data to remove undefined fields which Firestore doesn't like
      const sanitizedData = JSON.parse(JSON.stringify(data));
      
      console.log("Saving sale document...");
      await setDoc(doc(db, "sales", id), sanitizedData);
      console.log("Sale document saved.");
      
      // Stock adjustments are secondary
      for (const item of sale.items) {
        if (!item.manualItem) {
          adjustStock(item.productId, -item.quantity, 'Sale').catch(err => 
            console.error(`Failed to adjust stock for ${item.productId}:`, err)
          );
        }
      }

      if (sale.customerPhone) {
        console.log("Updating customer data for phone:", sale.customerPhone);
        const cRef = doc(db, "customers", sale.customerPhone);
        const cSnap = await getDoc(cRef);
        
        if (!cSnap.exists()) {
          console.log("Creating new customer...");
          await setDoc(cRef, { 
            name: sale.customerName || "Walking", 
            totalDue: sale.dueAmount, 
            lastUpdate: new Date().toISOString() 
          });
        } else {
          console.log("Updating existing customer...");
          await updateDoc(cRef, { 
            totalDue: increment(sale.dueAmount), 
            lastUpdate: new Date().toISOString() 
          });
        }
        console.log("Customer data updated.");
      }
      console.log("recordSale completed successfully.");
    } catch (error) {
      console.error("Firestore recordSale Error:", error);
      throw error;
    }
  };

  const addServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = 'SR-' + Date.now();
    const newRequest: ServiceRequest = { ...request, id, status: 'Pending', createdAt: new Date().toISOString() };
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

  const addStaff = async (s: Staff) => await setDoc(doc(db, "staff", s.id), s);
  const updateStaff = async (id: string, data: Partial<Staff>) => await updateDoc(doc(db, "staff", id), data);
  const deleteStaff = async (id: string) => await deleteDoc(doc(db, "staff", id));
  const addReview = async (review: StaffReview) => await setDoc(doc(db, "staffReviews", review.id), review);
  const addServiceAd = async (ad: ServiceAd) => await setDoc(doc(db, "serviceAds", ad.id), ad);
  const deleteServiceAd = async (id: string) => await deleteDoc(doc(db, "serviceAds", id));
  const updateSettings = async (newSettings: SiteSettings) => await setDoc(doc(db, "site", "config"), newSettings);
  const addBlog = async (b: BlogPost) => await setDoc(doc(db, "blogs", b.id), b);
  const deleteBlog = async (id: string) => await deleteDoc(doc(db, "blogs", id));
  const updateSaleStatus = async (id: string, status: OrderStatus) => await updateDoc(doc(db, "sales", id), { status });
  const updateSale = async (id: string, data: Partial<Sale>) => {
    const { id: _, ...updateData } = data;
    const sanitizedData = JSON.parse(JSON.stringify(updateData));
    await updateDoc(doc(db, "sales", id), sanitizedData);
  };
  const updateCustomerDue = async (phone: string, name: string, amount: number) => await updateDoc(doc(db, "customers", phone), { totalDue: increment(-amount), lastUpdate: new Date().toISOString() });

  return (
    <ProductContext.Provider value={{ 
      products, sales, customers, registeredUsers, blogs, settings, loading, 
      serviceRequests, serviceAds, staff, reviews, stockLogs,
      addProduct, updateProduct, deleteProduct, adjustStock, recordSale, 
      updateSaleStatus, updateSale, updateCustomerDue, updateSettings, addBlog, deleteBlog,
      addServiceRequest, updateServiceStatus, updateServiceRequest, addServiceAd, deleteServiceAd,
      addStaff, updateStaff, deleteStaff, addReview
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
