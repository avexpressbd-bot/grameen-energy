import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool: mysql.Pool | null = null;
let isMySqlAvailable = true;

export function getDbPool(): mysql.Pool | null {
  if (!isMySqlAvailable) return null;
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || process.env.DB_HOST;
  const user = process.env.MYSQL_USER || process.env.DB_USER;
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.DB_DATABASE;
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306');

  if (!host || !user) {
    isMySqlAvailable = false;
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000 // Keep connection timeout low (3s) so dev sandbox doesn't hang long
    });
    console.log("✅ MySQL Pool initialized successfully.");
    return pool;
  } catch (error) {
    console.error("❌ Failed to create MySQL connection pool:", error);
    isMySqlAvailable = false;
    return null;
  }
}

// Automatically create database tables if they do not exist
export async function initializeMySqlTables() {
  const myPool = getDbPool();
  if (!myPool) return;

  try {
    console.log("🛠️ Checking and creating MySQL tables if not exists...");
    
    // 1. Users table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        phone VARCHAR(20) PRIMARY KEY,
        accountId VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        role VARCHAR(20) DEFAULT 'customer',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin and POS users
    await myPool.execute(`
      INSERT INTO users (phone, accountId, name, password, role)
      VALUES 
      ('admin', 'admin', 'System Admin', 'admin123', 'admin'),
      ('posuser', 'posuser', 'POS Sales Assistant', 'pos123', 'pos')
      ON DUPLICATE KEY UPDATE name=name
    `);

    // 2. Products table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        nameBn VARCHAR(255),
        category VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        discountPrice DECIMAL(10, 2),
        stock INT DEFAULT 0,
        warranty VARCHAR(100),
        description TEXT,
        descriptionBn TEXT,
        image VARCHAR(255),
        specs TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Sales/Orders table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(50) PRIMARY KEY,
        customerName VARCHAR(100),
        customerPhone VARCHAR(20),
        customerAddress TEXT,
        customerCity VARCHAR(100),
        subtotal DECIMAL(10, 2),
        discount DECIMAL(10, 2),
        total DECIMAL(10, 2),
        paidAmount DECIMAL(10, 2),
        dueAmount DECIMAL(10, 2),
        paymentMethod VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        date VARCHAR(50),
        items TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Customers ledger table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY, -- usually phone number
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        customerId VARCHAR(50),
        totalDue DECIMAL(10, 2) DEFAULT 0,
        lastPaymentDate VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Due Entries table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS dueEntries (
        id VARCHAR(50) PRIMARY KEY,
        customerPhone VARCHAR(20),
        customerName VARCHAR(100),
        amount DECIMAL(10, 2),
        type VARCHAR(20), -- 'charge' or 'payment'
        note TEXT,
        date VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Service Requests table
    await myPool.execute(`
      CREATE TABLE IF NOT EXISTS serviceRequests (
        id VARCHAR(50) PRIMARY KEY,
        customerName VARCHAR(100),
        customerPhone VARCHAR(20),
        productName VARCHAR(255),
        issue TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        cost DECIMAL(10, 2) DEFAULT 0,
        advance DECIMAL(10, 2) DEFAULT 0,
        assignedStaffId VARCHAR(50),
        assignedStaffName VARCHAR(100),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ MySQL tables verified/created successfully.");
  } catch (error) {
    console.error("❌ Error initializing MySQL tables. Falling back to JSON local file storage.", error);
    isMySqlAvailable = false;
    pool = null;
  }
}

// Simple JSON fallback database helper for development and testing
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'users_fallback.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

function readFallbackUsers(): any[] {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) {
      // Default users
      const defaultUsers = [
        {
          phone: 'admin',
          accountId: 'admin',
          name: 'System Admin',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          phone: 'posuser',
          accountId: 'posuser',
          name: 'POS Sales Assistant',
          password: 'pos123',
          role: 'pos',
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
    const data = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading fallback users:", e);
    return [];
  }
}

function writeFallbackUsers(users: any[]) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error writing fallback users:", e);
  }
}

// Unified Authenticated Database Actions (MySQL or Fallback JSON)
export async function dbGetUserByPhone(phone: string): Promise<any | null> {
  const myPool = getDbPool();
  if (myPool) {
    try {
      const [rows]: any = await myPool.execute('SELECT * FROM users WHERE phone = ?', [phone]);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error("MySQL: get user by phone error:", e);
    }
  }

  // Fallback
  const users = readFallbackUsers();
  return users.find(u => u.phone === phone) || null;
}

export async function dbGetUserByAccountId(accountId: string): Promise<any | null> {
  const myPool = getDbPool();
  if (myPool) {
    try {
      const [rows]: any = await myPool.execute('SELECT * FROM users WHERE accountId = ?', [accountId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error("MySQL: get user by accountId error:", e);
    }
  }

  // Fallback
  const users = readFallbackUsers();
  return users.find(u => u.accountId === accountId) || null;
}

export async function dbGetUserByEmail(email: string): Promise<any | null> {
  const myPool = getDbPool();
  if (myPool) {
    try {
      const [rows]: any = await myPool.execute('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error("MySQL: get user by email error:", e);
    }
  }

  // Fallback
  const users = readFallbackUsers();
  return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function dbCreateUser(user: any): Promise<boolean> {
  const myPool = getDbPool();
  if (myPool) {
    try {
      await myPool.execute(
        'INSERT INTO users (phone, accountId, name, password, email, address, city, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user.phone,
          user.accountId,
          user.name,
          user.password,
          user.email || null,
          user.address || null,
          user.city || null,
          user.role || 'customer',
          user.createdAt || new Date().toISOString()
        ]
      );
      return true;
    } catch (e) {
      console.error("MySQL: create user error. Falling back to local storage...", e);
      isMySqlAvailable = false;
      pool = null;
    }
  }

  // Fallback
  const users = readFallbackUsers();
  const exists = users.some(u => u.phone === user.phone);
  if (exists) throw new Error('This phone number is already registered.');
  users.push(user);
  writeFallbackUsers(users);
  return true;
}

export async function dbUpdateUser(phone: string, updateData: any): Promise<boolean> {
  const myPool = getDbPool();
  if (myPool) {
    try {
      const fields = Object.keys(updateData);
      if (fields.length === 0) return true;
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => updateData[f]);
      await myPool.execute(`UPDATE users SET ${setClause} WHERE phone = ?`, [...values, phone]);
      return true;
    } catch (e) {
      console.error("MySQL: update user error. Falling back to local storage...", e);
      isMySqlAvailable = false;
      pool = null;
    }
  }

  // Fallback
  const users = readFallbackUsers();
  const idx = users.findIndex(u => u.phone === phone);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updateData };
    writeFallbackUsers(users);
    return true;
  }
  return false;
}
