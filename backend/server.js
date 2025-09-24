

// require('dotenv').config();
// const { initializeDatabase, seedDatabase } = require('./config/database');
// const authRoutes = require('./routes/auth');
// const notesRoutes = require('./routes/notes');
// const tenantRoutes = require('./routes/tenants');

// let isDbInitialized = false;

// // Initialize DB once per cold start
// const initDb = async () => {
//   if (!isDbInitialized) {
//     await initializeDatabase();
//     await seedDatabase();
//     isDbInitialized = true;
//   }
// };

// // Vercel serverless handler
// module.exports = async (req, res) => {
//   await initDb();

//   // -------------------- ROUTES --------------------
//   if (req.url.startsWith('/api/auth')) {
//     return authRoutes(req, res);
//   } else if (req.url.startsWith('/api/notes')) {
//     return notesRoutes(req, res);
//   } else if (req.url.startsWith('/api/tenants')) {
//     return tenantRoutes(req, res);
//   } else if (req.url === '/' || req.url === '/health') {
//     return res.status(200).json({
//       message: 'Multi-Tenant SaaS Notes API',
//       version: '1.0.0',
//       endpoints: {
//         health: '/health',
//         auth: '/api/auth',
//         notes: '/api/notes',
//         tenants: '/api/tenants'
//       }
//     });
//   }

//   return res.status(404).json({ error: 'Route not found' });
// };




const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, seedDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantRoutes = require('./routes/tenants');

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- CORS --------------------
const allowedOrigins = [
  'https://notesfrontend-blond.vercel.app', // deployed frontend
  'http://localhost:3000', // local dev
  'http://localhost:3001'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------- ROUTES --------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tenants', tenantRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Tenant SaaS Notes API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      notes: '/api/notes',
      tenants: '/api/tenants'
    }
  });
});

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.message && err.message.startsWith('CORS')) {
    res.status(403).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// -------------------- DB INIT + SERVER START --------------------
let isDbInitialized = false;

const startServer = async () => {
  try {
    if (!isDbInitialized) {
      console.log('Initializing database...');
      await initializeDatabase();
      await seedDatabase();
      isDbInitialized = true;
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if run locally
if (require.main === module) startServer();

// -------------------- EXPORT FOR VERCEL --------------------
module.exports = app;
