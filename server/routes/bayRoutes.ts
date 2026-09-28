import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const bayRouter = Router();

// GET all 8 workshop service bays with live occupancy data
bayRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bays = await queryAll(`
      SELECT 
        b.bay_id as bayId,
        b.name,
        b.type,
        b.status,
        b.current_vehicle_id as currentVehicleId,
        b.current_service_id as currentServiceId,
        b.assigned_mechanic_id as assignedMechanicId,
        b.occupied_since as occupiedSince,
        v.registration_number as vehicleRegistration,
        v.model as vehicleModel,
        m.name as mechanicName,
        s.service_type as serviceType,
        s.status as serviceStatus
      FROM service_bays b
      LEFT JOIN vehicles v ON b.current_vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.assigned_mechanic_id = m.mechanic_id
      LEFT JOIN service_jobs s ON b.current_service_id = s.service_id
      ORDER BY b.bay_id ASC
    `);

    res.json({ success: true, data: bays });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single bay details
bayRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const bayId = parseInt(req.params.id, 10);
    const bay = await queryOne(`
      SELECT 
        b.bay_id as bayId,
        b.name,
        b.type,
        b.status,
        b.current_vehicle_id as currentVehicleId,
        b.current_service_id as currentServiceId,
        b.assigned_mechanic_id as assignedMechanicId,
        b.occupied_since as occupiedSince,
        v.registration_number as vehicleRegistration,
        v.model as vehicleModel,
        m.name as mechanicName,
        s.service_type as serviceType
      FROM service_bays b
      LEFT JOIN vehicles v ON b.current_vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.assigned_mechanic_id = m.mechanic_id
      LEFT JOIN service_jobs s ON b.current_service_id = s.service_id
      WHERE b.bay_id = ?
    `, [bayId]);

    if (!bay) {
      return res.status(404).json({ success: false, message: 'Bay not found.' });
    }

    res.json({ success: true, data: bay });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update bay status and assignment
bayRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const bayId = parseInt(req.params.id, 10);
    const { status, vehicleId, serviceId, mechanicId } = req.body;

    const existing = await queryOne('SELECT * FROM service_bays WHERE bay_id = ?', [bayId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bay not found.' });
    }

    if (status === 'Available') {
      await executeRun(`
        UPDATE service_bays SET
          status = 'Available',
          current_vehicle_id = NULL,
          current_service_id = NULL,
          assigned_mechanic_id = NULL,
          occupied_since = NULL
        WHERE bay_id = ?
      `, [bayId]);
    } else if (status === 'Occupied') {
      await executeRun(`
        UPDATE service_bays SET
          status = 'Occupied',
          current_vehicle_id = COALESCE(?, current_vehicle_id),
          current_service_id = COALESCE(?, current_service_id),
          assigned_mechanic_id = COALESCE(?, assigned_mechanic_id),
          occupied_since = COALESCE(occupied_since, datetime('now', 'localtime'))
        WHERE bay_id = ?
      `, [vehicleId, serviceId, mechanicId, bayId]);

      // If serviceId passed, link bay to service_jobs
      if (serviceId) {
        await executeRun('UPDATE service_jobs SET bay_id = ? WHERE service_id = ?', [bayId, serviceId]);
      }
    } else if (status === 'Maintenance') {
      await executeRun(`
        UPDATE service_bays SET
          status = 'Maintenance',
          current_vehicle_id = NULL,
          current_service_id = NULL,
          assigned_mechanic_id = NULL,
          occupied_since = NULL
        WHERE bay_id = ?
      `, [bayId]);
    }

    res.json({ success: true, message: `Bay #${bayId} status updated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST release bay
bayRouter.post('/:id/release', async (req: Request, res: Response) => {
  try {
    const bayId = parseInt(req.params.id, 10);
    await executeRun(`
      UPDATE service_bays SET
        status = 'Available',
        current_vehicle_id = NULL,
        current_service_id = NULL,
        assigned_mechanic_id = NULL,
        occupied_since = NULL
      WHERE bay_id = ?
    `, [bayId]);

    res.json({ success: true, message: `Bay #${bayId} is now available.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
