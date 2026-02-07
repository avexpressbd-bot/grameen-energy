
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: CustomerUser | null;
  staffRole: 'admin' | 'pos' | null;
  login: (id: string, password: string) => Promise<'admin' | 'pos' | 'customer' | false>;
  register: (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [staffRole, setStaffRole] = useState<'admin' | 'pos' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ge_customer_user');
    const savedStaff = localStorage.getItem('ge_staff_role');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStaff) setStaffRole(savedStaff as 'admin' | 'pos');
    
    setLoading(false);
  }, []);

  const login = async (id: string, password: string): Promise<'admin' | 'pos' | 'customer' | false> => {
    // 1. Check Hardcoded Staff Credentials
    if (id === 'admin' && password === 'admin123') {
      setStaffRole('admin');
      localStorage.setItem('ge_staff_role', 'admin');
      return 'admin';
    }
    
    if (id === 'posuser' && password === 'pos123') {
      setStaffRole('pos');
      localStorage.setItem('ge_staff_role', 'pos');
      return 'pos';
    }

    // 2. Check Customer Credentials in Firestore
    const userDoc = await getDoc(doc(db, 'users', id));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.password === password) {
        const customer: CustomerUser = {
          uid: id,
          accountId: data.accountId,
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          createdAt: data.createdAt
        };
        setUser(customer);
        localStorage.setItem('ge_customer_user', JSON.stringify(customer));
        return 'customer';
      }
    }
    return false;
  };

  const register = async (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string) => {
    const userRef = doc(db, 'users', userData.phone);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      throw new Error('User already exists');
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const accountId = `GE-C-${randomSuffix}`;

    const newUser = {
      ...userData,
      accountId,
      password,
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, newUser);
    
    const customer: CustomerUser = {
      uid: userData.phone,
      accountId,
      ...userData,
      createdAt: newUser.createdAt
    };
    
    setUser(customer);
    localStorage.setItem('ge_customer_user', JSON.stringify(customer));
    return true;
  };

  const logout = () => {
    setUser(null);
    setStaffRole(null);
    localStorage.removeItem('ge_customer_user');
    localStorage.removeItem('ge_staff_role');
  };

  const updateProfile = async (data: Partial<CustomerUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await setDoc(doc(db, 'users', user.phone), data, { merge: true });
    setUser(updated);
    localStorage.setItem('ge_customer_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, staffRole, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
