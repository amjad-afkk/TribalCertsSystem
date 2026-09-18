import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { getDb } from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend Vite client with full header & origin support
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role', 'X-Persona-Id', 'x-persona-id', 'Accept', 'Origin', 'X-Requested-With']
}));

// Preflight handler for all routes
app.options('*', cors());

// Generous body limit for image/document base64 upload
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize DB schema & connection
getDb();

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

app.listen(PORT, () => {
  console.log(`MoTA Scholarship Platform Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
