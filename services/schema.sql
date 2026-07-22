-- =====================================================================
-- Grameen Energy (গ্রামিন এনার্জি) - MySQL Database Schema
-- Use this schema to create tables in your cPanel phpMyAdmin
-- =====================================================================

-- 1. Users Table (Authentication for Customers, Technicians, Admins, POS users)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin and POS users if they don't exist
INSERT INTO users (phone, accountId, name, password, role)
VALUES 
('admin', 'admin', 'System Admin', 'admin123', 'admin'),
('posuser', 'posuser', 'POS Sales Assistant', 'pos123', 'pos')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Products Table (Inventory & Shop Items)
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
  specs TEXT, -- JSON stored as text
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Sales Table (Invoices / Orders)
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
  items TEXT, -- JSON stored as text
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customers Table (Due Ledger / General Register)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY, -- usually phone number
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  customerId VARCHAR(50),
  totalDue DECIMAL(10, 2) DEFAULT 0,
  lastPaymentDate VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Due Entries Table (Individual credit ledger transactions)
CREATE TABLE IF NOT EXISTS dueEntries (
  id VARCHAR(50) PRIMARY KEY,
  customerPhone VARCHAR(20),
  customerName VARCHAR(100),
  amount DECIMAL(10, 2),
  type VARCHAR(20), -- 'charge' or 'payment'
  note TEXT,
  date VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Service Requests Table (Repair & Technician Tickets)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
