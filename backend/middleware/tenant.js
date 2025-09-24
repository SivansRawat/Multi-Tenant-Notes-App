const { pool } = require('../config/database');

const extractTenant = async (req, res, next) => {
  try {
    // Extract tenant from different sources
    let tenantSlug = null;

    // Check if tenant is in URL parameters
    if (req.params.tenantSlug) {
      tenantSlug = req.params.tenantSlug;
    }
    // Check if tenant is in the authenticated user context
    else if (req.user && req.user.tenant_slug) {
      tenantSlug = req.user.tenant_slug;
    }
    // Check subdomain (if using subdomain-based routing)
    else {
      const host = req.get('host');
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain !== 'www' && subdomain !== 'api') {
          tenantSlug = subdomain;
        }
      }
    }

    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant not specified' });
    }

    // Get tenant information
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE slug = $1',
      [tenantSlug]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    req.tenant = tenantResult.rows[0];
    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const validateTenantAccess = (req, res, next) => {
  // Ensure user belongs to the requested tenant
  if (req.user && req.tenant) {
    if (req.user.tenant_id !== req.tenant.id) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }
  }
  next();
};

module.exports = { extractTenant, validateTenantAccess };
