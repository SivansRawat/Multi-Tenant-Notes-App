// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const { initializeDatabase, seedDatabase } = require('./config/database');
// const authRoutes = require('./routes/auth');
// const notesRoutes = require('./routes/notes');
// const tenantRoutes = require('./routes/tenants');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // CORS configuration for Vercel deployment
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     // Allow all origins in development
//     if (process.env.NODE_ENV !== 'production') {
//       return callback(null, true);
//     }

//     // In production, allow specific origins
//     const allowedOrigins = [
//       'https://your-frontend-domain.vercel.app',
//       'http://localhost:3000',
//       'http://localhost:3001'
//     ];

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(null, true); // Allow all for now
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   optionsSuccessStatus: 200
// };

// // Middleware
// app.use(cors(corsOptions));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/notes', notesRoutes);
// app.use('/api/tenants', tenantRoutes);

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Multi-Tenant SaaS Notes API',
//     version: '1.0.0',
//     endpoints: {
//       health: '/health',
//       auth: '/api/auth',
//       notes: '/api/notes',
//       tenants: '/api/tenants'
//     }
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // Initialize database and start server
// const startServer = async () => {
//   try {
//     console.log('Initializing database...');
//     await initializeDatabase();
//     await seedDatabase();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`Health check: http://localhost:${PORT}/health`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// };

// // Start the server
// if (require.main === module) {
//   startServer();
// }

// module.exports = app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, seedDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantRoutes = require('./routes/tenants');

const app = express();

// -------------------- CORS CONFIG --------------------
const allowedOrigins = [
  'https://notesfrontend-blond.vercel.app', // deployed frontend
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// -------------------- EXPORT FOR VERCEL --------------------
let isDbInitialized = false;

const handler = async (req, res) => {
  if (!isDbInitialized) {
    console.log('Initializing database...');
    await initializeDatabase();
    await seedDatabase();
    isDbInitialized = true;
  }
  return app(req, res);
};

module.exports = handler;
