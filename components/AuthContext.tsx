
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: CustomerUser | null;
  staffRole: 'admin' | 'pos' | null;
  login: (id: string, password: string) => Promise<'admin' | 'pos' | 'customer' | 'technician' | false>;
  register: (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string, role?: 'customer' | 'technician') => Promise<boolean>;
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

  const login = async (id: string, password: string): Promise<'admin' | 'pos' | 'customer' | 'technician' | false> => {
    const inputId = id.trim().toLowerCase();

    // 1. Check Hardcoded Staff Roles
    if (inputId === 'admin' && password === 'admin123') {
      setStaffRole('admin');
      localStorage.setItem('ge_staff_role', 'admin');
      return 'admin';
    }
    
    if (inputId === 'posuser' && password === 'pos123') {
      setStaffRole('pos');
      localStorage.setItem('ge_staff_role', 'pos');
      return 'pos';
    }

    // 2. Try to find user by Phone (Document ID)
    let userDoc = await getDoc(doc(db, 'users', id));
    let userData = userDoc.exists() ? userDoc.data() : null;

    // 3. If not found by phone, try to find by Account ID or Email
    if (!userData) {
      // Check by accountId
      const qAcc = query(collection(db, 'users'), where('accountId', '==', id));
      const qAccSnap = await getDocs(qAcc);
      
      if (!qAccSnap.empty) {
        userData = qAccSnap.docs[0].data();
        id = qAccSnap.docs[0].id;
      } else {
        // Check by email
        const qEmail = query(collection(db, 'users'), where('email', '==', inputId));
        const qEmailSnap = await getDocs(qEmail);
        if (!qEmailSnap.empty) {
          userData = qEmailSnap.docs[0].data();
          id = qEmailSnap.docs[0].id;
        }
      }
    }

    if (userData && userData.password === password) {
      const customer: CustomerUser = {
        uid: id,
        accountId: userData.accountId,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        address: userData.address,
        city: userData.city,
        role: userData.role || 'customer',
        createdAt: userData.createdAt
      };
      setUser(customer);
      localStorage.setItem('ge_customer_user', JSON.stringify(customer));
      return customer.role === 'technician' ? 'technician' : 'customer';
    }
    
    return false;
  };

  const register = async (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string, role: 'customer' | 'technician' = 'customer') => {
    const userRef = doc(db, 'users', userData.phone);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      throw new Error('This phone number is already registered.');
    }

    // Also check if email is already taken
    if (userData.email) {
      const qEmail = query(collection(db, 'users'), where('email', '==', userData.email.toLowerCase()));
      const qEmailSnap = await getDocs(qEmail);
      if (!qEmailSnap.empty) {
        throw new Error('This email is already registered.');
      }
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const accountId = role === 'technician' ? `GE-T-${randomSuffix}` : `GE-C-${randomSuffix}`;

    const newUserDoc = {
      ...userData,
      email: userData.email?.toLowerCase(),
      accountId,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, newUserDoc);
    
    const customer: CustomerUser = {
      uid: userData.phone,
      accountId,
      ...userData,
      email: userData.email?.toLowerCase(),
      role,
      createdAt: newUserDoc.createdAt
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
