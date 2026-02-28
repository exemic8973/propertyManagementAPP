import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';

// Get all templates for user
export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search } = req.query;

    let query = `
      SELECT * FROM lease_templates 
      WHERE (user_id = $1 OR is_public = true)
    `;
    const params: any[] = [userId];
    let paramCount = 2;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY is_public, created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
};

// Get single template
export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT * FROM lease_templates 
       WHERE id = $1 AND (user_id = $2 OR is_public = true)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
};

// Create template
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, description, templateData, isPublic } = req.body;

    if (!name || !templateData) {
      return res.status(400).json({ error: 'Name and template data are required' });
    }

    const result = await pool.query(
      `INSERT INTO lease_templates (user_id, name, description, template_data, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, description || '', JSON.stringify(templateData), isPublic || false]
    );

    res.status(201).json({ template: result.rows[0] });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Update template
export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description, templateData, isPublic } = req.body;

    // Check ownership
    const checkResult = await pool.query(
      'SELECT * FROM lease_templates WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or you do not have permission to edit it' });
    }

    const result = await pool.query(
      `UPDATE lease_templates 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           template_data = COALESCE($3, template_data),
           is_public = COALESCE($4, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, templateData ? JSON.stringify(templateData) : null, isPublic, id]
    );

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const checkResult = await pool.query(
      'SELECT * FROM lease_templates WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or you do not have permission to delete it' });
    }

    await pool.query('DELETE FROM lease_templates WHERE id = $1', [id]);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// Duplicate template
export const duplicateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get original template
    const originalResult = await pool.query(
      `SELECT * FROM lease_templates 
       WHERE id = $1 AND (user_id = $2 OR is_public = true)`,
      [id, userId]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const original = originalResult.rows[0];

    // Create duplicate
    const result = await pool.query(
      `INSERT INTO lease_templates (user_id, name, description, template_data, is_public)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
      [userId, `${original.name} (Copy)`, original.description, original.template_data]
    );

    res.status(201).json({ template: result.rows[0] });
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
};

// Get default template for user
export const getDefaultTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's default template ID
    const userResult = await pool.query(
      'SELECT default_template_id FROM users WHERE id = $1',
      [userId]
    );

    const defaultTemplateId = userResult.rows[0]?.default_template_id;

    if (!defaultTemplateId) {
      return res.json({ template: null });
    }

    const result = await pool.query(
      `SELECT * FROM lease_templates 
       WHERE id = $1 AND (user_id = $2 OR is_public = true)`,
      [defaultTemplateId, userId]
    );

    res.json({ template: result.rows[0] || null });
  } catch (error) {
    console.error('Get default template error:', error);
    res.status(500).json({ error: 'Failed to get default template' });
  }
};

// Set default template for user
export const setDefaultTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify template exists and user has access
    if (id !== 'null') {
      const templateResult = await pool.query(
        `SELECT * FROM lease_templates 
         WHERE id = $1 AND (user_id = $2 OR is_public = true)`,
        [id, userId]
      );

      if (templateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
    }

    await pool.query(
      'UPDATE users SET default_template_id = $1 WHERE id = $2',
      [id === 'null' ? null : id, userId]
    );

    res.json({ message: 'Default template updated' });
  } catch (error) {
    console.error('Set default template error:', error);
    res.status(500).json({ error: 'Failed to set default template' });
  }
};
