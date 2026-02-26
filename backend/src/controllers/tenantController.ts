import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';

// Get all tenants
export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let query = `
      SELECT t.*, 
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        l.id as lease_id,
        l.start_date as lease_start_date,
        l.end_date as lease_end_date,
        l.monthly_rent as rent_amount,
        p.name as property_name,
        p.address as property_address,
        un.unit_number
      FROM tenants t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON l.property_id = p.id
      WHERE t.is_active = true
    `;
    const params: any[] = [];

    // Filter based on user role
    if (userRole === 'landlord') {
      query += ` AND (l.landlord_id = $1 OR l.landlord_id IS NULL)`;
      params.push(userId);
    } else if (userRole === 'tenant') {
      // Tenants can only see their own data
      query += ` AND t.user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);

    // Transform the result to have a cleaner structure
    const tenants = result.rows.map(row => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      date_of_birth: row.date_of_birth,
      employment_status: row.employment_status,
      employer_name: row.employer_name,
      monthly_income: row.monthly_income,
      credit_score: row.credit_score,
      background_check_status: row.background_check_status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      lease: row.lease_id ? {
        id: row.lease_id,
        start_date: row.lease_start_date,
        end_date: row.lease_end_date,
        rent_amount: row.rent_amount,
        property_name: row.property_name,
        property_address: row.property_address,
        unit_number: row.unit_number
      } : null
    }));

    res.json({
      tenants,
      total: tenants.length
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Failed to get tenants' });
  }
};

// Get a single tenant by ID
export const getTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT t.*, 
        json_build_object(
          'id', l.id,
          'start_date', l.start_date,
          'end_date', l.end_date,
          'monthly_rent', l.monthly_rent,
          'status', l.status,
          'property', json_build_object(
            'id', p.id,
            'name', p.name,
            'address', p.address
          ),
          'unit', json_build_object(
            'id', un.id,
            'unit_number', un.unit_number
          )
        ) as lease
       FROM tenants t
       LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
       LEFT JOIN units un ON l.unit_id = un.id
       LEFT JOIN properties p ON l.property_id = p.id
       WHERE t.id = $1 AND t.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = result.rows[0];

    // Check access permissions for tenants
    if (userRole === 'tenant' && tenant.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ tenant });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
};

// Create a new tenant
export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only landlords and property managers can create tenants
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      ssn_last_four,
      driver_license,
      emergency_contact_name,
      emergency_contact_phone,
      employment_status,
      employer_name,
      monthly_income,
      credit_score,
      background_check_status,
      notes
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['first_name', 'last_name', 'email']
      });
    }

    // Check if tenant with email already exists
    const existingTenant = await pool.query(
      'SELECT id FROM tenants WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingTenant.rows.length > 0) {
      return res.status(409).json({ error: 'A tenant with this email already exists' });
    }

    const result = await pool.query(
      `INSERT INTO tenants (
        first_name, last_name, email, phone, date_of_birth,
        ssn_last_four, driver_license, emergency_contact_name,
        emergency_contact_phone, employment_status, employer_name,
        monthly_income, credit_score, background_check_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        first_name, last_name, email.toLowerCase(), phone, date_of_birth,
        ssn_last_four, driver_license, emergency_contact_name,
        emergency_contact_phone, employment_status, employer_name,
        monthly_income, credit_score, background_check_status || 'pending', notes
      ]
    );

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: result.rows[0]
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
};

// Update a tenant
export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if tenant exists
    const checkResult = await pool.query(
      'SELECT * FROM tenants WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Tenants can only update their own profile with limited fields
    if (userRole === 'tenant') {
      const tenant = checkResult.rows[0];
      if (tenant.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Tenants can only update certain fields
      const { phone, emergency_contact_name, emergency_contact_phone } = req.body;
      
      const result = await pool.query(
        `UPDATE tenants SET
          phone = COALESCE($1, phone),
          emergency_contact_name = COALESCE($2, emergency_contact_name),
          emergency_contact_phone = COALESCE($3, emergency_contact_phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *`,
        [phone, emergency_contact_name, emergency_contact_phone, id]
      );

      return res.json({
        message: 'Tenant updated successfully',
        tenant: result.rows[0]
      });
    }

    // Landlords and property managers can update all fields
    const {
      first_name, last_name, email, phone, date_of_birth,
      ssn_last_four, driver_license, emergency_contact_name,
      emergency_contact_phone, employment_status, employer_name,
      monthly_income, credit_score, background_check_status, notes
    } = req.body;

    // Check email uniqueness if changing
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM tenants WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'A tenant with this email already exists' });
      }
    }

    const result = await pool.query(
      `UPDATE tenants SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        date_of_birth = COALESCE($5, date_of_birth),
        ssn_last_four = COALESCE($6, ssn_last_four),
        driver_license = COALESCE($7, driver_license),
        emergency_contact_name = COALESCE($8, emergency_contact_name),
        emergency_contact_phone = COALESCE($9, emergency_contact_phone),
        employment_status = COALESCE($10, employment_status),
        employer_name = COALESCE($11, employer_name),
        monthly_income = COALESCE($12, monthly_income),
        credit_score = COALESCE($13, credit_score),
        background_check_status = COALESCE($14, background_check_status),
        notes = COALESCE($15, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        first_name, last_name, email ? email.toLowerCase() : email, phone, date_of_birth,
        ssn_last_four, driver_license, emergency_contact_name,
        emergency_contact_phone, employment_status, employer_name,
        monthly_income, credit_score, background_check_status, notes, id
      ]
    );

    res.json({
      message: 'Tenant updated successfully',
      tenant: result.rows[0]
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
};

// Delete a tenant (soft delete)
export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tenant has active lease
    const leaseCheck = await pool.query(
      'SELECT id FROM leases WHERE tenant_id = $1 AND status = $2',
      [id, 'active']
    );

    if (leaseCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete tenant with active lease. Please terminate the lease first.'
      });
    }

    // Soft delete
    await pool.query(
      'UPDATE tenants SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
};

// Get tenant statistics
export const getTenantStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereClause = 'WHERE t.is_active = true';
    const params: any[] = [];

    if (userRole === 'landlord') {
      whereClause += ` AND (l.landlord_id = $1 OR l.landlord_id IS NULL)`;
      params.push(userId);
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(DISTINCT t.id) as total_tenants,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN t.id END) as active_tenants,
        COUNT(DISTINCT CASE WHEN t.background_check_status = 'pending' THEN t.id END) as pending_background_checks
      FROM tenants t
      LEFT JOIN leases l ON t.id = l.tenant_id
      ${whereClause}`,
      params
    );

    res.json({
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({ error: 'Failed to get tenant statistics' });
  }
};
