// const express = require('express');
// const { pool } = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');
// const { extractTenant, validateTenantAccess } = require('../middleware/tenant');
// const { requireAdmin } = require('../middleware/rbac');
// const router = express.Router();

// // Apply middleware to all routes
// router.use(authenticateToken);

// // Upgrade tenant subscription
// router.post('/:slug/upgrade', requireAdmin, async (req, res) => {
//   try {
//     const { slug } = req.params;

//     // Verify the tenant exists and user has admin access
//     const tenantResult = await pool.query(
//       'SELECT * FROM tenants WHERE slug = $1',
//       [slug]
//     );

//     if (tenantResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Tenant not found' });
//     }

//     const tenant = tenantResult.rows[0];

//     // Check if user is admin of this tenant
//     if (req.user.tenant_id !== tenant.id) {
//       return res.status(403).json({ error: 'Access denied to this tenant' });
//     }

//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Only admins can upgrade subscriptions' });
//     }

//     // Update tenant plan to pro
//     const updateResult = await pool.query(`
//       UPDATE tenants 
//       SET plan = 'pro' 
//       WHERE id = $1 
//       RETURNING id, name, slug, plan
//     `, [tenant.id]);

//     res.json({
//       tenant: updateResult.rows[0],
//       message: 'Tenant upgraded to Pro plan successfully'
//     });
//   } catch (error) {
//     console.error('Upgrade tenant error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get tenant information
// router.get('/:slug', async (req, res) => {
//   try {
//     const { slug } = req.params;

//     const tenantResult = await pool.query(
//       'SELECT id, name, slug, plan, created_at FROM tenants WHERE slug = $1',
//       [slug]
//     );

//     if (tenantResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Tenant not found' });
//     }

//     const tenant = tenantResult.rows[0];

//     // Check if user has access to this tenant
//     if (req.user.tenant_id !== tenant.id) {
//       return res.status(403).json({ error: 'Access denied to this tenant' });
//     }

//     // Get note count for the tenant
//     const noteCountResult = await pool.query(
//       'SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1',
//       [tenant.id]
//     );

//     const noteCount = parseInt(noteCountResult.rows[0].count);

//     res.json({
//       tenant: {
//         ...tenant,
//         note_count: noteCount,
//         note_limit: tenant.plan === 'free' ? 3 : null
//       }
//     });
//   } catch (error) {
//     console.error('Get tenant error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;




const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Preflight OPTIONS handling
router.options('*', (req, res) => res.sendStatus(200));

// Upgrade tenant subscription
router.post('/:slug/upgrade', requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;

    const tenantResult = await pool.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
    if (tenantResult.rows.length === 0) return res.status(404).json({ error: 'Tenant not found' });

    const tenant = tenantResult.rows[0];
    if (req.user.tenant_id !== tenant.id) return res.status(403).json({ error: 'Access denied to this tenant' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can upgrade subscriptions' });

    const updateResult = await pool.query(`
      UPDATE tenants 
      SET plan = 'pro' 
      WHERE id = $1 
      RETURNING id, name, slug, plan
    `, [tenant.id]);

    res.json({ tenant: updateResult.rows[0], message: 'Tenant upgraded to Pro plan successfully' });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant info
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenantResult = await pool.query('SELECT id, name, slug, plan, created_at FROM tenants WHERE slug = $1', [slug]);
    if (tenantResult.rows.length === 0) return res.status(404).json({ error: 'Tenant not found' });

    const tenant = tenantResult.rows[0];
    if (req.user.tenant_id !== tenant.id) return res.status(403).json({ error: 'Access denied to this tenant' });

    const noteCountResult = await pool.query('SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1', [tenant.id]);
    const noteCount = parseInt(noteCountResult.rows[0].count);

    res.json({ tenant: { ...tenant, note_count: noteCount, note_limit: tenant.plan === 'free' ? 3 : null } });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
