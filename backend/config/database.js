const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database schema initialization
const initializeDatabase = async () => {
  try {
    // Create tenants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_tenant_id ON notes(tenant_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Insert default tenants and users
const seedDatabase = async () => {
  try {
    // Insert tenants
    const acmeTenant = await pool.query(`
      INSERT INTO tenants (name, slug, plan) 
      VALUES ('Acme Corporation', 'acme', 'free') 
      ON CONFLICT (slug) DO NOTHING 
      RETURNING id
    `);

    const globexTenant = await pool.query(`
      INSERT INTO tenants (name, slug, plan) 
      VALUES ('Globex Corporation', 'globex', 'free') 
      ON CONFLICT (slug) DO NOTHING 
      RETURNING id
    `);

    // Get tenant IDs
    const acmeId = acmeTenant.rows[0]?.id || (await pool.query("SELECT id FROM tenants WHERE slug = 'acme'")).rows[0].id;
    const globexId = globexTenant.rows[0]?.id || (await pool.query("SELECT id FROM tenants WHERE slug = 'globex'")).rows[0].id;

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password', 10);

    // Insert test users
    const testUsers = [
      { tenant_id: acmeId, email: 'admin@acme.test', role: 'admin' },
      { tenant_id: acmeId, email: 'user@acme.test', role: 'member' },
      { tenant_id: globexId, email: 'admin@globex.test', role: 'admin' },
      { tenant_id: globexId, email: 'user@globex.test', role: 'member' }
    ];

    for (const user of testUsers) {
      await pool.query(`
        INSERT INTO users (tenant_id, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (email) DO NOTHING
      `, [user.tenant_id, user.email, hashedPassword, user.role]);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { pool, initializeDatabase, seedDatabase };
