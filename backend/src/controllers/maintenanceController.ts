import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';

// Get all maintenance requests
export const getMaintenanceRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, priority, property_id } = req.query;

    let query = `
      SELECT mr.*,
        p.name as property_name,
        p.address as property_address,
        u.unit_number,
        t.first_name as tenant_first_name,
        t.last_name as tenant_last_name,
        au.first_name as assigned_first_name,
        au.last_name as assigned_last_name
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.id
      LEFT JOIN units u ON mr.unit_id = u.id
      LEFT JOIN tenants t ON mr.tenant_id = t.id
      LEFT JOIN users au ON mr.assigned_to = au.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Filter based on user role
    if (userRole === 'landlord') {
      query += ` AND p.owner_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (userRole === 'tenant') {
      query += ` AND mr.tenant_id = (SELECT id FROM tenants WHERE user_id = $${paramCount})`;
      params.push(userId);
      paramCount++;
    }

    // Filter by status
    if (status) {
      query += ` AND mr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by priority
    if (priority) {
      query += ` AND mr.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    // Filter by property
    if (property_id) {
      query += ` AND mr.property_id = $${paramCount}`;
      params.push(property_id);
      paramCount++;
    }

    query += ` ORDER BY 
      CASE mr.priority 
        WHEN 'emergency' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      mr.created_at DESC
    `;

    const result = await pool.query(query, params);

    // Transform results
    const requests = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      estimated_cost: row.estimated_cost,
      actual_cost: row.actual_cost,
      photos: row.photos,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assigned_at: row.assigned_at,
      completed_at: row.completed_at,
      property: {
        id: row.property_id,
        name: row.property_name,
        address: row.property_address
      },
      unit: row.unit_id ? {
        id: row.unit_id,
        unit_number: row.unit_number
      } : null,
      tenant: row.tenant_id ? {
        id: row.tenant_id,
        first_name: row.tenant_first_name,
        last_name: row.tenant_last_name
      } : null,
      assigned_to: row.assigned_to ? {
        id: row.assigned_to,
        first_name: row.assigned_first_name,
        last_name: row.assigned_last_name
      } : null
    }));

    res.json({
      requests,
      total: requests.length
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ error: 'Failed to get maintenance requests' });
  }
};

// Get a single maintenance request
export const getMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT mr.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'address', p.address
        ) as property,
        json_build_object(
          'id', u.id,
          'unit_number', u.unit_number
        ) as unit,
        json_build_object(
          'id', t.id,
          'first_name', t.first_name,
          'last_name', t.last_name,
          'phone', t.phone
        ) as tenant,
        json_build_object(
          'id', au.id,
          'first_name', au.first_name,
          'last_name', au.last_name
        ) as assigned_to
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.id
      LEFT JOIN units u ON mr.unit_id = u.id
      LEFT JOIN tenants t ON mr.tenant_id = t.id
      LEFT JOIN users au ON mr.assigned_to = au.id
      WHERE mr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    const request = result.rows[0];

    // Check access permissions
    if (userRole === 'landlord') {
      const propertyCheck = await pool.query(
        'SELECT owner_id FROM properties WHERE id = $1',
        [request.property_id]
      );
      if (propertyCheck.rows[0]?.owner_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'tenant') {
      const tenantCheck = await pool.query(
        'SELECT id FROM tenants WHERE user_id = $1',
        [userId]
      );
      if (tenantCheck.rows.length === 0 || tenantCheck.rows[0].id !== request.tenant_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ request });
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({ error: 'Failed to get maintenance request' });
  }
};

// Create a maintenance request
export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const {
      property_id,
      unit_id,
      title,
      description,
      category,
      priority,
      estimated_cost,
      photos,
      notes
    } = req.body;

    // Validate required fields
    if (!property_id || !title || !description || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['property_id', 'title', 'description', 'category']
      });
    }

    // Validate category
    const validCategories = ['plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'landscaping', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories
      });
    }

    // Get tenant_id if user is a tenant
    let tenant_id = req.body.tenant_id;
    if (userRole === 'tenant') {
      const tenantResult = await pool.query(
        'SELECT id FROM tenants WHERE user_id = $1',
        [userId]
      );
      if (tenantResult.rows.length > 0) {
        tenant_id = tenantResult.rows[0].id;
      }
    }

    // Verify property exists and user has access
    const propertyCheck = await pool.query(
      'SELECT id, owner_id FROM properties WHERE id = $1 AND is_active = true',
      [property_id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (userRole === 'landlord' && propertyCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this property' });
    }

    const result = await pool.query(
      `INSERT INTO maintenance_requests (
        property_id, unit_id, tenant_id, title, description,
        category, priority, estimated_cost, photos, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
      RETURNING *`,
      [
        property_id, unit_id, tenant_id, title, description,
        category, priority || 'medium', estimated_cost, photos, notes
      ]
    );

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
};

// Update a maintenance request
export const updateMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if request exists
    const checkResult = await pool.query(
      `SELECT mr.*, p.owner_id 
       FROM maintenance_requests mr
       JOIN properties p ON mr.property_id = p.id
       WHERE mr.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    const request = checkResult.rows[0];

    // Check permissions
    if (userRole === 'landlord' && request.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      title, description, category, priority, status,
      assigned_to, estimated_cost, actual_cost, photos, notes
    } = req.body;

    // Handle status changes
    let assigned_at = request.assigned_at;
    let completed_at = request.completed_at;

    if (assigned_to && !request.assigned_to) {
      assigned_at = new Date();
    }

    if (status === 'completed' && request.status !== 'completed') {
      completed_at = new Date();
    }

    const result = await pool.query(
      `UPDATE maintenance_requests SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        assigned_to = COALESCE($6, assigned_to),
        assigned_at = $7,
        completed_at = $8,
        estimated_cost = COALESCE($9, estimated_cost),
        actual_cost = COALESCE($10, actual_cost),
        photos = COALESCE($11, photos),
        notes = COALESCE($12, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        title, description, category, priority, status,
        assigned_to, assigned_at, completed_at,
        estimated_cost, actual_cost, photos, notes, id
      ]
    );

    res.json({
      message: 'Maintenance request updated successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
};

// Delete a maintenance request
export const deleteMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if request exists and user owns the property
    const checkResult = await pool.query(
      `SELECT mr.id, p.owner_id 
       FROM maintenance_requests mr
       JOIN properties p ON mr.property_id = p.id
       WHERE mr.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    if (checkResult.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM maintenance_requests WHERE id = $1', [id]);

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance request' });
  }
};

// Assign maintenance request to someone
export const assignMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }

    // Verify the assigned user exists and has appropriate role
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role IN ($2, $3) AND is_active = true',
      [assigned_to, 'landlord', 'property_manager']
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid user to assign' });
    }

    const result = await pool.query(
      `UPDATE maintenance_requests 
       SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    res.json({
      message: 'Maintenance request assigned successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Assign maintenance request error:', error);
    res.status(500).json({ error: 'Failed to assign maintenance request' });
  }
};

// Get maintenance statistics
export const getMaintenanceStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereClause = '';
    const params: any[] = [];

    if (userRole === 'landlord') {
      whereClause = 'WHERE p.owner_id = $1';
      params.push(userId);
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_requests,
        COUNT(CASE WHEN mr.status = 'open' THEN 1 END) as open_requests,
        COUNT(CASE WHEN mr.status = 'in_progress' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN mr.status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN mr.priority = 'emergency' THEN 1 END) as emergency_requests,
        COALESCE(SUM(mr.actual_cost), 0) as total_cost
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.id
      ${whereClause}`,
      params
    );

    res.json({
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({ error: 'Failed to get maintenance statistics' });
  }
};
