
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Sale } from '../types';
import { products as initialProducts } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  recordSale: (sale: Sale) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ge_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ge_sales');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ge_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ge_sales', JSON.stringify(sales));
  }, [sales]);

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const recordSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
    // Auto-deduct stock
    setProducts(prevProducts => prevProducts.map(p => {
      const soldItem = sale.items.find(item => item.productId === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
  };

  return (
    <ProductContext.Provider value={{ products, sales, addProduct, updateProduct, deleteProduct, recordSale }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
