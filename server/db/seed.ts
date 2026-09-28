import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeScript, queryOne, executeRun } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeAndSeedDatabase(): Promise<void> {
  // Read and execute schema
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await executeScript(schemaSql);

  // Check if customers table is empty
  const customerCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM customers');

  if (!customerCount || customerCount.count === 0) {
    console.log('Seeding initial Indian workshop records into SQLite database...');

    // 1. Seed Customers
    const customers = [
      [101, 'Rahul Sharma', '402 Windsor Tower, Andheri West, Mumbai, MH 400053', '9820145678', 'rahul.sharma@gmail.com', '2025-11-10'],
      [102, 'Priya Mukherjee', '14B Salt Lake Sector V, Bidhannagar, Kolkata, WB 700091', '9830219876', 'priya.m@outlook.com', '2025-12-04'],
      [103, 'Amit Verma', 'Penthouse 8, Sector 54, Golf Course Road, Gurugram, HR 122002', '9811054321', 'amit.verma@techcorp.in', '2026-01-15'],
      [104, 'Sneha Reddy', 'Plot 72, Jubilee Hills Road No. 36, Hyderabad, TS 500033', '9849033445', 'sneha.reddy@gmail.com', '2026-02-18'],
      [105, 'Vikram Singhania', 'Villa 19, Indiranagar 100ft Road, Bengaluru, KA 560038', '9900122334', 'vikram.s@singhania.co', '2026-03-01'],
      [106, 'Ananya Deshmukh', 'Flat 301, Koregaon Park Lane 7, Pune, MH 411001', '9765412345', 'ananya.d@gmail.com', '2026-04-12'],
      [107, 'Gurpreet Singh', 'House 52, Sector 9-C, Chandigarh, CH 160009', '9876543210', 'gurpreet.singh@gmail.com', '2026-05-20'],
      [108, 'Karthik Subramanian', '28 Besant Nagar 4th Avenue, Chennai, TN 600090', '9840198765', 'karthik.sub@gmail.com', '2026-06-11'],
    ];

    for (const c of customers) {
      await executeRun(
        'INSERT INTO customers (customer_id, customer_name, address, mobile_number, email_address, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        c
      );
    }

    // 2. Seed Mechanics
    const mechanics = [
      [301, 'Arjun Sharma', '9820011223', 'arjun.s@autocarehub.com', 'Engine Overhaul & Diesel Powertrain', 'Busy', 4.9, 12, 142],
      [302, 'Rajesh Kumar', '9830022334', 'rajesh.k@autocarehub.com', 'Automotive Electrical & EV Systems', 'Busy', 4.8, 9, 118],
      [303, 'Vikram Patel', '9810033445', 'vikram.p@autocarehub.com', 'Suspension, Brakes & Alignment', 'Busy', 4.7, 11, 165],
      [304, 'Sunil Verma', '9840044556', 'sunil.v@autocarehub.com', 'Body Shop, Paint & Detailing', 'Available', 4.8, 7, 94],
      [305, 'Deepak Rao', '9850055667', 'deepak.r@autocarehub.com', 'Periodic Maintenance & Quick Lube', 'Busy', 4.9, 6, 210],
    ];

    for (const m of mechanics) {
      await executeRun(
        'INSERT INTO mechanics (mechanic_id, name, phone, email, specialization, status, rating, experience_years, completed_jobs_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        m
      );
    }

    // 3. Seed Vehicles
    const vehicles = [
      [201, 101, 'MH 02 AB 1234', 'Innova Crysta 2.4 ZX', 'Toyota', 2022, 'Diesel', 'Ready for Pickup'],
      [202, 101, 'MH 02 CD 5678', 'Creta SX (O) Turbo', 'Hyundai', 2023, 'Petrol', 'Idle'],
      [203, 102, 'WB 12 AB 9876', 'Nexon EV Empowered', 'Tata', 2024, 'Electric', 'In Service'],
      [204, 103, 'DL 08 CK 4589', 'XUV700 AX7 L AWD', 'Mahindra', 2023, 'Diesel', 'Waiting Parts'],
      [205, 103, 'DL 03 PQ 1122', 'Brezza ZXi Plus', 'Maruti Suzuki', 2021, 'Petrol', 'Idle'],
      [206, 104, 'TS 09 EA 4455', 'Seltos GTX Plus', 'Kia', 2023, 'Petrol', 'Inspection'],
      [207, 105, 'KA 05 MN 3210', 'City ZX i-VTEC', 'Honda', 2020, 'Petrol', 'Ready for Pickup'],
      [208, 106, 'MH 12 GH 7788', 'Taigun GT Plus', 'Volkswagen', 2022, 'Petrol', 'Idle'],
      [209, 107, 'CH 01 BK 6655', 'Hector Sharp Pro', 'MG', 2021, 'Diesel', 'Idle'],
      [210, 108, 'TN 07 BJ 3344', 'Ertiga ZXi CNG', 'Maruti Suzuki', 2022, 'CNG', 'In Service'],
    ];

    for (const v of vehicles) {
      await executeRun(
        'INSERT INTO vehicles (vehicle_id, customer_id, registration_number, model, manufacturer, year_of_manufacture, fuel_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        v
      );
    }

    // 4. Seed Service Bays
    const bays = [
      [1, 'Bay 1 - Heavy Lift', 'Two-Post Lift', 'Occupied', 201, 501, 301, 'Today, 09:30 AM'],
      [2, 'Bay 2 - Suspension & Strut', 'Two-Post Lift', 'Occupied', 204, 503, 303, 'Yesterday, 02:00 PM'],
      [3, 'Bay 3 - EV & Electrical Lab', 'Diagnostic Bay', 'Occupied', 203, 502, 302, 'Today, 10:15 AM'],
      [4, 'Bay 4 - Powertrain Diagnostics', 'Diagnostic Bay', 'Occupied', 206, 504, 301, 'Today, 11:45 AM'],
      [5, 'Bay 5 - Express Lube Pit', 'Quick Lube', 'Occupied', 207, 505, 305, 'Today, 02:30 PM'],
      [6, 'Bay 6 - Multi-Fuel & Alignment', 'Wheel Alignment', 'Occupied', 210, 506, 303, 'Today, 01:15 PM'],
      [7, 'Bay 7 - Paint & Body Booth', 'Two-Post Lift', 'Available', null, null, null, null],
      [8, 'Bay 8 - Detailing & Washing', 'Washing & Detailing', 'Available', null, null, null, null],
    ];

    for (const b of bays) {
      await executeRun(
        'INSERT INTO service_bays (bay_id, name, type, status, current_vehicle_id, current_service_id, assigned_mechanic_id, occupied_since) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        b
      );
    }

    // 5. Seed Services (Preserving C++ total calculation: labour + spareParts)
    const services = [
      [
        501, 101, 201, 301, '2026-09-21', '2026-09-21',
        'Full Periodic Service (40,000 KM)', 'Ready for Pickup', 'High',
        3500.0, 5200.0, 200.0, 1530.0, 8700.0,
        'Engine oil flushed, synthetic 5W-30 replaced, diesel fuel filter changed, brake pads cleaned.',
        1, JSON.stringify([
          { item: 'Engine Oil & Filter Change', done: true },
          { item: 'Air Filter Replacement', done: true },
          { item: 'Brake Fluid & Pad Inspection', done: true },
          { item: 'Suspension Bushing Check', done: true },
          { item: 'Washing & Vacuuming', done: true }
        ]), '2026-09-21 16:30'
      ],
      [
        502, 102, 203, 302, '2026-09-21', '2026-09-22',
        'EV High-Voltage Health Check & AC Servicing', 'In Progress', 'Normal',
        2800.0, 1450.0, 0.0, 765.0, 4250.0,
        'Diagnostic scanning for battery pack thermal management, AC condenser coil cleansing.',
        3, JSON.stringify([
          { item: 'High-Voltage Battery Pack State of Health', done: true },
          { item: 'Coolant Loop Pressure Test', done: true },
          { item: 'AC Cabin Filter Replacement', done: false },
          { item: 'Firmware & ECU Diagnostic Read', done: true },
          { item: 'Regenerative Braking Calibration', done: false }
        ]), null
      ],
      [
        503, 103, 204, 303, '2026-09-20', '2026-09-23',
        'Front Brake Rotor & Strut Overhaul', 'Waiting for Parts', 'Urgent',
        4200.0, 8900.0, 500.0, 2268.0, 13100.0,
        'Customer reported front-right metallic rattling over speed breakers. Awaiting OEM strut mount.',
        2, JSON.stringify([
          { item: 'Front Shock Absorber Removal', done: true },
          { item: 'OEM Strut Mounting Assembly', done: false },
          { item: 'Front Brake Disc Skimming/Replace', done: false },
          { item: 'Wheel Alignment & Balancing', done: false }
        ]), null
      ],
      [
        504, 104, 206, 301, '2026-09-21', '2026-09-22',
        'Engine Check Light & Throttle Body Clean', 'Inspection', 'Normal',
        1800.0, 650.0, 0.0, 441.0, 2450.0,
        'OBD2 scan showed code P0101 (Mass Air Flow). Cleaning sensor and throttle valve.',
        4, JSON.stringify([
          { item: 'OBD2 Diagnostic Scan', done: true },
          { item: 'MAF Sensor Voltage Testing', done: true },
          { item: 'Throttle Plate Decarbonization', done: false },
          { item: 'ECU Adaptation Reset', done: false }
        ]), null
      ],
      [
        505, 105, 207, 305, '2026-09-21', '2026-09-21',
        'Express Lube & Synthetic Oil Change', 'Ready for Pickup', 'Normal',
        1200.0, 2600.0, 0.0, 684.0, 3800.0,
        'Mobil 1 synthetic oil 3.6L, genuine Honda oil filter, washer fluid topped up.',
        5, JSON.stringify([
          { item: 'Engine Oil Drain & Fill', done: true },
          { item: 'Oil Filter Replacement', done: true },
          { item: 'Fluid Levels Checked', done: true },
          { item: 'Tire Pressure 33 PSI All Around', done: true }
        ]), '2026-09-21 15:45'
      ],
      [
        506, 108, 210, 303, '2026-09-21', '2026-09-22',
        'CNG Compliance Check & Suspension Bushings', 'In Progress', 'Normal',
        2500.0, 1900.0, 0.0, 792.0, 4400.0,
        'CNG leakage sniff test passed. Rear spring cushion pads being replaced.',
        6, JSON.stringify([
          { item: 'CNG Cylinder Hydro Test Inspection', done: true },
          { item: 'Gas Leak Detector Check', done: true },
          { item: 'Rear Shocker Rubber Pads', done: false },
          { item: 'Spark Plug Gap Calibration', done: false }
        ]), null
      ]
    ];

    for (const s of services) {
      await executeRun(
        'INSERT INTO service_jobs (service_id, customer_id, vehicle_id, mechanic_id, service_date, expected_delivery_date, service_type, status, priority, labour_charges, spare_parts_cost, discount, tax, total_bill_amount, notes, bay_id, checklist_json, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        s
      );
    }

    // 6. Seed Invoices
    const invoices = [
      ['INV-2026-0501', 501, 101, 201, '2026-09-21', '2026-09-21', 3500.0, 5200.0, 8700.0, 200.0, 1530.0, 10030.0, 10030.0, 'Paid', 'UPI', '2026-09-21 17:05', 'Paid via GPay UPI ref 62891047120'],
      ['INV-2026-0505', 505, 105, 207, '2026-09-21', '2026-09-21', 1200.0, 2600.0, 3800.0, 0.0, 684.0, 4484.0, 0.0, 'Pending', '', null, 'Payment on vehicle pickup.'],
      ['INV-2026-0503', 503, 103, 204, '2026-09-20', '2026-09-24', 4200.0, 8900.0, 13100.0, 500.0, 2268.0, 14868.0, 5000.0, 'Partially Paid', 'Credit Card', '2026-09-20 12:40', 'Advance deposit of ₹5,000 received for OEM struts.'],
    ];

    for (const inv of invoices) {
      await executeRun(
        'INSERT INTO invoices (invoice_number, service_id, customer_id, vehicle_id, invoice_date, due_date, labour_charges, spare_parts_cost, subtotal, discount, tax_amount, total_amount, paid_amount, payment_status, payment_method, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        inv
      );
    }

    console.log('Database seeded successfully with initial records.');
  }
}
