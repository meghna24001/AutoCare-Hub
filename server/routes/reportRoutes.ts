import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';
import { forceReseedDatabase } from '../db/seed.js';

export const reportRouter = Router();

// GET workshop KPI summary
reportRouter.get('/kpis', async (req: Request, res: Response) => {
  try {
    const customerCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM customers');
    const vehicleCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM vehicles');
    
    const activeJobs = await queryOne<{ total: number }>(`
      SELECT COUNT(*) as total FROM service_jobs 
      WHERE status IN ('Scheduled', 'Checked In', 'Inspection', 'In Progress', 'Waiting for Parts')
    `);

    const readyForPickup = await queryOne<{ total: number }>(`
      SELECT COUNT(*) as total FROM service_jobs 
      WHERE status = 'Ready for Pickup'
    `);

    const completedJobs = await queryOne<{ total: number }>(`
      SELECT COUNT(*) as total FROM service_jobs 
      WHERE status IN ('Completed', 'Delivered')
    `);

    const financialSummary = await queryOne<{
      totalBilled: number;
      totalCollected: number;
      pendingAmount: number;
    }>(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as totalBilled,
        COALESCE(SUM(paid_amount), 0) as totalCollected,
        COALESCE(SUM(CASE WHEN payment_status != 'Paid' THEN (total_amount - paid_amount) ELSE 0 END), 0) as pendingAmount
      FROM invoices
    `);

    const bayOccupancy = await queryOne<{ occupied: number; total: number }>(`
      SELECT 
        COUNT(CASE WHEN status = 'Occupied' THEN 1 END) as occupied,
        COUNT(*) as total
      FROM service_bays
    `);

    res.json({
      success: true,
      data: {
        totalCustomers: customerCount?.total || 0,
        totalVehicles: vehicleCount?.total || 0,
        activeJobs: activeJobs?.total || 0,
        readyForPickup: readyForPickup?.total || 0,
        completedJobs: completedJobs?.total || 0,
        totalBilled: financialSummary?.totalBilled || 0,
        totalCollected: financialSummary?.totalCollected || 0,
        pendingAmount: financialSummary?.pendingAmount || 0,
        bayOccupancy: {
          occupied: bayOccupancy?.occupied || 0,
          total: bayOccupancy?.total || 8,
          percentage: bayOccupancy?.total ? Math.round((bayOccupancy.occupied / bayOccupancy.total) * 100) : 0,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET revenue analytics by service type & monthly
reportRouter.get('/revenue-analytics', async (req: Request, res: Response) => {
  try {
    const byServiceType = await queryAll(`
      SELECT 
        s.service_type as serviceType,
        COUNT(s.service_id) as jobCount,
        COALESCE(SUM(s.labour_charges), 0) as totalLabour,
        COALESCE(SUM(s.spare_parts_cost), 0) as totalParts,
        COALESCE(SUM(s.total_bill_amount), 0) as totalRevenue
      FROM service_jobs s
      GROUP BY s.service_type
      ORDER BY "totalRevenue" DESC
    `);

    const byMonth = await queryAll(`
      SELECT 
        substr(invoice_date, 4, 7) as monthYear,
        COUNT(invoice_number) as invoiceCount,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(SUM(paid_amount), 0) as collectedAmount
      FROM invoices
      GROUP BY "monthYear"
      ORDER BY "monthYear" DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        byServiceType,
        byMonth,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET complete database backup dump (Zero-cost, JSON snapshot)
reportRouter.get('/backup', async (req: Request, res: Response) => {
  try {
    const customers = await queryAll('SELECT * FROM customers ORDER BY customer_id ASC');
    const vehicles = await queryAll('SELECT * FROM vehicles ORDER BY vehicle_id ASC');
    const mechanics = await queryAll('SELECT * FROM mechanics ORDER BY mechanic_id ASC');
    const bays = await queryAll('SELECT * FROM service_bays ORDER BY bay_id ASC');
    const serviceJobs = await queryAll('SELECT * FROM service_jobs ORDER BY service_id ASC');
    const invoices = await queryAll('SELECT * FROM invoices ORDER BY invoice_number ASC');
    const payments = await queryAll('SELECT * FROM payments ORDER BY payment_id ASC');

    const backupData = {
      exportedAt: new Date().toISOString(),
      system: 'AutoCare Hub - Vehicle Service Management System',
      version: '2.0.0',
      database: {
        customers,
        vehicles,
        mechanics,
        bays,
        serviceJobs,
        invoices,
        payments,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="autocare_hub_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(backupData);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST restore database from backup payload
reportRouter.post('/restore', async (req: Request, res: Response) => {
  try {
    const { database } = req.body;
    if (!database) {
      return res.status(400).json({ success: false, message: 'Invalid backup format. Missing "database" property.' });
    }

    // We execute restore inside sequentially
    if (Array.isArray(database.customers)) {
      for (const c of database.customers) {
        await executeRun(`
          INSERT OR REPLACE INTO customers (customer_id, customer_name, address, mobile_number, email_address)
          VALUES (?, ?, ?, ?, ?)
        `, [c.customer_id, c.customer_name, c.address, c.mobile_number, c.email_address || '']);
      }
    }

    if (Array.isArray(database.vehicles)) {
      for (const v of database.vehicles) {
        await executeRun(`
          INSERT OR REPLACE INTO vehicles (vehicle_id, customer_id, registration_number, model, manufacturer, year_of_manufacture, fuel_type, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [v.vehicle_id, v.customer_id, v.registration_number, v.model, v.manufacturer, v.year_of_manufacture, v.fuel_type, v.status || 'Idle']);
      }
    }

    if (Array.isArray(database.mechanics)) {
      for (const m of database.mechanics) {
        await executeRun(`
          INSERT OR REPLACE INTO mechanics (mechanic_id, name, phone, email, specialization, status, rating, experience_years, completed_jobs_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [m.mechanic_id, m.name, m.phone, m.email || '', m.specialization, m.status || 'Available', m.rating || 4.8, m.experience_years || 5, m.completed_jobs_count || 0]);
      }
    }

    if (Array.isArray(database.serviceJobs)) {
      for (const s of database.serviceJobs) {
        await executeRun(`
          INSERT OR REPLACE INTO service_jobs (
            service_id, customer_id, vehicle_id, mechanic_id, service_date,
            expected_delivery_date, service_type, status, priority,
            labour_charges, spare_parts_cost, discount, tax, total_bill_amount,
            notes, bay_id, checklist_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          s.service_id, s.customer_id, s.vehicle_id, s.mechanic_id, s.service_date,
          s.expected_delivery_date, s.service_type, s.status, s.priority,
          s.labour_charges, s.spare_parts_cost, s.discount || 0, s.tax || 0, s.total_bill_amount,
          s.notes || '', s.bay_id || null, s.checklist_json || '[]'
        ]);
      }
    }

    if (Array.isArray(database.invoices)) {
      for (const i of database.invoices) {
        await executeRun(`
          INSERT OR REPLACE INTO invoices (
            invoice_number, service_id, customer_id, vehicle_id, invoice_date,
            due_date, labour_charges, spare_parts_cost, subtotal, discount,
            tax_amount, total_amount, paid_amount, payment_status, payment_method,
            paid_at, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          i.invoice_number, i.service_id, i.customer_id, i.vehicle_id, i.invoice_date,
          i.due_date, i.labour_charges, i.spare_parts_cost, i.subtotal, i.discount || 0,
          i.tax_amount || 0, i.total_amount, i.paid_amount || 0, i.payment_status || 'Pending',
          i.payment_method || '', i.paid_at || null, i.notes || ''
        ]);
      }
    }

    res.json({ success: true, message: 'Database restored successfully from backup.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST reseed database back to pristine demo state
reportRouter.post('/reseed', async (req: Request, res: Response) => {
  try {
    await forceReseedDatabase();
    res.json({ success: true, message: 'Database reset to demo state successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
