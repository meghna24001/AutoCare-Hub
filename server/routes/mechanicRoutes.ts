import { Router, Request, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/database.js';

export const mechanicRouter = Router();

// GET all mechanics with live active jobs count
mechanicRouter.get('/', async (req: Request, res: Response) => {
  try {
    const mechanics = await queryAll(`
      SELECT 
        m.mechanic_id as mechanicID,
        m.name,
        m.phone,
        m.email,
        m.specialization,
        m.status,
        m.rating,
        m.experience_years as experienceYears,
        m.completed_jobs_count as completedJobsCount,
        COUNT(CASE WHEN s.status IN ('Scheduled', 'Checked In', 'Inspection', 'In Progress', 'Waiting for Parts') THEN s.service_id END) as activeJobsCount
      FROM mechanics m
      LEFT JOIN service_jobs s ON m.mechanic_id = s.mechanic_id
      GROUP BY m.mechanic_id
      ORDER BY m.mechanic_id ASC
    `);

    res.json({ success: true, data: mechanics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single mechanic with their active and completed jobs
mechanicRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const mechanicId = parseInt(req.params.id, 10);
    const mechanic = await queryOne(`
      SELECT 
        mechanic_id as mechanicID,
        name,
        phone,
        email,
        specialization,
        status,
        rating,
        experience_years as experienceYears,
        completed_jobs_count as completedJobsCount
      FROM mechanics
      WHERE mechanic_id = ?
    `, [mechanicId]);

    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found.' });
    }

    const assignedJobs = await queryAll(`
      SELECT 
        s.service_id as serviceID,
        s.service_date as serviceDate,
        s.service_type as serviceType,
        s.status,
        s.priority,
        v.registration_number as registrationNumber,
        v.model as vehicleModel,
        c.customer_name as customerName
      FROM service_jobs s
      LEFT JOIN vehicles v ON s.vehicle_id = v.vehicle_id
      LEFT JOIN customers c ON s.customer_id = c.customer_id
      WHERE s.mechanic_id = ?
      ORDER BY s.service_id DESC
    `, [mechanicId]);

    const activeCount = assignedJobs.filter((j: any) =>
      ['Scheduled', 'Checked In', 'Inspection', 'In Progress', 'Waiting for Parts'].includes(j.status)
    ).length;

    res.json({
      success: true,
      data: {
        ...mechanic,
        activeJobsCount: activeCount,
        jobs: assignedJobs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new technician
mechanicRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      mechanicID,
      name,
      phone,
      email = '',
      specialization,
      status = 'Available',
      rating = 4.8,
      experienceYears = 5,
    } = req.body;

    if (!name || !phone || !specialization) {
      return res.status(400).json({ success: false, message: 'Name, phone, and specialization are required.' });
    }

    let finalId = mechanicID ? parseInt(mechanicID, 10) : 0;
    if (!finalId) {
      const maxRow = await queryOne<{ maxId: number }>('SELECT COALESCE(MAX(mechanic_id), 0) as maxId FROM mechanics');
      finalId = (maxRow?.maxId || 0) + 1;
    }

    await executeRun(`
      INSERT INTO mechanics (mechanic_id, name, phone, email, specialization, status, rating, experience_years)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalId, name.trim(), phone.trim(), email.trim(), specialization.trim(), status, rating, experienceYears]);

    res.status(201).json({
      success: true,
      message: 'Mechanic added successfully.',
      data: {
        mechanicID: finalId,
        name,
        phone,
        email,
        specialization,
        status,
        rating,
        experienceYears,
        activeJobsCount: 0,
        completedJobsCount: 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update mechanic
mechanicRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const mechanicId = parseInt(req.params.id, 10);
    const existing = await queryOne('SELECT * FROM mechanics WHERE mechanic_id = ?', [mechanicId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mechanic not found.' });
    }

    const { name, phone, email, specialization, status, rating, experienceYears } = req.body;

    await executeRun(`
      UPDATE mechanics SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        specialization = COALESCE(?, specialization),
        status = COALESCE(?, status),
        rating = COALESCE(?, rating),
        experience_years = COALESCE(?, experience_years)
      WHERE mechanic_id = ?
    `, [name, phone, email, specialization, status, rating, experienceYears, mechanicId]);

    res.json({ success: true, message: `Mechanic #${mechanicId} updated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE mechanic
mechanicRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const mechanicId = parseInt(req.params.id, 10);

    const activeJobs = await queryAll(`
      SELECT service_id FROM service_jobs 
      WHERE mechanic_id = ? AND status NOT IN ('Completed', 'Delivered')
    `, [mechanicId]);

    if (activeJobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete mechanic #${mechanicId}: Has ${activeJobs.length} active service job(s) assigned.`,
      });
    }

    await executeRun('DELETE FROM mechanics WHERE mechanic_id = ?', [mechanicId]);
    res.json({ success: true, message: `Mechanic #${mechanicId} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
