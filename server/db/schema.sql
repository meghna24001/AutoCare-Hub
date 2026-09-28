-- AutoCare Hub SQLite Database Schema
-- Preserves and expands the C++ Vehicle Service Management System

PRAGMA foreign_keys = ON;

-- 1. Customers Table (C++ Customer: ID, Name, Address, Mobile, Email)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL,
    mobile_number TEXT NOT NULL UNIQUE,
    email_address TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 2. Vehicles Table (C++ Vehicle: ID, Customer ID, RegNo, Model, Make, Year, Fuel)
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    status TEXT DEFAULT 'Idle',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

-- 3. Mechanics Table (C++ Mechanic ID enhanced with full technician profile)
CREATE TABLE IF NOT EXISTS mechanics (
    mechanic_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    specialization TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    rating REAL DEFAULT 4.8,
    experience_years INTEGER DEFAULT 5,
    completed_jobs_count INTEGER DEFAULT 0
);

-- 4. Workshop Service Bays Table (Smart workshop feature: Bays 1 to 8)
CREATE TABLE IF NOT EXISTS service_bays (
    bay_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    current_vehicle_id INTEGER,
    current_service_id INTEGER,
    assigned_mechanic_id INTEGER,
    occupied_since TEXT,
    FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE SET NULL
);

-- 5. Service Jobs Table (C++ Service: ID, Customer, Vehicle, Mechanic, Date, Type, Labour, Parts, Total)
CREATE TABLE IF NOT EXISTS service_jobs (
    service_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    mechanic_id INTEGER NOT NULL,
    service_date TEXT NOT NULL,
    expected_delivery_date TEXT,
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'Checked In',
    priority TEXT DEFAULT 'Normal',
    labour_charges REAL NOT NULL DEFAULT 0.0,
    spare_parts_cost REAL NOT NULL DEFAULT 0.0,
    discount REAL DEFAULT 0.0,
    tax REAL DEFAULT 0.0,
    total_bill_amount REAL NOT NULL,
    notes TEXT DEFAULT '',
    bay_id INTEGER,
    checklist_json TEXT DEFAULT '[]',
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE RESTRICT,
    FOREIGN KEY (bay_id) REFERENCES service_bays(bay_id) ON DELETE SET NULL
);

-- 6. Invoices Table (Automotive Tax Invoice & Billing)
CREATE TABLE IF NOT EXISTS invoices (
    invoice_number TEXT PRIMARY KEY,
    service_id INTEGER NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    invoice_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    labour_charges REAL NOT NULL,
    spare_parts_cost REAL NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    paid_amount REAL DEFAULT 0.0,
    payment_status TEXT DEFAULT 'Pending',
    payment_method TEXT DEFAULT '',
    paid_at TEXT,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (service_id) REFERENCES service_jobs(service_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT
);

-- 7. Payment Transactions Log Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_reference TEXT DEFAULT '',
    paid_at TEXT DEFAULT (datetime('now', 'localtime')),
    notes TEXT DEFAULT '',
    FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
);

-- Indices for rapid searches on registration plates, phone, and invoice numbers
CREATE INDEX IF NOT EXISTS idx_vehicles_reg ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_services_status ON service_jobs(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
