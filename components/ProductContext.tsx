import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale } from '../types';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy
} from "firebase/firestore";

interface ProductContextType {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordSale: (sale: Sale) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে রিয়েল-টাইমে প্রোডাক্ট এবং সেলস লোড করা
  useEffect(() => {
    if (!db) return;

    const qProducts = query(collection(db, "products"));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Product[];
      setProducts(productData);
      setLoading(false);
    });

    const qSales = query(collection(db, "sales"), orderBy("date", "desc"));
    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Sale[];
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
      // যদি ম্যানুয়াল আইডি থাকে তবে setDoc ব্যবহার করা ভালো
      await setDoc(doc(db, "products", id), data);
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("পণ্য যোগ করতে সমস্যা হয়েছে।");
    }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    try {
      const productRef = doc(db, "products", id);
      const { id: _, ...data } = updatedProduct;
      await updateDoc(productRef, data as any);
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পণ্যটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const recordSale = async (sale: Sale) => {
    try {
      // ১. সেলস রেকর্ড সেভ করা
      const { id, ...saleData } = sale;
      await setDoc(doc(db, "sales", id), saleData);

      // ২. স্টক আপডেট করা
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(db, "products", product.id);
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateDoc(productRef, { stock: newStock });
        }
      }
    } catch (error) {
      console.error("Error recording sale: ", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, sales, loading, addProduct, updateProduct, deleteProduct, recordSale }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};