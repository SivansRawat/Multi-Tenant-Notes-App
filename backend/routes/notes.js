const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { extractTenant, validateTenantAccess } = require('../middleware/tenant');
const { requireMember } = require('../middleware/rbac');
const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(validateTenantAccess);

// Get all notes for the current tenant
router.get('/', requireMember, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
             u.email as created_by
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.tenant_id = $1
      ORDER BY n.updated_at DESC
    `, [req.user.tenant_id]);

    res.json({ notes: result.rows });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific note
router.get('/:id', requireMember, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
             u.email as created_by
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.id = $1 AND n.tenant_id = $2
    `, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: result.rows[0] });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/', requireMember, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check subscription limits for free plan
    if (req.user.tenant_plan === 'free') {
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1',
        [req.user.tenant_id]
      );

      const noteCount = parseInt(countResult.rows[0].count);
      if (noteCount >= 3) {
        return res.status(403).json({ 
          error: 'Free plan limit reached. Maximum 3 notes allowed.',
          code: 'PLAN_LIMIT_REACHED'
        });
      }
    }

    const result = await pool.query(`
      INSERT INTO notes (tenant_id, user_id, title, content, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, title, content, created_at, updated_at
    `, [req.user.tenant_id, req.user.id, title, content]);

    res.status(201).json({ 
      note: result.rows[0],
      message: 'Note created successfully'
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await pool.query(`
      UPDATE notes 
      SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
      RETURNING id, title, content, created_at, updated_at
    `, [title, content, id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ 
      note: result.rows[0],
      message: 'Note updated successfully'
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', requireMember, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

