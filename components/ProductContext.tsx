
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale, Customer, SiteSettings, BlogPost, OrderStatus, CustomerUser, ServiceRequest, ServiceAd, ServiceStatus, Staff, StaffReview, StockLog, DueEntry } from '../types';
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
  dueEntries: DueEntry[];
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
  addDueEntry: (entry: Omit<DueEntry, 'id'>) => Promise<void>;
  updateDueEntry: (id: string, data: Partial<DueEntry>) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [dueEntries, setDueEntries] = useState<DueEntry[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'site', 'config'));
        console.log("Firestore Connected Successfully.");
      } catch (error: any) {
        console.error("Firestore Connection Error:", error.message);
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
      
      if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
        alert(`ফায়ারবেস পারমিশন এরর (${operationType} on ${path})। দয়া করে ফায়ারবেস কনসোলে Rules আপডেট করুন।`);
      }
    };

    const unsubProducts = onSnapshot(collection(db, "products"), (s) => {
      console.log(`[Snapshot] products collection updated. Count: ${s.docs.length}`);
      const pList = s.docs.map(d => {
        const data = d.data();
        return {...data, id: d.id};
      }) as Product[];
      console.log("[Snapshot] Mapped products:", pList);
      setProducts(pList);
    }, (err) => {
      console.error("Products Snapshot Error:", err);
      handleFirestoreError(err, OperationType.LIST, "products");
    });
    
    const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("date", "desc")), (s) => setSales(s.docs.map(d => ({...d.data(), id: d.id})) as Sale[]), (err) => handleFirestoreError(err, OperationType.LIST, "sales"));
    const unsubCustomers = onSnapshot(collection(db, "customers"), (s) => setCustomers(s.docs.map(d => ({...d.data(), id: d.id})) as Customer[]), (err) => handleFirestoreError(err, OperationType.LIST, "customers"));
    const unsubUsers = onSnapshot(collection(db, "users"), (s) => setRegisteredUsers(s.docs.map(d => ({...d.data(), uid: d.id})) as CustomerUser[]), (err) => handleFirestoreError(err, OperationType.LIST, "users"));
    const unsubBlogs = onSnapshot(query(collection(db, "blogs"), orderBy("date", "desc")), (s) => setBlogs(s.docs.map(d => ({...d.data(), id: d.id})) as BlogPost[]), (err) => handleFirestoreError(err, OperationType.LIST, "blogs"));
    const unsubServiceRequests = onSnapshot(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")), (s) => setServiceRequests(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceRequest[]), (err) => handleFirestoreError(err, OperationType.LIST, "serviceRequests"));
    const unsubServiceAds = onSnapshot(collection(db, "serviceAds"), (s) => setServiceAds(s.docs.map(d => ({...d.data(), id: d.id})) as ServiceAd[]), (err) => handleFirestoreError(err, OperationType.LIST, "serviceAds"));
    const unsubStaff = onSnapshot(collection(db, "staff"), (s) => setStaff(s.docs.map(d => ({...d.data(), id: d.id})) as Staff[]), (err) => handleFirestoreError(err, OperationType.LIST, "staff"));
    const unsubReviews = onSnapshot(collection(db, "staffReviews"), (s) => setReviews(s.docs.map(d => ({...d.data(), id: d.id})) as StaffReview[]), (err) => handleFirestoreError(err, OperationType.LIST, "staffReviews"));
    const unsubLogs = onSnapshot(query(collection(db, "stockLogs"), orderBy("date", "desc")), (s) => setStockLogs(s.docs.map(d => ({...d.data(), id: d.id})) as StockLog[]), (err) => handleFirestoreError(err, OperationType.LIST, "stockLogs"));
    const unsubDueEntries = onSnapshot(query(collection(db, "dueEntries"), orderBy("date", "desc")), (s) => setDueEntries(s.docs.map(d => ({...d.data(), id: d.id})) as DueEntry[]), (err) => handleFirestoreError(err, OperationType.LIST, "dueEntries"));
    const unsubSettings = onSnapshot(doc(db, "site", "config"), (d) => {
      if (d.exists()) setSettings(d.data() as SiteSettings);
    }, (err) => handleFirestoreError(err, OperationType.GET, "site/config"));

    setLoading(false);
    return () => { 
      unsubProducts(); unsubSales(); unsubCustomers(); unsubUsers(); unsubBlogs(); 
      unsubServiceRequests(); unsubServiceAds(); unsubStaff(); unsubReviews(); unsubSettings(); unsubLogs(); unsubDueEntries();
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
    console.log("addProduct called with:", p);
    try {
      const id = 'GE-' + Math.floor(Math.random() * 900000 + 100000);
      
      // Ensure all required fields have values
      const productData = {
        name: p.name || 'Unnamed Product',
        nameBn: p.nameBn || p.name || 'নামহীন পণ্য',
        category: p.category || 'Other',
        price: Number(p.price) || 0,
        purchasePrice: Number(p.purchasePrice) || 0,
        stock: Number(p.stock) || 0,
        minStockLevel: Number(p.minStockLevel) || 5,
        sku: p.sku || 'SKU-' + id,
        barcode: p.barcode || id,
        image: p.image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400',
        images: p.images || [],
        description: p.description || '',
        descriptionBn: p.descriptionBn || '',
        specs: p.specs || {},
        isBestSeller: !!p.isBestSeller,
        isBanner: !!p.isBanner,
        id: id
      };
      
      const dataSize = JSON.stringify(productData).length;
      console.log(`[Firestore] Product data size: ${Math.round(dataSize / 1024)}KB`);
      
      if (dataSize > 1000000) {
        const errorMsg = "প্রোডাক্টের ডাটা অনেক বড় (১ মেগাবাইটের বেশি)। দয়া করে কম ছবি ব্যবহার করুন বা ছবির সাইজ ছোট করুন।";
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      console.log("Attempting to save to Firestore. Path: products/", id);
      await setDoc(doc(db, "products", id), productData); 
      console.log("SUCCESS: Product saved to Firestore.");
      
      alert("প্রোডাক্টটি সফলভাবে সেভ হয়েছে!");
      
      await addDoc(collection(db, "stockLogs"), {
        productId: id,
        productName: productData.name,
        change: productData.stock,
        reason: 'Purchase',
        date: new Date().toISOString(),
        user: "System Admin"
      });
      console.log("SUCCESS: Stock log created.");
    } catch (error: any) {
      console.error("CRITICAL ERROR in addProduct:", error);
      alert("প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: " + error.message);
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

        if (sale.dueAmount > 0) {
          console.log("Automatically adding to Due Ledger...");
          const productDetails = sale.items.map(item => `${item.name} (${item.quantity})`).join(', ');
          await addDoc(collection(db, "dueEntries"), {
            customerName: sale.customerName,
            customerPhone: sale.customerPhone,
            productDetails,
            date: new Date().toISOString(),
            totalAmount: sale.total,
            paidAmount: sale.paidAmount,
            dueAmount: sale.dueAmount,
            saleId: id,
            isSettled: false
          });
        }
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
  const updateCustomerDue = async (phone: string, name: string, amount: number) => {
    try {
      // 1. Decrement customer totalDue
      await updateDoc(doc(db, "customers", phone), { totalDue: increment(-amount), lastUpdate: new Date().toISOString() });
      
      // 2. Fetch all outstanding due entries for this customer (sorted oldest to newest)
      const q = query(
        collection(db, "dueEntries"),
        orderBy("date", "asc")
      );
      const querySnapshot = await getDocs(q);
      
      let remainingPayment = amount;
      for (const docSnap of querySnapshot.docs) {
        if (remainingPayment <= 0) break;
        const entry = docSnap.data() as DueEntry;
        
        // Filter: same customer, has outstanding due, and is a real purchase (totalAmount > 0)
        if (entry.customerPhone === phone && entry.dueAmount > 0 && entry.totalAmount > 0) {
          const allocated = Math.min(entry.dueAmount, remainingPayment);
          const newPaidAmount = (entry.paidAmount || 0) + allocated;
          const newDueAmount = entry.dueAmount - allocated;
          const isSettled = newDueAmount <= 0;
          
          await updateDoc(docSnap.ref, {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            isSettled: isSettled
          });
          
          remainingPayment -= allocated;
        }
      }

      // 3. Add a payment record with dueAmount = 0 (so it doesn't double-count in totalDue math)
      await addDoc(collection(db, "dueEntries"), {
        customerName: name,
        customerPhone: phone,
        productDetails: 'Payment Collection (পেমেন্ট সংগ্রহ)',
        date: new Date().toISOString(),
        totalAmount: 0,
        paidAmount: amount,
        dueAmount: 0,
        note: 'Manual collection',
        isSettled: true,
        isPayment: true
      });
    } catch (error) {
      console.error("Error in updateCustomerDue:", error);
      throw error;
    }
  };

  const addDueEntry = async (entry: Omit<DueEntry, 'id'>) => {
    const id = 'DUE-' + Date.now();
    await setDoc(doc(db, "dueEntries", id), { ...entry, id });
    
    // Also update customer total
    const cRef = doc(db, "customers", entry.customerPhone);
    const cSnap = await getDoc(cRef);
    if (!cSnap.exists()) {
      await setDoc(cRef, { 
        name: entry.customerName, 
        totalDue: entry.dueAmount, 
        lastUpdate: new Date().toISOString() 
      });
    } else {
      await updateDoc(cRef, { 
        totalDue: increment(entry.dueAmount), 
        lastUpdate: new Date().toISOString() 
      });
    }
  };

  const updateDueEntry = async (id: string, data: Partial<DueEntry>) => {
    try {
      const entryRef = doc(db, "dueEntries", id);
      const entrySnap = await getDoc(entryRef);
      if (entrySnap.exists()) {
        const oldEntry = entrySnap.data() as DueEntry;
        const isPayment = oldEntry.isPayment || oldEntry.productDetails.includes('Payment Collection') || oldEntry.totalAmount === 0;

        if (isPayment) {
          const oldPaid = oldEntry.paidAmount || 0;
          const newPaid = data.paidAmount !== undefined ? data.paidAmount : oldPaid;
          const oldPhone = oldEntry.customerPhone;
          const newPhone = data.customerPhone || oldPhone;
          const newName = data.customerName || oldEntry.customerName;

          // Force dueAmount to 0 for payment collection logs to prevent double counting
          data.dueAmount = 0;
          data.isPayment = true;

          await updateDoc(entryRef, data as any);

          if (oldPhone === newPhone) {
            const diffPaid = newPaid - oldPaid;
            if (diffPaid !== 0) {
              const cRef = doc(db, "customers", newPhone);
              await updateDoc(cRef, {
                totalDue: increment(-diffPaid),
                lastUpdate: new Date().toISOString()
              });
            }
          } else {
            // Customer changed for this payment entry
            // 1. Restore old customer's due (add back the old paid amount)
            const oldCRef = doc(db, "customers", oldPhone);
            await updateDoc(oldCRef, {
              totalDue: increment(oldPaid),
              lastUpdate: new Date().toISOString()
            });

            // 2. Subtract the payment amount from the new customer's due
            const newCRef = doc(db, "customers", newPhone);
            const newCSnap = await getDoc(newCRef);
            if (!newCSnap.exists()) {
              await setDoc(newCRef, {
                name: newName,
                totalDue: -newPaid,
                lastUpdate: new Date().toISOString()
              });
            } else {
              await updateDoc(newCRef, {
                totalDue: increment(-newPaid),
                lastUpdate: new Date().toISOString()
              });
            }
          }
        } else {
          // Real purchase entry
          const oldDue = oldEntry.dueAmount || 0;
          const oldPhone = oldEntry.customerPhone;
          
          const newDue = data.dueAmount !== undefined ? data.dueAmount : oldDue;
          const newPhone = data.customerPhone || oldPhone;
          const newName = data.customerName || oldEntry.customerName;

          // Perform the update
          await updateDoc(entryRef, data as any);

          if (oldPhone === newPhone) {
            // Same customer, update by difference (newDue - oldDue)
            const diff = newDue - oldDue;
            if (diff !== 0) {
              const cRef = doc(db, "customers", newPhone);
              await updateDoc(cRef, {
                totalDue: increment(diff),
                lastUpdate: new Date().toISOString()
              });
            }
          } else {
            // Customer changed!
            // Decrement old customer
            const oldCRef = doc(db, "customers", oldPhone);
            await updateDoc(oldCRef, {
              totalDue: increment(-oldDue),
              lastUpdate: new Date().toISOString()
            });

            // Increment new customer
            const newCRef = doc(db, "customers", newPhone);
            const newCSnap = await getDoc(newCRef);
            if (!newCSnap.exists()) {
              await setDoc(newCRef, {
                name: newName,
                totalDue: newDue,
                lastUpdate: new Date().toISOString()
              });
            } else {
              await updateDoc(newCRef, {
                totalDue: increment(newDue),
                lastUpdate: new Date().toISOString()
              });
            }
          }
        }
      } else {
        await updateDoc(entryRef, data as any);
      }
    } catch (err) {
      console.error("Error updating due entry and sync customer:", err);
      await updateDoc(doc(db, "dueEntries", id), data as any).catch(e => console.error(e));
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      console.log("Manual refresh triggered...");
      const s = await getDocs(collection(db, "products"));
      console.log(`Manual fetch: Found ${s.docs.length} products.`);
      setProducts(s.docs.map(d => ({...d.data(), id: d.id})) as Product[]);
      setLoading(false);
      alert(`ডাটাবেজ থেকে ${s.docs.length}টি প্রোডাক্ট পাওয়া গেছে।`);
    } catch (e: any) {
      console.error("Manual refresh error:", e);
      alert("রিফ্রেশ করতে সমস্যা হয়েছে: " + e.message);
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, sales, customers, registeredUsers, blogs, settings, loading, 
      serviceRequests, serviceAds, staff, reviews, stockLogs, dueEntries,
      addProduct, updateProduct, deleteProduct, adjustStock, recordSale, 
      updateSaleStatus, updateSale, updateCustomerDue, updateSettings, addBlog, deleteBlog,
      addServiceRequest, updateServiceStatus, updateServiceRequest, addServiceAd, deleteServiceAd,
      addStaff, updateStaff, deleteStaff, addReview, addDueEntry, updateDueEntry, refreshData
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
