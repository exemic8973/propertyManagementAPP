import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../database/connection';

// Get all payments
export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, lease_id, start_date, end_date } = req.query;

    let query = `
      SELECT rp.*,
        l.lease_number,
        l.monthly_rent as lease_rent,
        t.first_name as tenant_first_name,
        t.last_name as tenant_last_name,
        t.email as tenant_email,
        p.name as property_name,
        p.address as property_address,
        u.unit_number
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN properties p ON l.property_id = p.id
      LEFT JOIN units u ON l.unit_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Filter based on user role
    if (userRole === 'landlord') {
      query += ` AND l.landlord_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (userRole === 'tenant') {
      query += ` AND l.tenant_id = (SELECT id FROM tenants WHERE user_id = $${paramCount})`;
      params.push(userId);
      paramCount++;
    }

    // Filter by status
    if (status) {
      query += ` AND rp.payment_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by lease
    if (lease_id) {
      query += ` AND rp.lease_id = $${paramCount}`;
      params.push(lease_id);
      paramCount++;
    }

    // Filter by date range
    if (start_date) {
      query += ` AND rp.payment_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND rp.payment_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY rp.payment_date DESC, rp.created_at DESC`;

    const result = await pool.query(query, params);

    // Transform results
    const payments = result.rows.map(row => ({
      id: row.id,
      payment_date: row.payment_date,
      amount: row.amount,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      transaction_id: row.transaction_id,
      notes: row.notes,
      late_fee_applied: row.late_fee_applied,
      late_fee_amount: row.late_fee_amount,
      created_at: row.created_at,
      lease: {
        id: row.lease_id,
        lease_number: row.lease_number,
        monthly_rent: row.lease_rent
      },
      tenant: {
        first_name: row.tenant_first_name,
        last_name: row.tenant_last_name,
        email: row.tenant_email
      },
      property: {
        name: row.property_name,
        address: row.property_address,
        unit_number: row.unit_number
      }
    }));

    res.json({
      payments,
      total: payments.length
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

// Get a single payment
export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT rp.*,
        json_build_object(
          'id', l.id,
          'lease_number', l.lease_number,
          'monthly_rent', l.monthly_rent,
          'start_date', l.start_date,
          'end_date', l.end_date
        ) as lease,
        json_build_object(
          'id', t.id,
          'first_name', t.first_name,
          'last_name', t.last_name,
          'email', t.email,
          'phone', t.phone
        ) as tenant,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'address', p.address
        ) as property,
        json_build_object(
          'unit_number', u.unit_number
        ) as unit
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN properties p ON l.property_id = p.id
      LEFT JOIN units u ON l.unit_id = u.id
      WHERE rp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];

    // Check access permissions
    if (userRole === 'landlord') {
      const leaseCheck = await pool.query(
        'SELECT landlord_id FROM leases WHERE id = $1',
        [payment.lease_id]
      );
      if (leaseCheck.rows[0]?.landlord_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'tenant') {
      const tenantCheck = await pool.query(
        'SELECT id FROM tenants WHERE user_id = $1',
        [userId]
      );
      const leaseCheck = await pool.query(
        'SELECT tenant_id FROM leases WHERE id = $1',
        [payment.lease_id]
      );
      if (tenantCheck.rows.length === 0 || tenantCheck.rows[0].id !== leaseCheck.rows[0]?.tenant_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to get payment' });
  }
};

// Create a payment
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const {
      lease_id,
      payment_date,
      amount,
      payment_method,
      transaction_id,
      notes
    } = req.body;

    // Validate required fields
    if (!lease_id || !payment_date || !amount || !payment_method) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['lease_id', 'payment_date', 'amount', 'payment_method']
      });
    }

    // Validate payment method
    const validMethods = ['cash', 'check', 'bank_transfer', 'online', 'other'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        validMethods
      });
    }

    // Verify lease exists and user has access
    const leaseResult = await pool.query(
      `SELECT l.*, t.id as tenant_id, t.user_id as tenant_user_id
       FROM leases l
       JOIN tenants t ON l.tenant_id = t.id
       WHERE l.id = $1 AND l.status = 'active'`,
      [lease_id]
    );

    if (leaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active lease not found' });
    }

    const lease = leaseResult.rows[0];

    // Check permissions
    if (userRole === 'landlord' && lease.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'tenant' && lease.tenant_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate late fees if applicable
    let late_fee_applied = false;
    let late_fee_amount = 0;

    const paymentDate = new Date(payment_date);
    const dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), lease.late_fee_grace_period + 1);

    if (paymentDate > dueDate && lease.late_fee_amount > 0) {
      late_fee_applied = true;
      late_fee_amount = lease.late_fee_amount;
    }

    const result = await pool.query(
      `INSERT INTO rent_payments (
        lease_id, payment_date, amount, payment_method,
        transaction_id, notes, late_fee_applied, late_fee_amount, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
      RETURNING *`,
      [
        lease_id, payment_date, amount, payment_method,
        transaction_id, notes, late_fee_applied, late_fee_amount
      ]
    );

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Update a payment
export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if payment exists
    const checkResult = await pool.query(
      `SELECT rp.*, l.landlord_id
       FROM rent_payments rp
       JOIN leases l ON rp.lease_id = l.id
       WHERE rp.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = checkResult.rows[0];

    // Check permissions - only landlords can update payments
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'landlord' && payment.landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      payment_date, amount, payment_method, payment_status,
      transaction_id, notes, late_fee_applied, late_fee_amount
    } = req.body;

    const result = await pool.query(
      `UPDATE rent_payments SET
        payment_date = COALESCE($1, payment_date),
        amount = COALESCE($2, amount),
        payment_method = COALESCE($3, payment_method),
        payment_status = COALESCE($4, payment_status),
        transaction_id = COALESCE($5, transaction_id),
        notes = COALESCE($6, notes),
        late_fee_applied = COALESCE($7, late_fee_applied),
        late_fee_amount = COALESCE($8, late_fee_amount),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [
        payment_date, amount, payment_method, payment_status,
        transaction_id, notes, late_fee_applied, late_fee_amount, id
      ]
    );

    res.json({
      message: 'Payment updated successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// Delete a payment
export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if payment exists and user has access
    const checkResult = await pool.query(
      `SELECT rp.*, l.landlord_id
       FROM rent_payments rp
       JOIN leases l ON rp.lease_id = l.id
       WHERE rp.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (checkResult.rows[0].landlord_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM rent_payments WHERE id = $1', [id]);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

// Get payment statistics
export const getPaymentStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereClause = '';
    const params: any[] = [];

    if (userRole === 'landlord') {
      whereClause = 'WHERE l.landlord_id = $1';
      params.push(userId);
    } else if (userRole === 'tenant') {
      whereClause = 'WHERE l.tenant_id = (SELECT id FROM tenants WHERE user_id = $1)';
      params.push(userId);
    }

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_payments,
        COALESCE(SUM(rp.amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN rp.payment_status = 'completed' THEN rp.amount ELSE 0 END), 0) as collected_amount,
        COALESCE(SUM(CASE WHEN rp.payment_status = 'pending' THEN rp.amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN rp.payment_status = 'overdue' THEN rp.amount ELSE 0 END), 0) as overdue_amount,
        COALESCE(SUM(rp.late_fee_amount), 0) as total_late_fees,
        COUNT(CASE WHEN rp.payment_status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN rp.payment_status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN rp.payment_status = 'overdue' THEN 1 END) as overdue_count
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.id
      ${whereClause}`,
      params
    );

    // Get monthly breakdown for the last 12 months
    const monthlyResult = await pool.query(
      `SELECT
        TO_CHAR(rp.payment_date, 'YYYY-MM') as month,
        COALESCE(SUM(rp.amount), 0) as amount,
        COUNT(*) as count
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.id
      ${whereClause}
      AND rp.payment_date >= NOW() - INTERVAL '12 months'
      AND rp.payment_status = 'completed'
      GROUP BY TO_CHAR(rp.payment_date, 'YYYY-MM')
      ORDER BY month DESC`,
      params
    );

    res.json({
      stats: statsResult.rows[0],
      monthly: monthlyResult.rows
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
};

// Record a late payment
export const recordLatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { lease_id } = req.params;
    const userId = req.user!.id;

    // Get lease details
    const leaseResult = await pool.query(
      `SELECT * FROM leases WHERE id = $1 AND landlord_id = $2 AND status = 'active'`,
      [lease_id, userId]
    );

    if (leaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active lease not found or access denied' });
    }

    const lease = leaseResult.rows[0];

    // Create a pending payment record with late fee
    const result = await pool.query(
      `INSERT INTO rent_payments (
        lease_id, payment_date, amount, payment_method,
        payment_status, late_fee_applied, late_fee_amount
      ) VALUES ($1, CURRENT_DATE, $2, 'other', 'overdue', true, $3)
      RETURNING *`,
      [lease_id, lease.monthly_rent, lease.late_fee_amount]
    );

    res.status(201).json({
      message: 'Late payment recorded',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Record late payment error:', error);
    res.status(500).json({ error: 'Failed to record late payment' });
  }
};
