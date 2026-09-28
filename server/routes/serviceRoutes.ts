import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const serviceRouter = Router();

// GET all service jobs with joined customer, vehicle, mechanic, and invoice info
serviceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, vehicleId, customerId, mechanicId } = req.query;

    let sql = `
      SELECT 
        s.service_id as serviceID,
        s.customer_id as customerID,
        s.vehicle_id as vehicleID,
        s.mechanic_id as mechanicID,
        s.service_date as serviceDate,
        s.expected_delivery_date as expectedDeliveryDate,
        s.service_type as serviceType,
        s.status,
        s.priority,
        s.labour_charges as labourCharges,
        s.spare_parts_cost as sparePartsCost,
        s.discount,
        s.tax,
        s.total_bill_amount as totalBillAmount,
        s.notes,
        s.bay_id as bayId,
        s.checklist_json as checklistJson,
        s.completed_at as completedAt,
        s.created_at as createdAt,
        c.customer_name as customerName,
        c.mobile_number as customerMobile,
        v.registration_number as registrationNumber,
        v.model as vehicleModel,
        v.manufacturer as vehicleMake,
        m.name as mechanicName,
        m.phone as mechanicPhone,
        b.name as bayName,
        i.invoice_number as invoiceNumber,
        i.payment_status as paymentStatus,
        i.paid_amount as paidAmount
      FROM service_jobs s
      LEFT JOIN customers c ON s.customer_id = c.customer_id
      LEFT JOIN vehicles v ON s.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON s.mechanic_id = m.mechanic_id
      LEFT JOIN service_bays b ON s.bay_id = b.bay_id
      LEFT JOIN invoices i ON s.service_id = i.service_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (vehicleId) {
      sql += ' AND s.vehicle_id = ?';
      params.push(parseInt(vehicleId as string, 10));
    }
    if (customerId) {
      sql += ' AND s.customer_id = ?';
      params.push(parseInt(customerId as string, 10));
    }
    if (mechanicId) {
      sql += ' AND s.mechanic_id = ?';
      params.push(parseInt(mechanicId as string, 10));
    }

    sql += ' ORDER BY s.service_id DESC';

    const rows = await queryAll(sql, params);

    const formatted = rows.map((row: any) => {
      let checklist = [];
      try {
        checklist = row.checklistJson ? JSON.parse(row.checklistJson) : [];
      } catch {
        checklist = [];
      }
      const { checklistJson, ...rest } = row;
      return {
        ...rest,
        checklist,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single service job by ID
serviceRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const row = await queryOne(`
      SELECT 
        s.service_id as serviceID,
        s.customer_id as customerID,
        s.vehicle_id as vehicleID,
        s.mechanic_id as mechanicID,
        s.service_date as serviceDate,
        s.expected_delivery_date as expectedDeliveryDate,
        s.service_type as serviceType,
        s.status,
        s.priority,
        s.labour_charges as labourCharges,
        s.spare_parts_cost as sparePartsCost,
        s.discount,
        s.tax,
        s.total_bill_amount as totalBillAmount,
        s.notes,
        s.bay_id as bayId,
        s.checklist_json as checklistJson,
        s.completed_at as completedAt,
        s.created_at as createdAt,
        c.customer_name as customerName,
        c.mobile_number as customerMobile,
        c.email_address as customerEmail,
        c.address as customerAddress,
        v.registration_number as registrationNumber,
        v.model as vehicleModel,
        v.manufacturer as vehicleMake,
        v.fuel_type as fuelType,
        m.name as mechanicName,
        m.phone as mechanicPhone,
        m.specialization as mechanicSpecialization,
        b.name as bayName,
        i.invoice_number as invoiceNumber,
        i.payment_status as paymentStatus,
        i.paid_amount as paidAmount,
        i.total_amount as invoiceTotal
      FROM service_jobs s
      LEFT JOIN customers c ON s.customer_id = c.customer_id
      LEFT JOIN vehicles v ON s.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON s.mechanic_id = m.mechanic_id
      LEFT JOIN service_bays b ON s.bay_id = b.bay_id
      LEFT JOIN invoices i ON s.service_id = i.service_id
      WHERE s.service_id = ?
    `, [serviceId]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Service job not found.' });
    }

    let checklist = [];
    try {
      checklist = row.checklistJson ? JSON.parse(row.checklistJson) : [];
    } catch {
      checklist = [];
    }
    const { checklistJson, ...rest } = row;

    res.json({
      success: true,
      data: {
        ...rest,
        checklist,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create new service job
// Enforces C++ Core Logic:
// 1. Vehicle must exist
// 2. Customer must exist
// 3. Vehicle customer_id MUST match customerID (Ownership Check)
// 4. Total = labourCharges + sparePartsCost
// 5. Automatically generates formal tax invoice in invoices table
serviceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      serviceID,
      customerID,
      vehicleID,
      mechanicID,
      serviceDate,
      expectedDeliveryDate,
      serviceType,
      status = 'Checked In',
      priority = 'Normal',
      labourCharges = 0,
      sparePartsCost = 0,
      discount = 0,
      tax = 0,
      notes = '',
      bayId = null,
      checklist = [],
    } = req.body;

    // Validate required fields
    if (!customerID || !vehicleID || !mechanicID || !serviceDate || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'customerID, vehicleID, mechanicID, serviceDate, and serviceType are required.',
      });
    }

    // 1. Check vehicle
    const vehicle = await queryOne<{ vehicle_id: number; customer_id: number; registration_number: string }>(
      'SELECT vehicle_id, customer_id, registration_number FROM vehicles WHERE vehicle_id = ?',
      [vehicleID]
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle ID ${vehicleID} not found.`,
      });
    }

    // 2. Check customer
    const customer = await queryOne<{ customer_id: number; customer_name: string }>(
      'SELECT customer_id, customer_name FROM customers WHERE customer_id = ?',
      [customerID]
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ID ${customerID} not found.`,
      });
    }

    // 3. CORE C++ INTEGRITY CHECK: vehicle.customerID == customerID
    if (vehicle.customer_id !== Number(customerID)) {
      return res.status(400).json({
        success: false,
        message: `Ownership mismatch: Vehicle ${vehicle.registration_number} belongs to Customer ID ${vehicle.customer_id}, not Customer ID ${customerID}.`,
      });
    }

    // 4. Check mechanic
    const mechanic = await queryOne<{ mechanic_id: number }>(
      'SELECT mechanic_id FROM mechanics WHERE mechanic_id = ?',
      [mechanicID]
    );

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: `Mechanic ID ${mechanicID} not found.`,
      });
    }

    // Determine ID
    let finalServiceID = serviceID ? parseInt(serviceID, 10) : 0;
    if (!finalServiceID) {
      const maxRow = await queryOne<{ maxId: number }>('SELECT COALESCE(MAX(service_id), 300) as maxId FROM service_jobs');
      finalServiceID = (maxRow?.maxId || 300) + 1;
    }

    // Calculate billing
    const lCharges = Math.max(0, Number(labourCharges) || 0);
    const pCost = Math.max(0, Number(sparePartsCost) || 0);
    const disc = Math.max(0, Number(discount) || 0);
    const taxAmt = Math.max(0, Number(tax) || 0);
    const totalBill = lCharges + pCost - disc + taxAmt;

    const checklistStr = JSON.stringify(checklist);

    // Insert service job
    await executeRun(`
      INSERT INTO service_jobs (
        service_id, customer_id, vehicle_id, mechanic_id,
        service_date, expected_delivery_date, service_type,
        status, priority, labour_charges, spare_parts_cost,
        discount, tax, total_bill_amount, notes, bay_id, checklist_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalServiceID,
      customerID,
      vehicleID,
      mechanicID,
      serviceDate,
      expectedDeliveryDate || null,
      serviceType,
      status,
      priority,
      lCharges,
      pCost,
      disc,
      taxAmt,
      totalBill,
      notes,
      bayId || null,
      checklistStr,
    ]);

    // Update vehicle status
    await executeRun('UPDATE vehicles SET status = ? WHERE vehicle_id = ?', ['In Service', vehicleID]);

    // If bay assigned, update bay status
    if (bayId) {
      await executeRun(`
        UPDATE service_bays 
        SET status = 'Occupied', current_vehicle_id = ?, current_service_id = ?, assigned_mechanic_id = ?, occupied_since = datetime('now', 'localtime')
        WHERE bay_id = ?
      `, [vehicleID, finalServiceID, mechanicID, bayId]);
    }

    // Auto-create Tax Invoice (INV-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${String(finalServiceID).padStart(4, '0')}`;
    const invoiceDate = serviceDate;
    const dueDate = expectedDeliveryDate || serviceDate;

    await executeRun(`
      INSERT OR REPLACE INTO invoices (
        invoice_number, service_id, customer_id, vehicle_id,
        invoice_date, due_date, labour_charges, spare_parts_cost,
        subtotal, discount, tax_amount, total_amount, paid_amount,
        payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 'Pending', ?)
    `, [
      invoiceNumber,
      finalServiceID,
      customerID,
      vehicleID,
      invoiceDate,
      dueDate,
      lCharges,
      pCost,
      lCharges + pCost,
      disc,
      taxAmt,
      totalBill,
      notes || `Service job #${finalServiceID}`,
    ]);

    res.status(201).json({
      success: true,
      message: 'Service job created successfully and tax invoice generated.',
      data: {
        serviceID: finalServiceID,
        customerID,
        vehicleID,
        mechanicID,
        serviceDate,
        serviceType,
        status,
        totalBillAmount: totalBill,
        invoiceNumber,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /:id/status: Advance or update service status
serviceRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const job = await queryOne<{ service_id: number; vehicle_id: number; mechanic_id: number; bay_id: number }>(
      'SELECT service_id, vehicle_id, mechanic_id, bay_id FROM service_jobs WHERE service_id = ?',
      [serviceId]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Service job not found.' });
    }

    const isCompleted = status === 'Completed' || status === 'Delivered';
    const completedAt = isCompleted ? new Date().toISOString() : null;

    await executeRun(
      'UPDATE service_jobs SET status = ?, completed_at = COALESCE(?, completed_at) WHERE service_id = ?',
      [status, completedAt, serviceId]
    );

    // Map service status to vehicle status
    let vehicleStatus = 'In Service';
    if (status === 'Ready for Pickup') vehicleStatus = 'Ready for Pickup';
    else if (status === 'Delivered' || status === 'Completed') vehicleStatus = 'Idle';
    else if (status === 'Scheduled') vehicleStatus = 'Scheduled';

    await executeRun('UPDATE vehicles SET status = ? WHERE vehicle_id = ?', [vehicleStatus, job.vehicle_id]);

    // If completed or delivered, free the bay and update mechanic count
    if (isCompleted && job.bay_id) {
      await executeRun(`
        UPDATE service_bays 
        SET status = 'Available', current_vehicle_id = NULL, current_service_id = NULL, assigned_mechanic_id = NULL, occupied_since = NULL
        WHERE bay_id = ?
      `, [job.bay_id]);

      await executeRun(`
        UPDATE mechanics 
        SET completed_jobs_count = completed_jobs_count + 1 
        WHERE mechanic_id = ?
      `, [job.mechanic_id]);
    }

    res.json({
      success: true,
      message: `Job #${serviceId} status updated to ${status}.`,
      data: { serviceID: serviceId, status, vehicleStatus },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update service details
serviceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const existing = await queryOne('SELECT * FROM service_jobs WHERE service_id = ?', [serviceId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service job not found.' });
    }

    const {
      serviceType,
      status,
      priority,
      labourCharges,
      sparePartsCost,
      discount,
      tax,
      notes,
      bayId,
      checklist,
      expectedDeliveryDate,
    } = req.body;

    const lCharges = labourCharges !== undefined ? Number(labourCharges) : existing.labour_charges;
    const pCost = sparePartsCost !== undefined ? Number(sparePartsCost) : existing.spare_parts_cost;
    const disc = discount !== undefined ? Number(discount) : existing.discount;
    const taxAmt = tax !== undefined ? Number(tax) : existing.tax;
    const totalBill = lCharges + pCost - disc + taxAmt;

    const checklistStr = checklist !== undefined ? JSON.stringify(checklist) : existing.checklist_json;

    await executeRun(`
      UPDATE service_jobs SET
        service_type = COALESCE(?, service_type),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        labour_charges = ?,
        spare_parts_cost = ?,
        discount = ?,
        tax = ?,
        total_bill_amount = ?,
        notes = COALESCE(?, notes),
        bay_id = COALESCE(?, bay_id),
        checklist_json = ?,
        expected_delivery_date = COALESCE(?, expected_delivery_date)
      WHERE service_id = ?
    `, [
      serviceType,
      status,
      priority,
      lCharges,
      pCost,
      disc,
      taxAmt,
      totalBill,
      notes,
      bayId,
      checklistStr,
      expectedDeliveryDate,
      serviceId,
    ]);

    // Also update linked invoice amounts
    await executeRun(`
      UPDATE invoices SET
        labour_charges = ?,
        spare_parts_cost = ?,
        subtotal = ?,
        discount = ?,
        tax_amount = ?,
        total_amount = ?
      WHERE service_id = ?
    `, [lCharges, pCost, lCharges + pCost, disc, taxAmt, totalBill, serviceId]);

    res.json({
      success: true,
      message: `Service job #${serviceId} updated.`,
      data: { serviceID: serviceId, totalBillAmount: totalBill },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE service job
serviceRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const job = await queryOne<{ service_id: number; bay_id: number }>(
      'SELECT service_id, bay_id FROM service_jobs WHERE service_id = ?',
      [serviceId]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Service job not found.' });
    }

    // Check if invoice has paid payments
    const payments = await queryAll(
      'SELECT p.* FROM payments p JOIN invoices i ON p.invoice_number = i.invoice_number WHERE i.service_id = ?',
      [serviceId]
    );

    if (payments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service job: Payments have already been recorded for this job.',
      });
    }

    // Clear bay if occupied
    if (job.bay_id) {
      await executeRun(`
        UPDATE service_bays 
        SET status = 'Available', current_vehicle_id = NULL, current_service_id = NULL, assigned_mechanic_id = NULL, occupied_since = NULL 
        WHERE current_service_id = ?
      `, [serviceId]);
    }

    // Delete invoices and service
    await executeRun('DELETE FROM invoices WHERE service_id = ?', [serviceId]);
    await executeRun('DELETE FROM service_jobs WHERE service_id = ?', [serviceId]);

    res.json({ success: true, message: `Service job #${serviceId} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
