import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const vehicleRouter = Router();

// GET all vehicles with owner information
vehicleRouter.get('/', async (req: Request, res: Response) => {
  try {
    const vehicles = await queryAll(`
      SELECT 
        v.vehicle_id as vehicleID,
        v.customer_id as customerID,
        v.registration_number as registrationNumber,
        v.model,
        v.manufacturer,
        v.year_of_manufacture as yearOfManufacture,
        v.fuel_type as fuelType,
        v.status,
        c.customer_name as ownerName,
        c.mobile_number as ownerMobile,
        COUNT(s.service_id) as serviceCount,
        MAX(s.service_date) as lastServiceDate
      FROM vehicles v
      LEFT JOIN customers c ON v.customer_id = c.customer_id
      LEFT JOIN service_jobs s ON v.vehicle_id = s.vehicle_id
      GROUP BY v.vehicle_id
      ORDER BY v.vehicle_id ASC
    `);

    res.json({ success: true, data: vehicles });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET vehicle by ID or Registration Number (C++ searchVehicleByRegistration)
vehicleRouter.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const param = req.params.identifier.trim();
    const isNumeric = /^\d+$/.test(param);

    let vehicle;
    if (isNumeric) {
      vehicle = await queryOne(`
        SELECT 
          v.vehicle_id as vehicleID,
          v.customer_id as customerID,
          v.registration_number as registrationNumber,
          v.model,
          v.manufacturer,
          v.year_of_manufacture as yearOfManufacture,
          v.fuel_type as fuelType,
          v.status,
          c.customer_name as ownerName,
          c.mobile_number as ownerMobile,
          c.email_address as ownerEmail,
          c.address as ownerAddress
        FROM vehicles v
        LEFT JOIN customers c ON v.customer_id = c.customer_id
        WHERE v.vehicle_id = ?
      `, [parseInt(param, 10)]);
    } else {
      // Clean registration plate string search (e.g. MH02AB1234 or MH 02 AB 1234)
      const cleanPlate = param.replace(/\s+/g, '').toUpperCase();
      vehicle = await queryOne(`
        SELECT 
          v.vehicle_id as vehicleID,
          v.customer_id as customerID,
          v.registration_number as registrationNumber,
          v.model,
          v.manufacturer,
          v.year_of_manufacture as yearOfManufacture,
          v.fuel_type as fuelType,
          v.status,
          c.customer_name as ownerName,
          c.mobile_number as ownerMobile,
          c.email_address as ownerEmail,
          c.address as ownerAddress
        FROM vehicles v
        LEFT JOIN customers c ON v.customer_id = c.customer_id
        WHERE REPLACE(UPPER(v.registration_number), ' ', '') = ?
      `, [cleanPlate]);
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Fetch chronological service history (C++ displayServiceHistory)
    const history = await queryAll(`
      SELECT 
        s.service_id as serviceID,
        s.service_date as serviceDate,
        s.service_type as serviceType,
        s.status,
        s.labour_charges as labourCharges,
        s.spare_parts_cost as sparePartsCost,
        s.total_bill_amount as totalBillAmount,
        s.notes,
        m.name as mechanicName
      FROM service_jobs s
      LEFT JOIN mechanics m ON s.mechanic_id = m.mechanic_id
      WHERE s.vehicle_id = ?
      ORDER BY s.service_date DESC
    `, [vehicle.vehicleID]);

    res.json({
      success: true,
      data: {
        ...vehicle,
        history,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST register new vehicle (C++ registerVehicle: checks customerExists, registrationExists)
vehicleRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { vehicleID, customerID, registrationNumber, model, manufacturer, yearOfManufacture, fuelType } = req.body;

    if (!customerID) {
      return res.status(400).json({ success: false, message: 'Owner (customerID) is required.' });
    }

    // Verify owner exists (C++ check: !customerExists(customers, customerID))
    const customer = await queryOne('SELECT customer_id FROM customers WHERE customer_id = ?', [customerID]);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Error: Customer does not exist. Please register the customer first.',
      });
    }

    const cleanReg = (registrationNumber || '').trim().toUpperCase();
    if (!cleanReg) {
      return res.status(400).json({ success: false, message: 'Registration number is required.' });
    }

    // Verify unique plate (C++ check: registrationExists)
    const existingPlate = await queryOne(
      "SELECT vehicle_id FROM vehicles WHERE REPLACE(UPPER(registration_number), ' ', '') = ?",
      [cleanReg.replace(/\s+/g, '')]
    );
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: 'Error: Registration number already exists.',
      });
    }

    let id = vehicleID ? parseInt(vehicleID, 10) : undefined;
    if (id) {
      const existingId = await queryOne('SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?', [id]);
      if (existingId) {
        return res.status(400).json({ success: false, message: 'Error: Vehicle ID already exists.' });
      }
    } else {
      const maxRow = await queryOne<{ maxId: number }>('SELECT MAX(vehicle_id) as maxId FROM vehicles');
      id = maxRow && maxRow.maxId ? maxRow.maxId + 1 : 201;
    }

    await executeRun(`
      INSERT INTO vehicles (vehicle_id, customer_id, registration_number, model, manufacturer, year_of_manufacture, fuel_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Idle')
    `, [id, customerID, cleanReg, (model || '').trim(), (manufacturer || 'Toyota').trim(), yearOfManufacture || new Date().getFullYear(), fuelType || 'Petrol']);

    const created = await queryOne(`
      SELECT 
        vehicle_id as vehicleID,
        customer_id as customerID,
        registration_number as registrationNumber,
        model,
        manufacturer,
        year_of_manufacture as yearOfManufacture,
        fuel_type as fuelType,
        status
      FROM vehicles WHERE vehicle_id = ?
    `, [id]);

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully!',
      data: created,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update vehicle
vehicleRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    const { registrationNumber, model, manufacturer, yearOfManufacture, fuelType, status } = req.body;

    if (registrationNumber) {
      const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, '');
      const existing = await queryOne(
        "SELECT vehicle_id FROM vehicles WHERE REPLACE(UPPER(registration_number), ' ', '') = ? AND vehicle_id != ?",
        [cleanReg, vehicleId]
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Error: Registration number already in use by another vehicle.',
        });
      }
    }

    await executeRun(`
      UPDATE vehicles 
      SET 
        registration_number = COALESCE(?, registration_number),
        model = COALESCE(?, model),
        manufacturer = COALESCE(?, manufacturer),
        year_of_manufacture = COALESCE(?, year_of_manufacture),
        fuel_type = COALESCE(?, fuel_type),
        status = COALESCE(?, status)
      WHERE vehicle_id = ?
    `, [registrationNumber?.trim().toUpperCase(), model?.trim(), manufacturer?.trim(), yearOfManufacture, fuelType, status, vehicleId]);

    const updated = await queryOne('SELECT * FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
    res.json({ success: true, message: 'Vehicle updated successfully.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE vehicle
vehicleRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    const activeJobs = await queryAll(
      "SELECT service_id FROM service_jobs WHERE vehicle_id = ? AND status NOT IN ('Completed', 'Delivered')",
      [vehicleId]
    );

    if (activeJobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle. ${activeJobs.length} active service job(s) in progress.`,
      });
    }

    await executeRun('DELETE FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
    res.json({ success: true, message: 'Vehicle record deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
