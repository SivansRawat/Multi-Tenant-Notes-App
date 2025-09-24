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
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, seedDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantRoutes = require('./routes/tenants');

const app = express();

const allowedOrigins = [
  'https://notesfrontend-blond.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow tools like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle OPTIONS preflight

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tenants', tenantRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Tenant SaaS Notes API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      notes: '/api/notes',
      tenants: '/api/tenants',
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Always send CORS headers on errors too
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

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

let isDbInitialized = false;

// Start server handler for Vercel serverless
const handler = async (req, res) => {
  if (!isDbInitialized) {
    console.log('Initializing database...');
    await initializeDatabase();
    await seedDatabase();
    isDbInitialized = true;
  }

  // Explicitly respond to OPTIONS preflight for Vercel
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  return app(req, res);
};

module.exports = handler;

// For local testing with standalone server
if (require.main === module) {
  (async () => {
    if (!isDbInitialized) {
      await initializeDatabase();
      await seedDatabase();
      isDbInitialized = true;
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })();
}
