import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale } from '../types';
import { db } from '../services/firebase';
import { products as mockProducts } from '../data/mockData';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy,
  getDocs
} from "firebase/firestore";

interface ProductContextType {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordSale: (sale: Sale) => Promise<void>;
  syncWithFirebase: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const syncWithFirebase = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      if (snapshot.empty) {
        console.log("No data in Firestore. Seeding...");
        for (const p of mockProducts) {
          const { id, ...data } = p;
          await setDoc(doc(db, "products", id), data);
        }
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    syncWithFirebase();

    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
      setProducts(productData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    const qSales = query(collection(db, "sales"), orderBy("date", "desc"));
    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[];
      setSales(salesData);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, []);

  const addProduct = async (newProduct: Product) => {
    try {
      const { id, ...data } = newProduct;
      await setDoc(doc(db, "products", id), data);
    } catch (error) { console.error(error); }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    try {
      const { id: _, ...data } = updatedProduct;
      await updateDoc(doc(db, "products", id), data as any);
    } catch (error) { console.error(error); }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('ডিলিট করতে নিশ্চিত?')) {
      try { await deleteDoc(doc(db, "products", id)); } catch (error) { console.error(error); }
    }
  };

  const recordSale = async (sale: Sale) => {
    try {
      const { id, ...saleData } = sale;
      await setDoc(doc(db, "sales", id), saleData);
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateDoc(doc(db, "products", product.id), { stock: Math.max(0, product.stock - item.quantity) });
        }
      }
    } catch (error) { console.error(error); }
  };

  return (
    <ProductContext.Provider value={{ products, sales, loading, addProduct, updateProduct, deleteProduct, recordSale, syncWithFirebase }}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-bold">লোড হচ্ছে...</p>
        </div>
      ) : children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};