import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes/api.js';
import { getDb } from './db/connection.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Restrict CORS origins to authorized frontend clients
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultAllowedOrigins;

const isOriginAllowed = (origin: string): boolean => {
  if (process.env.DEMO_MODE === 'true') return true;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    if (parsed.hostname.endsWith('.onrender.com')) return true;
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return true;
  } catch {
    // If not a parseable URL, fall back to exact match
  }
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or valid origins
    if (!origin || isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Reject gracefully without throwing an unhandled 500 Error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role', 'X-Persona-Id', 'x-persona-id', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Generous body limit for image/document base64 upload
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize DB schema & connection
const db = getDb();

// Auto-seed initial demo data if database is newly initialized
try {
  const schemeCount = db.prepare("SELECT count(*) as count FROM schemes").get() as { count: number };
  if (!schemeCount || schemeCount.count === 0) {
    console.log('Fresh database detected. Auto-seeding initial schemes and demo data...');
    const { runSeed } = await import('./db/seed.js');
    runSeed(db);
  }
} catch (err) {
  console.warn('Auto-seed check notice:', err);
}

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MoTA AI-Enabled Scholarship Management Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend SPA in production if client build exists
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist')
];
const clientDistPath = clientDistCandidates.find(candidate => fs.existsSync(candidate));

if (clientDistPath) {
  console.log(`Serving static client bundle from: ${clientDistPath}`);
  app.use(express.static(clientDistPath, {
    maxAge: '1d'
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    // Never send HTML for missing assets or files with extensions
    if (req.path.startsWith('/assets/') || path.extname(req.path)) {
      return res.status(404).type('text/plain').send('Asset not found');
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

// Global JSON error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`MoTA Scholarship Platform Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
