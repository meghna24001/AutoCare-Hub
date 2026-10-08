import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { initializeAndSeedDatabase } from './db/seed.js';
import { customerRouter } from './routes/customerRoutes.js';
import { vehicleRouter } from './routes/vehicleRoutes.js';
import { serviceRouter } from './routes/serviceRoutes.js';
import { mechanicRouter } from './routes/mechanicRoutes.js';
import { bayRouter } from './routes/bayRoutes.js';
import { invoiceRouter } from './routes/invoiceRoutes.js';
import { reportRouter } from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'AutoCare Hub Backend Server',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
  });
});

// API Routes
app.use('/api/customers', customerRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/services', serviceRouter);
app.use('/api/mechanics', mechanicRouter);
app.use('/api/bays', bayRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/reports', reportRouter);

const clientBuildPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientBuildPath));
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});
app.get(/^(?!\/api(?:\/|$)).*/, (_req: Request, res: Response, next) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
async function startServer() {
  try {
    console.log('Initializing database schema and initial data...');
    await initializeAndSeedDatabase();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 AutoCare Hub Backend Running at http://localhost:${PORT}`);
      console.log(`📦 Database: server/data/autocare.db (100% Free / Zero-Cost)`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
