import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, emailTemplates } from '../services/emailService';
import { generateLeasePDF } from '../services/pdfService';

// Link expiration time (7 days in milliseconds)
const LINK_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

// Generate a unique lease number
const generateLeaseNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LEASE-${year}${month}-${random}`;
};

// Get all leases (includes both traditional and e-sign leases)
export const getLeases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, property_id } = req.query;

    // Query that includes both traditional leases (with tenant_id/property_id) 
    // and e-sign leases (with wizard_data but NULL tenant_id/property_id)
    let query = `
      SELECT l.*,
        COALESCE(t.first_name, l.wizard_data->'tenant'->>'firstName') as tenant_first_name,
        COALESCE(t.last_name, l.wizard_data->'tenant'->>'lastName') as tenant_last_name,
        COALESCE(t.email, l.wizard_data->'tenant'->>'email') as tenant_email,
        COALESCE(t.phone, l.wizard_data->'tenant'->>'phone') as tenant_phone,
        COALESCE(p.name, l.wizard_data->'property'->>'propertyName') as property_name,
        COALESCE(p.address, l.wizard_data->'property'->>'address') as property_address,
        p.city as property_city,
        p.state as property_state,
        p.zip_code as property_zip,
        u.unit_number,
        u.unit_type,
        land.first_name as landlord_first_name,
        land.last_name as landlord_last_name
      FROM leases l
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN units u ON l.unit_id = u.id
      JOIN users land ON l.landlord_id = land.id
      WHERE (l.is_template = false OR l.is_template IS NULL)
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Filter based on user role
    if (userRole === 'landlord') {
      query += ` AND l.landlord_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (userRole === 'tenant') {
      // Get tenant id for this user, or match by email in wizard_data
      const tenantResult = await pool.query(
        'SELECT id, email FROM tenants WHERE user_id = $1',
        [userId]
      );
      if (tenantResult.rows.length > 0) {
        query += ` AND (l.tenant_id = $${paramCount} OR l.wizard_data->'tenant'->>'email' = $${paramCount + 1})`;
        params.push(tenantResult.rows[0].id);
        params.push(tenantResult.rows[0].email);
        paramCount += 2;
      } else {
        return res.json({ leases: [], total: 0 });
      }
    }

    // Filter by status if provided
    if (status) {
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by property if provided
    if (property_id) {
      query += ` AND l.property_id = $${paramCount}`;
      params.push(property_id);
      paramCount++;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);

    // Transform results
    const leases = result.rows.map(row => ({
      id: row.id,
      lease_number: row.lease_number,
      start_date: row.start_date || row.wizard_data?.terms?.startDate,
      end_date: row.end_date || row.wizard_data?.terms?.endDate,
      monthly_rent: row.monthly_rent || row.wizard_data?.rent?.monthlyRent,
      security_deposit: row.security_deposit || row.wizard_data?.rent?.securityDeposit,
      status: row.status,
      pet_fee: row.pet_fee ?? row.wizard_data?.rent?.petRent ?? 0,
      pet_deposit: row.pet_deposit ?? row.wizard_data?.rent?.petDeposit ?? 0,
      utilities_included: row.utilities_included ?? false,
      parking_spaces: row.parking_spaces ?? row.wizard_data?.additional?.parkingSpaces ?? 0,
      auto_renew: row.auto_renew,
      created_at: row.created_at,
      wizard_data: row.wizard_data,
      is_esign: !row.tenant_id && row.wizard_data, // Flag for e-sign leases
      landlord_signed: row.landlord_signed,
      tenant_signed: row.tenant_signed,
      tenant: row.tenant_id ? {
        id: row.tenant_id,
        first_name: row.tenant_first_name,
        last_name: row.tenant_last_name,
        email: row.tenant_email,
        phone: row.tenant_phone
      } : {
        id: null,
        first_name: row.tenant_first_name,
        last_name: row.tenant_last_name,
        email: row.tenant_email,
        phone: row.tenant_phone
      },
      property: row.property_id ? {
        id: row.property_id,
        name: row.property_name,
        address: row.property_address,
        city: row.property_city,
        state: row.property_state,
        zip_code: row.property_zip,
        square_feet: row.wizard_data?.property?.squareFeet
      } : {
        id: null,
        name: row.property_name,
        address: row.property_address,
        city: row.wizard_data?.property?.city,
        state: row.wizard_data?.property?.state,
        zip_code: row.wizard_data?.property?.zip,
        square_feet: row.wizard_data?.property?.squareFeet
      },
      unit: row.unit_id ? {
        id: row.unit_id,
        unit_number: row.unit_number,
        unit_type: row.unit_type
      } : null,
      landlord: {
        id: row.landlord_id,
        first_name: row.landlord_first_name,
        last_name: row.landlord_last_name
      }
    }));

    res.json({
      leases,
      total: leases.length
    });
  } catch (error) {
    console.error('Get leases error:', error);
    res.status(500).json({ error: 'Failed to get leases' });
  }
};

// Get a single lease by ID
export const getLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Use LEFT JOINs to support e-sign leases with NULL tenant_id/property_id
    const result = await pool.query(
      `SELECT l.*,
        json_build_object(
          'id', t.id,
          'first_name', COALESCE(t.first_name, l.wizard_data->'tenant'->>'firstName'),
          'last_name', COALESCE(t.last_name, l.wizard_data->'tenant'->>'lastName'),
          'email', COALESCE(t.email, l.wizard_data->'tenant'->>'email'),
          'phone', COALESCE(t.phone, l.wizard_data->'tenant'->>'phone')
        ) as tenant,
        json_build_object(
          'id', p.id,
          'name', COALESCE(p.name, l.wizard_data->'property'->>'propertyName'),
          'address', COALESCE(p.address, l.wizard_data->'property'->>'address'),
          'city', p.city,
          'state', p.state,
          'zip_code', p.zip_code
        ) as property,
        json_build_object(
          'id', u.id,
          'unit_number', u.unit_number,
          'unit_type', u.unit_type,
          'bedrooms', u.bedrooms,
          'bathrooms', u.bathrooms
        ) as unit,
        json_build_object(
          'id', land.id,
          'first_name', land.first_name,
          'last_name', land.last_name,
          'email', land.email
        ) as landlord
      FROM leases l
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN units u ON l.unit_id = u.id
      JOIN users land ON l.landlord_id = land.id
      WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = result.rows[0];

    // Check access permissions
    if (userRole === 'landlord' && lease.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'tenant') {
      const tenantResult = await pool.query(
        'SELECT id, email FROM tenants WHERE user_id = $1',
        [userId]
      );
      const tenantId = tenantResult.rows[0]?.id;
      const tenantEmail = tenantResult.rows[0]?.email;
      
      // Check if tenant matches via ID or email in wizard_data
      const hasAccess = lease.tenant_id === tenantId || 
        (lease.wizard_data?.tenant?.email === tenantEmail);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Add computed fields for e-sign leases
    const responseLease = {
      ...lease,
      is_esign: !lease.tenant_id && lease.wizard_data,
      start_date: lease.start_date || lease.wizard_data?.terms?.startDate,
      end_date: lease.end_date || lease.wizard_data?.terms?.endDate,
      monthly_rent: lease.monthly_rent || lease.wizard_data?.rent?.monthlyRent,
      security_deposit: lease.security_deposit || lease.wizard_data?.rent?.securityDeposit
    };

    res.json({ lease: responseLease });
  } catch (error) {
    console.error('Get lease error:', error);
    res.status(500).json({ error: 'Failed to get lease' });
  }
};

// Create a new lease
export const createLease = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only landlords and property managers can create leases
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    let {
      property_id,
      unit_id,
      tenant_id,
      start_date,
      end_date,
      monthly_rent,
      security_deposit,
      late_fee_amount,
      late_fee_grace_period,
      pet_fee,
      pet_deposit,
      utilities_included,
      parking_spaces,
      auto_renew,
      renewal_notice_days
    } = req.body;

    // Validate required fields
    if (!property_id || !tenant_id || !start_date || !end_date || !monthly_rent || !security_deposit) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['property_id', 'tenant_id', 'start_date', 'end_date', 'monthly_rent', 'security_deposit']
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Verify property exists and belongs to landlord
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

    // If no unit_id provided, find or create a default unit
    if (!unit_id) {
      // Check for existing unoccupied units
      const existingUnit = await pool.query(
        `SELECT id FROM units WHERE property_id = $1 AND is_occupied = false AND is_active = true LIMIT 1`,
        [property_id]
      );

      if (existingUnit.rows.length > 0) {
        unit_id = existingUnit.rows[0].id;
      } else {
        // Get the next unit number for this property
        const maxUnitResult = await pool.query(
          `SELECT COALESCE(MAX(CAST(unit_number AS INTEGER)), 0) as max_num FROM units WHERE property_id = $1`,
          [property_id]
        );
        const nextUnitNumber = (parseInt(maxUnitResult.rows[0].max_num) + 1).toString();

        // Create a new unit for this property
        const newUnit = await pool.query(
          `INSERT INTO units (property_id, unit_number, unit_type, rent_amount, bedrooms, bathrooms)
           VALUES ($1, $2, 'studio', $3, 1, 1)
           RETURNING id`,
          [property_id, nextUnitNumber, monthly_rent]
        );
        unit_id = newUnit.rows[0].id;
      }
    } else {
      // Check if specified unit is available
      const unitCheck = await pool.query(
        `SELECT u.*, l.id as active_lease_id 
         FROM units u 
         LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
         WHERE u.id = $1`,
        [unit_id]
      );

      if (unitCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Unit not found' });
      }

      if (unitCheck.rows[0].active_lease_id) {
        return res.status(400).json({ error: 'Unit is already under an active lease' });
      }
    }

    // Verify tenant exists
    const tenantCheck = await pool.query(
      'SELECT id FROM tenants WHERE id = $1 AND is_active = true',
      [tenant_id]
    );

    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const leaseNumber = generateLeaseNumber();
    const landlordSignToken = uuidv4();
    const tenantSignToken = uuidv4();

    const result = await pool.query(
      `INSERT INTO leases (
        property_id, unit_id, landlord_id, tenant_id, lease_number,
        start_date, end_date, monthly_rent, security_deposit,
        late_fee_amount, late_fee_grace_period, pet_fee, pet_deposit,
        utilities_included, parking_spaces, auto_renew, renewal_notice_days, status,
        landlord_sign_token, tenant_sign_token
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending_signature', $18, $19)
      RETURNING *`,
      [
        property_id, unit_id, userId, tenant_id, leaseNumber,
        start_date, end_date, monthly_rent, security_deposit,
        late_fee_amount || 0, late_fee_grace_period || 3, pet_fee || 0, pet_deposit || 0,
        utilities_included || false, parking_spaces || 0, auto_renew || false, renewal_notice_days || 60,
        landlordSignToken, tenantSignToken
      ]
    );

    // Mark unit as occupied
    await pool.query(
      'UPDATE units SET is_occupied = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [unit_id]
    );

    // Send email notification to tenant
    try {
      // Get tenant and property details for email
      const tenantInfo = await pool.query(
        'SELECT first_name, last_name, email FROM tenants WHERE id = $1',
        [tenant_id]
      );
      const propertyInfo = await pool.query(
        'SELECT name, address FROM properties WHERE id = $1',
        [property_id]
      );
      const landlordInfo = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      if (tenantInfo.rows.length > 0 && propertyInfo.rows.length > 0) {
        const tenant = tenantInfo.rows[0];
        const property = propertyInfo.rows[0];
        const landlord = landlordInfo.rows[0];

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const emailData = emailTemplates.leaseCreated({
          landlordName: `${landlord.first_name} ${landlord.last_name}`,
          tenantName: `${tenant.first_name} ${tenant.last_name}`,
          tenantEmail: tenant.email,
          leaseNumber,
          propertyName: property.name,
          propertyAddress: property.address,
          monthlyRent: monthly_rent,
          startDate: start_date,
          endDate: end_date,
          signUrl: `${baseUrl}/leases`
        });

        await sendEmail({ to: tenant.email, subject: emailData.subject, html: emailData.html });
      }
    } catch (emailError) {
      console.error('Failed to send lease creation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Lease created successfully',
      lease: result.rows[0]
    });
  } catch (error) {
    console.error('Create lease error:', error);
    res.status(500).json({ error: 'Failed to create lease' });
  }
};

// Update a lease
export const updateLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if lease exists
    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = checkResult.rows[0];

    // Check permissions
    if (userRole === 'landlord' && lease.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      start_date, end_date, monthly_rent, security_deposit,
      late_fee_amount, late_fee_grace_period, pet_fee, pet_deposit,
      utilities_included, parking_spaces, auto_renew, renewal_notice_days,
      status, termination_reason
    } = req.body;

    // Handle status changes
    let termination_date = lease.termination_date;
    if (status === 'terminated' && lease.status !== 'terminated') {
      termination_date = new Date();
    }

    const result = await pool.query(
      `UPDATE leases SET
        start_date = COALESCE($1, start_date),
        end_date = COALESCE($2, end_date),
        monthly_rent = COALESCE($3, monthly_rent),
        security_deposit = COALESCE($4, security_deposit),
        late_fee_amount = COALESCE($5, late_fee_amount),
        late_fee_grace_period = COALESCE($6, late_fee_grace_period),
        pet_fee = COALESCE($7, pet_fee),
        pet_deposit = COALESCE($8, pet_deposit),
        utilities_included = COALESCE($9, utilities_included),
        parking_spaces = COALESCE($10, parking_spaces),
        auto_renew = COALESCE($11, auto_renew),
        renewal_notice_days = COALESCE($12, renewal_notice_days),
        status = COALESCE($13, status),
        termination_reason = COALESCE($14, termination_reason),
        termination_date = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        start_date, end_date, monthly_rent, security_deposit,
        late_fee_amount, late_fee_grace_period, pet_fee, pet_deposit,
        utilities_included, parking_spaces, auto_renew, renewal_notice_days,
        status, termination_reason, termination_date, id
      ]
    );

    // If lease is terminated, mark unit as unoccupied
    if (status === 'terminated' && lease.unit_id) {
      await pool.query(
        'UPDATE units SET is_occupied = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [lease.unit_id]
      );
    }

    res.json({
      message: 'Lease updated successfully',
      lease: result.rows[0]
    });
  } catch (error) {
    console.error('Update lease error:', error);
    res.status(500).json({ error: 'Failed to update lease' });
  }
};

// Delete a lease
export const deleteLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if lease exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = checkResult.rows[0];

    if (lease.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow deletion of non-active leases
    if (lease.status === 'active') {
      return res.status(400).json({
        error: 'Cannot delete an active lease. Terminate it first.',
        currentStatus: lease.status
      });
    }

    console.log(`🗑️ Deleting lease ${id} with status: ${lease.status}`);
    await pool.query('DELETE FROM leases WHERE id = $1', [id]);

    res.json({ message: 'Lease deleted successfully' });
  } catch (error) {
    console.error('Delete lease error:', error);
    res.status(500).json({ error: 'Failed to delete lease' });
  }
};

// Terminate a lease
export const terminateLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { termination_reason } = req.body;

    // Check if lease exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = checkResult.rows[0];

    if (lease.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow termination of active leases
    if (lease.status !== 'active') {
      return res.status(400).json({
        error: 'Can only terminate active leases.'
      });
    }

    await pool.query(
      `UPDATE leases SET 
        status = 'terminated', 
        termination_date = CURRENT_TIMESTAMP, 
        termination_reason = $1,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [termination_reason || null, id]
    );

    res.json({ message: 'Lease terminated successfully' });
  } catch (error) {
    console.error('Terminate lease error:', error);
    res.status(500).json({ error: 'Failed to terminate lease' });
  }
};

// Sign a lease (for e-signature)
export const signLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = checkResult.rows[0];
    let isFullySigned = false;
    let signerName = '';
    let signerRole = '';

    if (userRole === 'landlord' || userRole === 'property_manager') {
      if (lease.landlord_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get signer name
      const signerResult = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
      signerName = `${signerResult.rows[0].first_name} ${signerResult.rows[0].last_name}`;
      signerRole = 'Landlord';

      const updateResult = await pool.query(
        `UPDATE leases SET
          landlord_signed = true,
          landlord_signed_at = CURRENT_TIMESTAMP,
          status = CASE WHEN tenant_signed = true THEN 'active' ELSE status END,
          signing_date = CASE WHEN tenant_signed = true THEN CURRENT_DATE ELSE signing_date END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING status`,
        [id]
      );
      isFullySigned = updateResult.rows[0].status === 'active';
    } else if (userRole === 'tenant') {
      const tenantResult = await pool.query(
        'SELECT id, first_name, last_name FROM tenants WHERE user_id = $1',
        [userId]
      );

      if (tenantResult.rows.length === 0 || tenantResult.rows[0].id !== lease.tenant_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      signerName = `${tenantResult.rows[0].first_name} ${tenantResult.rows[0].last_name}`;
      signerRole = 'Tenant';

      const updateResult = await pool.query(
        `UPDATE leases SET
          tenant_signed = true,
          tenant_signed_at = CURRENT_TIMESTAMP,
          status = CASE WHEN landlord_signed = true THEN 'active' ELSE status END,
          signing_date = CASE WHEN landlord_signed = true THEN CURRENT_DATE ELSE signing_date END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING status`,
        [id]
      );
      isFullySigned = updateResult.rows[0].status === 'active';
    }

    // Send email notifications
    try {
      // Get all relevant parties
      const leaseInfo = await pool.query(
        `SELECT l.lease_number, l.landlord_signed, l.tenant_signed,
                p.name as property_name,
                t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email,
                u.first_name as landlord_first_name, u.last_name as landlord_last_name, u.email as landlord_email
         FROM leases l
         JOIN properties p ON l.property_id = p.id
         JOIN tenants t ON l.tenant_id = t.id
         JOIN users u ON l.landlord_id = u.id
         WHERE l.id = $1`,
        [id]
      );

      if (leaseInfo.rows.length > 0) {
        const info = leaseInfo.rows[0];
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Notify the other party about the signature
        if (userRole === 'landlord' || userRole === 'property_manager') {
          // Send email to tenant
          const emailData = emailTemplates.leaseSigned({
            recipientName: `${info.tenant_first_name} ${info.tenant_last_name}`,
            signerName,
            signerRole,
            leaseNumber: info.lease_number,
            propertyName: info.property_name,
            isFullySigned,
            signUrl: isFullySigned ? undefined : `${baseUrl}/leases`
          });
          await sendEmail({ to: info.tenant_email, subject: emailData.subject, html: emailData.html });
        } else {
          // Send email to landlord
          const emailData = emailTemplates.leaseSigned({
            recipientName: `${info.landlord_first_name} ${info.landlord_last_name}`,
            signerName,
            signerRole,
            leaseNumber: info.lease_number,
            propertyName: info.property_name,
            isFullySigned,
            signUrl: isFullySigned ? undefined : `${baseUrl}/leases`
          });
          await sendEmail({ to: info.landlord_email, subject: emailData.subject, html: emailData.html });
        }

        // If fully signed, generate PDF and send to both parties
        if (isFullySigned) {
          // Get full lease data for PDF
          const fullLeaseResult = await pool.query(
            `SELECT l.*, 
              t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email, t.phone as tenant_phone,
              p.name as property_name, p.address as property_address, p.city as property_city, p.state as property_state, p.zip_code as property_zip,
              u2.unit_number, u2.unit_type,
              u.first_name as landlord_first_name, u.last_name as landlord_last_name
             FROM leases l
             JOIN tenants t ON l.tenant_id = t.id
             JOIN properties p ON l.property_id = p.id
             LEFT JOIN units u2 ON l.unit_id = u2.id
             JOIN users u ON l.landlord_id = u.id
             WHERE l.id = $1`,
            [id]
          );

          const fullLease = fullLeaseResult.rows[0];

          // Generate PDF
          console.log('📄 Generating PDF for signed lease...');
          const pdfPath = await generateLeasePDF(fullLease as any);
          console.log('📄 PDF generated at:', pdfPath);
          
          if (pdfPath) {
            await pool.query('UPDATE leases SET pdf_path = $1 WHERE id = $2', [pdfPath, id]);
          }

          // Send completion emails with PDF attachment to both parties
          const tenantEmail = emailTemplates.leaseCompleted({
            recipientName: `${info.tenant_first_name} ${info.tenant_last_name}`,
            leaseNumber: info.lease_number,
            propertyName: info.property_name,
            propertyAddress: fullLease.property_address,
            downloadUrl: `${baseUrl}/api/leases/${id}/pdf`
          });
          
          console.log('📧 Sending email to tenant with PDF attachment:', pdfPath ? 'YES' : 'NO');
          await sendEmail({ 
            to: info.tenant_email, 
            subject: `✅ Lease Completed - ${info.lease_number}`, 
            html: tenantEmail.html,
            attachments: pdfPath ? [{ filename: `Lease_${info.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
          });

          const landlordEmail = emailTemplates.leaseCompleted({
            recipientName: `${info.landlord_first_name} ${info.landlord_last_name}`,
            leaseNumber: info.lease_number,
            propertyName: info.property_name,
            propertyAddress: fullLease.property_address,
            downloadUrl: `${baseUrl}/api/leases/${id}/pdf`
          });
          
          console.log('📧 Sending email to landlord with PDF attachment:', pdfPath ? 'YES' : 'NO');
          await sendEmail({ 
            to: info.landlord_email, 
            subject: `✅ Lease Completed - ${info.lease_number}`, 
            html: landlordEmail.html,
            attachments: pdfPath ? [{ filename: `Lease_${info.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send lease signature email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Lease signed successfully', isFullySigned });
  } catch (error) {
    console.error('Sign lease error:', error);
    res.status(500).json({ error: 'Failed to sign lease' });
  }
};

// Get lease statistics
export const getLeaseStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereClause = '';
    const params: any[] = [];

    if (userRole === 'landlord') {
      whereClause = 'WHERE landlord_id = $1';
      params.push(userId);
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_leases,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_leases,
        COUNT(CASE WHEN status = 'pending_signature' THEN 1 END) as pending_leases,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_leases,
        COALESCE(SUM(CASE WHEN status = 'active' THEN monthly_rent ELSE 0 END), 0) as monthly_revenue
      FROM leases
      ${whereClause}`,
      params
    );

    res.json({
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get lease stats error:', error);
    res.status(500).json({ error: 'Failed to get lease statistics' });
  }
};

// ==================== E-SIGNATURE WORKFLOW ====================

// Initiate e-sign process - send to tenant first
export const initiateEsign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only landlords and property managers can initiate
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get lease
    const leaseResult = await pool.query(
      `SELECT l.*, 
        t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email, t.phone as tenant_phone,
        p.name as property_name, p.address as property_address,
        u.first_name as landlord_first_name, u.last_name as landlord_last_name, u.email as landlord_email
       FROM leases l
       JOIN tenants t ON l.tenant_id = t.id
       JOIN properties p ON l.property_id = p.id
       JOIN users u ON l.landlord_id = u.id
       WHERE l.id = $1 AND l.landlord_id = $2`,
      [id, userId]
    );

    if (leaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = leaseResult.rows[0];

    if (lease.status !== 'pending_signature' && lease.status !== 'draft') {
      return res.status(400).json({ error: 'Lease cannot be sent for signature in current status' });
    }

    // Generate tokens if not exist
    let landlordToken = lease.landlord_sign_token;
    let tenantToken = lease.tenant_sign_token;

    if (!landlordToken || !tenantToken) {
      landlordToken = uuidv4();
      tenantToken = uuidv4();
    }

    // Set expiration (7 days from now)
    const linkExpiresAt = new Date(Date.now() + LINK_EXPIRATION_MS);

    // Update lease with tokens and expiration
    await pool.query(
      `UPDATE leases SET 
        landlord_sign_token = $1, 
        tenant_sign_token = $2, 
        link_expires_at = $3, 
        status = 'pending_signature',
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [landlordToken, tenantToken, linkExpiresAt, id]
    );

    // Send email to tenant
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const tenantSignUrl = `${baseUrl}/sign/${tenantToken}`;

    const emailData = emailTemplates.signingRequest({
      recipientName: `${lease.tenant_first_name} ${lease.tenant_last_name}`,
      recipientEmail: lease.tenant_email,
      senderName: `${lease.landlord_first_name} ${lease.landlord_last_name}`,
      leaseNumber: lease.lease_number,
      propertyName: lease.property_name,
      propertyAddress: lease.property_address,
      signUrl: tenantSignUrl,
      expiresAt: linkExpiresAt.toISOString()
    });

    await sendEmail({ to: lease.tenant_email, subject: emailData.subject, html: emailData.html });

    res.json({ 
      message: 'E-sign request sent to tenant successfully',
      tenantSignUrl,
      expiresAt: linkExpiresAt
    });
  } catch (error) {
    console.error('Initiate e-sign error:', error);
    res.status(500).json({ error: 'Failed to initiate e-sign process' });
  }
};

// Public endpoint - Get lease for signing (no auth required)
export const getLeaseForSigning = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT l.*, 
        t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email, t.phone as tenant_phone,
        p.name as property_name, p.address as property_address, p.city as property_city, p.state as property_state, p.zip_code as property_zip,
        u.unit_number, u.unit_type,
        land.first_name as landlord_first_name, land.last_name as landlord_last_name, land.email as landlord_email
       FROM leases l
       JOIN tenants t ON l.tenant_id = t.id
       JOIN properties p ON l.property_id = p.id
       LEFT JOIN units u ON l.unit_id = u.id
       JOIN users land ON l.landlord_id = land.id
       WHERE l.landlord_sign_token = $1 OR l.tenant_sign_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired signing link' });
    }

    const lease = result.rows[0];

    // Check if link has expired
    if (lease.link_expires_at && new Date(lease.link_expires_at) < new Date()) {
      return res.status(410).json({ error: 'This signing link has expired. Please contact the sender for a new link.', expired: true });
    }

    const signerType = lease.landlord_sign_token === token ? 'landlord' : 'tenant';

    // Check if already signed
    if (signerType === 'landlord' && lease.landlord_signed_at) {
      return res.status(400).json({ error: 'You have already signed this lease.' });
    }
    if (signerType === 'tenant' && lease.tenant_signed_at) {
      return res.status(400).json({ error: 'You have already signed this lease.' });
    }

    // For landlord, check if tenant has signed first
    if (signerType === 'landlord' && !lease.tenant_signed_at) {
      return res.status(400).json({ 
        error: 'The tenant must sign first. You will receive an email once the tenant has signed.',
        waitingForTenant: true
      });
    }

    // Remove sensitive tokens from response
    const safeLease = { ...lease };
    delete safeLease.landlord_sign_token;
    delete safeLease.tenant_sign_token;
    delete safeLease.landlord_id;

    res.json({ 
      lease: safeLease, 
      signerType,
      signerName: signerType === 'landlord' 
        ? `${lease.landlord_first_name} ${lease.landlord_last_name}`
        : `${lease.tenant_first_name} ${lease.tenant_last_name}`
    });
  } catch (error) {
    console.error('Get lease for signing error:', error);
    res.status(500).json({ error: 'Failed to get lease' });
  }
};

// Public endpoint - Submit signature (no auth required)
export const submitSignature = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const result = await pool.query(
      `SELECT l.*, 
        t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email,
        p.name as property_name, p.address as property_address,
        land.first_name as landlord_first_name, land.last_name as landlord_last_name, land.email as landlord_email
       FROM leases l
       JOIN tenants t ON l.tenant_id = t.id
       JOIN properties p ON l.property_id = p.id
       JOIN users land ON l.landlord_id = land.id
       WHERE l.landlord_sign_token = $1 OR l.tenant_sign_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid signing link' });
    }

    const lease = result.rows[0];

    // Check if link has expired
    if (lease.link_expires_at && new Date(lease.link_expires_at) < new Date()) {
      return res.status(410).json({ error: 'This signing link has expired.' });
    }

    const signerType = lease.landlord_sign_token === token ? 'landlord' : 'tenant';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = new Date();

    // Check if tenant signed first (landlord can only sign after tenant)
    if (signerType === 'landlord' && !lease.tenant_signed_at) {
      return res.status(400).json({ error: 'Tenant must sign first.' });
    }

    let newStatus = lease.status;
    let isFullySigned = false;

    if (signerType === 'tenant') {
      // Tenant signing
      // Reset expiration for landlord (7 more days)
      const newExpiration = new Date(Date.now() + LINK_EXPIRATION_MS);
      
      if (lease.landlord_signed_at) {
        newStatus = 'active';
        isFullySigned = true;
      } else {
        newStatus = 'partial';
      }

      await pool.query(
        `UPDATE leases SET
          tenant_signed = true,
          tenant_signed_at = $1,
          tenant_signed_ip = $2,
          tenant_signature = $3,
          link_expires_at = $4,
          status = $5,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [now, ip, signature, newExpiration, newStatus, lease.id]
      );

      // Send email to landlord to sign
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const landlordSignUrl = `${baseUrl}/sign/${lease.landlord_sign_token}`;

      const emailData = emailTemplates.signingRequest({
        recipientName: `${lease.landlord_first_name} ${lease.landlord_last_name}`,
        recipientEmail: lease.landlord_email,
        senderName: `${lease.tenant_first_name} ${lease.tenant_last_name}`,
        leaseNumber: lease.lease_number,
        propertyName: lease.property_name,
        propertyAddress: lease.property_address,
        signUrl: landlordSignUrl,
        expiresAt: newExpiration.toISOString()
      });

      await sendEmail({ to: lease.landlord_email, subject: `[Action Required] Tenant Signed - Please Sign Lease ${lease.lease_number}`, html: emailData.html });

    } else {
      // Landlord signing
      if (lease.tenant_signed_at) {
        newStatus = 'active';
        isFullySigned = true;
      }

      await pool.query(
        `UPDATE leases SET
          landlord_signed = true,
          landlord_signed_at = $1,
          landlord_signed_ip = $2,
          landlord_signature = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [now, ip, signature, newStatus, lease.id]
      );
    }

    // If fully signed, generate PDF and send completion emails
    if (isFullySigned) {
      // Get full lease data for PDF
      const fullLeaseResult = await pool.query(
        `SELECT l.*, 
          t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email, t.phone as tenant_phone,
          p.name as property_name, p.address as property_address, p.city as property_city, p.state as property_state, p.zip_code as property_zip,
          u.unit_number, u.unit_type,
          land.first_name as landlord_first_name, land.last_name as landlord_last_name
         FROM leases l
         JOIN tenants t ON l.tenant_id = t.id
         JOIN properties p ON l.property_id = p.id
         LEFT JOIN units u ON l.unit_id = u.id
         JOIN users land ON l.landlord_id = land.id
         WHERE l.id = $1`,
        [lease.id]
      );

      const fullLease = fullLeaseResult.rows[0];

      // Generate PDF
      console.log('📄 Generating PDF for signed lease...');
      const pdfPath = await generateLeasePDF(fullLease as any);
      console.log('📄 PDF generated at:', pdfPath);
      
      if (pdfPath) {
        await pool.query('UPDATE leases SET pdf_path = $1 WHERE id = $2', [pdfPath, lease.id]);
      }

      // Send completion emails with PDF attachment
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Email to tenant
      const tenantEmail = emailTemplates.leaseCompleted({
        recipientName: `${lease.tenant_first_name} ${lease.tenant_last_name}`,
        leaseNumber: lease.lease_number,
        propertyName: lease.property_name,
        propertyAddress: lease.property_address,
        downloadUrl: `${baseUrl}/api/leases/${lease.id}/pdf`
      });
      
      console.log('📧 Sending email to tenant with PDF attachment:', pdfPath ? 'YES' : 'NO');
      await sendEmail({ 
        to: lease.tenant_email, 
        subject: tenantEmail.subject, 
        html: tenantEmail.html,
        attachments: pdfPath ? [{ filename: `Lease_${lease.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
      });

      // Email to landlord
      const landlordEmail = emailTemplates.leaseCompleted({
        recipientName: `${lease.landlord_first_name} ${lease.landlord_last_name}`,
        leaseNumber: lease.lease_number,
        propertyName: lease.property_name,
        propertyAddress: lease.property_address,
        downloadUrl: `${baseUrl}/api/leases/${lease.id}/pdf`
      });
      
      console.log('📧 Sending email to landlord with PDF attachment:', pdfPath ? 'YES' : 'NO');
      await sendEmail({ 
        to: lease.landlord_email, 
        subject: landlordEmail.subject, 
        html: landlordEmail.html,
        attachments: pdfPath ? [{ filename: `Lease_${lease.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
      });
    }

    res.json({ 
      success: true, 
      message: 'Signature submitted successfully',
      status: newStatus,
      isFullySigned
    });
  } catch (error) {
    console.error('Submit signature error:', error);
    res.status(500).json({ error: 'Failed to submit signature' });
  }
};

// Download PDF (authenticated or token-based)
export const downloadLeasePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    let userId: string | undefined;
    
    // Check for token in query param (for new tab viewing)
    if (token && typeof token === 'string') {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } else {
      // Use authenticated user from middleware
      const authReq = req as AuthRequest;
      userId = authReq.user?.id;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      `SELECT l.*, 
        t.first_name as tenant_first_name, t.last_name as tenant_last_name, t.email as tenant_email, t.phone as tenant_phone,
        p.name as property_name, p.address as property_address, p.city as property_city, p.state as property_state, p.zip_code as property_zip,
        u.unit_number, u.unit_type,
        land.first_name as landlord_first_name, land.last_name as landlord_last_name
       FROM leases l
       JOIN tenants t ON l.tenant_id = t.id
       JOIN properties p ON l.property_id = p.id
       LEFT JOIN units u ON l.unit_id = u.id
       JOIN users land ON l.landlord_id = land.id
       WHERE l.id = $1 AND l.landlord_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = result.rows[0];

    // Generate PDF
    await generateLeasePDF(lease as any, res);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
