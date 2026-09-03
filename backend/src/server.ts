import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { User } from './models/User';
import { seedDatabase } from './utils/seedData';

const app = express();

app.use(
  cors({
    origin: config.clientUrl || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CRM Sales Management System API is running' });
});

// API Routes
app.use('/api', routes);

// Determine frontend dist path reliably in both dev and production
const candidatePaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];

const frontendDistPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
console.log(`[STATIC] Serving frontend from: ${frontendDistPath} (exists: ${fs.existsSync(frontendDistPath)})`);

app.use(express.static(frontendDistPath));

// Handle React SPA client routing (fallback to index.html for non-API requests)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is fresh/empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[SEED] Empty database detected. Auto-seeding initial CRM data...');
      await seedDatabase();
    }

    app.listen(config.port, () => {
      console.log(`[SERVER] Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`[HEALTH] Health Check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('[ERROR] Server startup error:', error);
    process.exit(1);
  }
};

startServer();
