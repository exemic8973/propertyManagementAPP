import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';

// Get all properties for the current user
export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let query = `
      SELECT p.*, 
        COUNT(u.id) as unit_count,
        COUNT(CASE WHEN u.is_occupied = true THEN 1 END) as occupied_units
      FROM properties p
      LEFT JOIN units u ON p.id = u.property_id
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    // Filter based on user role
    if (userRole === 'landlord') {
      query += ` AND p.owner_id = $1`;
      params.push(userId);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      properties: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to get properties' });
  }
};

// Get a single property by ID
export const getProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const propertyResult = await pool.query(
      `SELECT p.*, 
        json_agg(
          json_build_object(
            'id', u.id,
            'unit_number', u.unit_number,
            'unit_type', u.unit_type,
            'bedrooms', u.bedrooms,
            'bathrooms', u.bathrooms,
            'square_footage', u.square_footage,
            'rent_amount', u.rent_amount,
            'is_occupied', u.is_occupied
          )
        ) FILTER (WHERE u.id IS NOT NULL) as units
       FROM properties p
       LEFT JOIN units u ON p.id = u.property_id
       WHERE p.id = $1 AND p.is_active = true
       GROUP BY p.id`,
      [id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyResult.rows[0];

    // Check access permissions
    if (userRole === 'landlord' && property.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
};

// Create a new property
export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only landlords and property managers can create properties
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied. Only landlords and property managers can create properties.' });
    }

    const {
      name,
      address,
      city,
      state,
      zip_code,
      country,
      property_type,
      total_units,
      year_built,
      square_footage,
      description,
      amenities,
      purchase_price,
      purchase_date
    } = req.body;

    // Validate required fields
    if (!name || !address || !city || !state || !zip_code || !property_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'address', 'city', 'state', 'zip_code', 'property_type']
      });
    }

    // Validate property type
    const validTypes = ['residential', 'commercial', 'mixed_use'];
    if (!validTypes.includes(property_type)) {
      return res.status(400).json({
        error: 'Invalid property type',
        validTypes
      });
    }

    const result = await pool.query(
      `INSERT INTO properties (
        owner_id, name, address, city, state, zip_code, country,
        property_type, total_units, year_built, square_footage,
        description, amenities, purchase_price, purchase_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        userId, name, address, city, state, zip_code, country || 'USA',
        property_type, total_units || 1, year_built, square_footage,
        description, amenities, purchase_price, purchase_date
      ]
    );

    const property = result.rows[0];

    // Create a default unit for single-unit properties
    if (!total_units || total_units === 1) {
      await pool.query(
        `INSERT INTO units (property_id, unit_number, unit_type, rent_amount)
         VALUES ($1, '1', 'studio', 0)`,
        [property.id]
      );
    }

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

// Update a property
export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if property exists and user has access
    const checkResult = await pool.query(
      'SELECT owner_id FROM properties WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (userRole === 'landlord' && checkResult.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      name, address, city, state, zip_code, country,
      property_type, total_units, year_built, square_footage,
      description, amenities, purchase_price, purchase_date, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE properties SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        zip_code = COALESCE($5, zip_code),
        country = COALESCE($6, country),
        property_type = COALESCE($7, property_type),
        total_units = COALESCE($8, total_units),
        year_built = COALESCE($9, year_built),
        square_footage = COALESCE($10, square_footage),
        description = COALESCE($11, description),
        amenities = COALESCE($12, amenities),
        purchase_price = COALESCE($13, purchase_price),
        purchase_date = COALESCE($14, purchase_date),
        is_active = COALESCE($15, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        name, address, city, state, zip_code, country,
        property_type, total_units, year_built, square_footage,
        description, amenities, purchase_price, purchase_date, is_active, id
      ]
    );

    res.json({
      message: 'Property updated successfully',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

// Delete a property (soft delete)
export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if property exists and belongs to user
    const checkResult = await pool.query(
      'SELECT owner_id FROM properties WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (checkResult.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for active leases
    const leaseCheck = await pool.query(
      `SELECT COUNT(*) FROM leases l
       JOIN units u ON l.unit_id = u.id
       WHERE u.property_id = $1 AND l.status = 'active'`,
      [id]
    );

    if (parseInt(leaseCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete property with active leases. Please terminate all leases first.'
      });
    }

    // Soft delete
    await pool.query(
      'UPDATE properties SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

// Get property statistics
export const getPropertyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereClause = 'WHERE p.is_active = true';
    const params: any[] = [];

    if (userRole === 'landlord') {
      whereClause += ' AND p.owner_id = $1';
      params.push(userId);
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(DISTINCT p.id) as total_properties,
        COUNT(DISTINCT u.id) as total_units,
        COUNT(DISTINCT CASE WHEN u.is_occupied = true THEN u.id END) as occupied_units,
        COALESCE(SUM(CASE WHEN u.is_occupied = true THEN u.rent_amount ELSE 0 END), 0) as monthly_revenue
      FROM properties p
      LEFT JOIN units u ON p.id = u.property_id
      ${whereClause}`,
      params
    );

    res.json({
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({ error: 'Failed to get property statistics' });
  }
};
