// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../config/database');
// const router = express.Router();

// // Login endpoint
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     // Get user with tenant information
//     const userResult = await pool.query(`
//       SELECT u.id, u.email, u.password, u.role, u.tenant_id, 
//              t.slug as tenant_slug, t.plan as tenant_plan, t.name as tenant_name
//       FROM users u
//       JOIN tenants t ON u.tenant_id = t.id
//       WHERE u.email = $1
//     `, [email]);

//     if (userResult.rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = userResult.rows[0];
//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user.id, tenantId: user.tenant_id },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     // Return user data without password
//     const { password: _, ...userWithoutPassword } = user;

//     res.json({
//       token,
//       user: userWithoutPassword,
//       message: 'Login successful'
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get current user endpoint
// router.get('/me', async (req, res) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Access token required' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const userResult = await pool.query(`
//       SELECT u.id, u.email, u.role, u.tenant_id, 
//              t.slug as tenant_slug, t.plan as tenant_plan, t.name as tenant_name
//       FROM users u
//       JOIN tenants t ON u.tenant_id = t.id
//       WHERE u.id = $1
//     `, [decoded.userId]);

//     if (userResult.rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid token' });
//     }

//     res.json({ user: userResult.rows[0] });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(401).json({ error: 'Invalid token' });
//   }
// });

// module.exports = router;



const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// -------------------- CORS --------------------
const allowedOrigins = ['https://notesfrontend-blond.vercel.app', 'http://localhost:3000', 'http://localhost:3001'];

router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const userResult = await pool.query(`
      SELECT u.id, u.email, u.password, u.role, u.tenant_id, 
             t.slug as tenant_slug, t.plan as tenant_plan, t.name as tenant_name
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1
    `, [email]);

    if (!userResult.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, tenantId: user.tenant_id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------- GET CURRENT USER --------------------
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await pool.query(`
      SELECT u.id, u.email, u.role, u.tenant_id, 
             t.slug as tenant_slug, t.plan as tenant_plan, t.name as tenant_name
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
    `, [decoded.userId]);

    if (!userResult.rows.length) return res.status(401).json({ error: 'Invalid token' });
    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
