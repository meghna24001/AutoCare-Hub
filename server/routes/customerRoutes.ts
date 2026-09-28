import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const customerRouter = Router();

// Validation helper: exactly 10 digits
function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  const clean = mobile.trim();
  return clean.length === 10 && /^\d{10}$/.test(clean);
}

// GET all customers with owned vehicles count and total spent
customerRouter.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await queryAll(`
      SELECT 
        c.customer_id as customerID,
        c.customer_name as customerName,
        c.address,
        c.mobile_number as mobileNumber,
        c.email_address as emailAddress,
        c.created_at as createdAt,
        COUNT(DISTINCT v.vehicle_id) as vehicleCount,
        COALESCE(SUM(s.total_bill_amount), 0) as totalSpent
      FROM customers c
      LEFT JOIN vehicles v ON c.customer_id = v.customer_id
      LEFT JOIN service_jobs s ON c.customer_id = s.customer_id
      GROUP BY c.customer_id
      ORDER BY c.customer_id ASC
    `);

    res.json({ success: true, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single customer with their vehicles and service history
customerRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const customer = await queryOne(`
      SELECT 
        customer_id as customerID,
        customer_name as customerName,
        address,
        mobile_number as mobileNumber,
        email_address as emailAddress,
        created_at as createdAt
      FROM customers
      WHERE customer_id = ?
    `, [customerId]);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const vehicles = await queryAll(`
      SELECT 
        vehicle_id as vehicleID,
        customer_id as customerID,
        registration_number as registrationNumber,
        model,
        manufacturer,
        year_of_manufacture as yearOfManufacture,
        fuel_type as fuelType,
        status
      FROM vehicles
      WHERE customer_id = ?
    `, [customerId]);

    const services = await queryAll(`
      SELECT 
        service_id as serviceID,
        customer_id as customerID,
        vehicle_id as vehicleID,
        mechanic_id as mechanicID,
        service_date as serviceDate,
        service_type as serviceType,
        status,
        labour_charges as labourCharges,
        spare_parts_cost as sparePartsCost,
        total_bill_amount as totalBillAmount
      FROM service_jobs
      WHERE customer_id = ?
      ORDER BY service_date DESC
    `, [customerId]);

    res.json({
      success: true,
      data: {
        ...customer,
        vehicles,
        services,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST register new customer (C++ customer registration & 10-digit mobile validation)
customerRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { customerID, customerName, address, mobileNumber, emailAddress } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    if (!isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Error: Mobile number must contain exactly 10 digits.',
      });
    }

    // Check unique mobile number
    const existingMobile = await queryOne('SELECT customer_id FROM customers WHERE mobile_number = ?', [mobileNumber.trim()]);
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Error: A customer with this mobile number already exists.' });
    }

    let id = customerID ? parseInt(customerID, 10) : undefined;
    if (id) {
      const existingId = await queryOne('SELECT customer_id FROM customers WHERE customer_id = ?', [id]);
      if (existingId) {
        return res.status(400).json({ success: false, message: 'Error: Customer ID already exists.' });
      }
    } else {
      const maxRow = await queryOne<{ maxId: number }>('SELECT MAX(customer_id) as maxId FROM customers');
      id = maxRow && maxRow.maxId ? maxRow.maxId + 1 : 101;
    }

    await executeRun(
      'INSERT INTO customers (customer_id, customer_name, address, mobile_number, email_address) VALUES (?, ?, ?, ?, ?)',
      [id, customerName.trim(), (address || '').trim(), mobileNumber.trim(), (emailAddress || '').trim()]
    );

    const created = await queryOne(`
      SELECT 
        customer_id as customerID,
        customer_name as customerName,
        address,
        mobile_number as mobileNumber,
        email_address as emailAddress,
        created_at as createdAt
      FROM customers WHERE customer_id = ?
    `, [id]);

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully!',
      data: created,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update customer
customerRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const { customerName, address, mobileNumber, emailAddress } = req.body;

    if (mobileNumber && !isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Error: Mobile number must contain exactly 10 digits.',
      });
    }

    const existing = await queryOne('SELECT customer_id FROM customers WHERE customer_id = ?', [customerId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await executeRun(`
      UPDATE customers 
      SET 
        customer_name = COALESCE(?, customer_name),
        address = COALESCE(?, address),
        mobile_number = COALESCE(?, mobile_number),
        email_address = COALESCE(?, email_address)
      WHERE customer_id = ?
    `, [customerName?.trim(), address?.trim(), mobileNumber?.trim(), emailAddress?.trim(), customerId]);

    const updated = await queryOne(`
      SELECT 
        customer_id as customerID,
        customer_name as customerName,
        address,
        mobile_number as mobileNumber,
        email_address as emailAddress,
        created_at as createdAt
      FROM customers WHERE customer_id = ?
    `, [customerId]);

    res.json({ success: true, message: 'Customer updated successfully.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE customer (verifies no registered vehicles)
customerRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id, 10);

    const vehicles = await queryAll('SELECT vehicle_id FROM vehicles WHERE customer_id = ?', [customerId]);
    if (vehicles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer. ${vehicles.length} vehicle(s) are registered to this customer.`,
      });
    }

    await executeRun('DELETE FROM customers WHERE customer_id = ?', [customerId]);
    res.json({ success: true, message: 'Customer record deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
