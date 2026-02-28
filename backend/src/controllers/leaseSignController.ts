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

// Log audit action
const logAudit = async (
  documentId: string,
  userId: string | null,
  action: string,
  actorName: string,
  actorEmail: string,
  actorRole: string,
  ip: string,
  userAgent: string,
  details: any = null
) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (document_id, user_id, action, actor_name, actor_email, actor_role, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [documentId, userId, action, actorName, actorEmail, actorRole, ip, userAgent, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

// Create notification
const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  documentId: string | null = null
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, document_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, documentId]
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Get all documents for user
export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, search } = req.query;

    let query = `
      SELECT l.*,
        json_build_object(
          'firstName', l.wizard_data->'landlord'->>'firstName',
          'lastName', l.wizard_data->'landlord'->>'lastName',
          'email', l.wizard_data->'landlord'->>'email'
        ) as landlord_info,
        json_build_object(
          'firstName', l.wizard_data->'tenant'->>'firstName',
          'lastName', l.wizard_data->'tenant'->>'lastName',
          'email', l.wizard_data->'tenant'->>'email'
        ) as tenant_info
      FROM leases l
      WHERE l.landlord_id = $1 AND l.is_template = false
    `;
    const params: any[] = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (l.lease_number ILIKE $${paramCount} OR l.wizard_data::text ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

// Get single document
export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Fetch lease with related data
    const result = await pool.query(
      `SELECT l.*,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.zip_code as property_zip,
        p.property_type as property_type,
        p.square_footage as property_square_feet,
        t.first_name as tenant_first_name,
        t.last_name as tenant_last_name,
        t.email as tenant_email,
        t.phone as tenant_phone,
        t.date_of_birth as tenant_dob,
        land.first_name as landlord_first_name,
        land.last_name as landlord_last_name,
        land.email as landlord_email,
        land.phone as landlord_phone,
        un.unit_number,
        un.unit_type,
        un.bedrooms,
        un.bathrooms,
        un.square_footage as unit_square_feet,
        un.rent_amount as unit_rent
      FROM leases l
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN users land ON l.landlord_id = land.id
      LEFT JOIN units un ON l.unit_id = un.id
      WHERE l.id = $1 AND l.landlord_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const lease = result.rows[0];

    // If wizard_data is null, construct it from related tables (for traditional leases)
    if (!lease.wizard_data && lease.property_id) {
      lease.wizard_data = {
        landlord: {
          firstName: lease.landlord_first_name || '',
          lastName: lease.landlord_last_name || '',
          email: lease.landlord_email || '',
          phone: lease.landlord_phone || '',
        },
        tenant: {
          firstName: lease.tenant_first_name || '',
          lastName: lease.tenant_last_name || '',
          email: lease.tenant_email || '',
          phone: lease.tenant_phone || '',
          dateOfBirth: lease.tenant_dob || '',
        },
        property: {
          propertyName: lease.property_name || '',
          address: lease.property_address || '',
          city: lease.property_city || '',
          state: lease.property_state || '',
          zip: lease.property_zip || '',
          propertyType: lease.property_type || 'single_family',
          squareFeet: lease.property_square_feet || lease.unit_square_feet,
          bedrooms: lease.bedrooms,
          bathrooms: lease.bathrooms,
        },
        terms: {
          startDate: lease.start_date,
          endDate: lease.end_date,
          leaseType: 'fixed',
        },
        rent: {
          monthlyRent: lease.monthly_rent || lease.unit_rent || 0,
          securityDeposit: lease.security_deposit || 0,
        },
      };
    }

    // Get comments
    const commentsResult = await pool.query(
      'SELECT * FROM lease_comments WHERE lease_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get audit logs
    const auditResult = await pool.query(
      'SELECT * FROM audit_logs WHERE document_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      document: lease,
      comments: commentsResult.rows,
      auditLog: auditResult.rows
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};

// Create new document with wizard data
export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { wizardData, saveAsTemplate, templateName } = req.body;

    // Get user info for audit
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const leaseNumber = generateLeaseNumber();
    const landlordSignToken = uuidv4();
    const tenantSignToken = uuidv4();

    // Create the lease
    const result = await pool.query(
      `INSERT INTO leases (
        landlord_id, lease_number, status, wizard_data,
        landlord_sign_token, tenant_sign_token,
        landlord_signed, tenant_signed
      ) VALUES ($1, $2, 'draft', $3, $4, $5, false, false)
      RETURNING *`,
      [userId, leaseNumber, JSON.stringify(wizardData), landlordSignToken, tenantSignToken]
    );

    const document = result.rows[0];

    // Log audit
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    await logAudit(
      document.id,
      userId,
      'DOCUMENT_CREATED',
      `${user.first_name} ${user.last_name}`,
      user.email,
      'landlord',
      ip,
      userAgent,
      { leaseNumber }
    );

    // Save as template if requested
    if (saveAsTemplate && templateName) {
      await pool.query(
        `INSERT INTO lease_templates (user_id, name, template_data)
         VALUES ($1, $2, $3)`,
        [userId, templateName, JSON.stringify(wizardData)]
      );
    }

    res.status(201).json({ document });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};

// Update document
export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { wizardData } = req.body;

    // Check ownership
    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1 AND landlord_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const lease = checkResult.rows[0];

    // Can only update drafts
    if (lease.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft documents' });
    }

    const result = await pool.query(
      'UPDATE leases SET wizard_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [JSON.stringify(wizardData), id]
    );

    // Log audit
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    await logAudit(id, userId, 'DOCUMENT_UPDATED', `${user.first_name} ${user.last_name}`, user.email, 'landlord', ip, userAgent);

    res.json({ document: result.rows[0] });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

// Send document for signature
export const sendForSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get document
    const docResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1 AND landlord_id = $2',
      [id, userId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const lease = docResult.rows[0];

    if (lease.status !== 'draft') {
      return res.status(400).json({ error: 'Can only send draft documents' });
    }

    const wizardData = lease.wizard_data;
    const landlordEmail = wizardData?.landlord?.email;
    const landlordName = `${wizardData?.landlord?.firstName || ''} ${wizardData?.landlord?.lastName || ''}`.trim();
    const tenantEmail = wizardData?.tenant?.email;
    const tenantName = `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim();

    if (!landlordEmail || !tenantEmail) {
      return res.status(400).json({ error: 'Both landlord and tenant emails are required' });
    }

    // Update status and set expiration
    const expiresAt = new Date(Date.now() + LINK_EXPIRATION_MS);
    await pool.query(
      'UPDATE leases SET status = $1, link_expires_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['pending_signature', expiresAt, id]
    );

    // Log audit
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    await logAudit(id, userId, 'SENT_FOR_SIGNATURE', `${user.first_name} ${user.last_name}`, user.email, 'landlord', ip, userAgent);

    // Create notification
    await createNotification(userId, 'sent', 'Document Sent', `Lease ${lease.lease_number} has been sent for signature`, id);

    // Send email to landlord first (they sign first)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const landlordSignUrl = `${baseUrl}/sign/${lease.landlord_sign_token}`;

    const emailData = emailTemplates.signingRequest({
      recipientName: landlordName,
      recipientEmail: landlordEmail,
      senderName: tenantName,
      leaseNumber: lease.lease_number,
      propertyName: wizardData?.property?.address || 'Property',
      propertyAddress: wizardData?.property?.address || '',
      signUrl: landlordSignUrl,
      expiresAt: expiresAt.toISOString()
    });

    await sendEmail({ to: landlordEmail, subject: `[Action Required] Sign Lease Agreement - ${lease.lease_number}`, html: emailData.html });

    res.json({ message: 'Document sent for signature', expiresAt });
  } catch (error) {
    console.error('Send for signature error:', error);
    res.status(500).json({ error: 'Failed to send document' });
  }
};

// Get document for signing (public endpoint)
export const getDocumentForSigning = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT * FROM leases WHERE landlord_sign_token = $1 OR tenant_sign_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid signing link' });
    }

    const lease = result.rows[0];

    // Check expiration
    if (lease.link_expires_at && new Date(lease.link_expires_at) < new Date()) {
      return res.status(410).json({ error: 'This signing link has expired. Please request a new one.' });
    }

    const signerType = lease.landlord_sign_token === token ? 'landlord' : 'tenant';
    const wizardData = lease.wizard_data || {};

    // Determine signing order
    const landlordFirst = true; // Landlord always signs first in this workflow
    const waitingForTenant = landlordFirst && !lease.landlord_signed_at;

    if (signerType === 'tenant' && !lease.landlord_signed_at) {
      return res.status(400).json({ 
        error: 'The landlord must sign first. You will receive an email once they have signed.',
        waitingForLandlord: true
      });
    }

    // Transform data for frontend compatibility
    const responseData = {
      ...lease,
      // Provide flat fields from wizard_data for frontend compatibility
      tenant_first_name: wizardData.tenant?.firstName || '',
      tenant_last_name: wizardData.tenant?.lastName || '',
      tenant_email: wizardData.tenant?.email || '',
      tenant_phone: wizardData.tenant?.phone || '',
      landlord_first_name: wizardData.landlord?.firstName || '',
      landlord_last_name: wizardData.landlord?.lastName || '',
      landlord_email: wizardData.landlord?.email || '',
      property_name: wizardData.property?.propertyName || '',
      property_address: wizardData.property?.address || '',
      property_city: wizardData.property?.city || '',
      property_state: wizardData.property?.state || '',
      property_zip: wizardData.property?.zip || '',
      monthly_rent: wizardData.rent?.monthlyRent || lease.monthly_rent || 0,
      security_deposit: wizardData.rent?.securityDeposit || lease.security_deposit || 0,
      start_date: wizardData.terms?.startDate || lease.start_date,
      end_date: wizardData.terms?.endDate || lease.end_date,
    };

    res.json({
      lease: responseData,
      document: responseData,
      signerType,
      signerName: signerType === 'landlord' 
        ? `${wizardData?.landlord?.firstName || ''} ${wizardData?.landlord?.lastName || ''}`.trim()
        : `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim(),
      signerEmail: signerType === 'landlord'
        ? wizardData?.landlord?.email || ''
        : wizardData?.tenant?.email || '',
      wizardData
    });
  } catch (error) {
    console.error('Get document for signing error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};

// Submit signature (public endpoint)
export const submitSignatureForSigning = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const result = await pool.query(
      `SELECT * FROM leases WHERE landlord_sign_token = $1 OR tenant_sign_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid signing link' });
    }

    const lease = result.rows[0];

    if (lease.link_expires_at && new Date(lease.link_expires_at) < new Date()) {
      return res.status(410).json({ error: 'This signing link has expired.' });
    }

    const signerType = lease.landlord_sign_token === token ? 'landlord' : 'tenant';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const now = new Date();
    const wizardData = lease.wizard_data;

    let newStatus = lease.status;
    let isFullySigned = false;

    if (signerType === 'landlord') {
      // Landlord signing
      const newExpiration = new Date(Date.now() + LINK_EXPIRATION_MS);

      if (lease.tenant_signed_at) {
        newStatus = 'active';
        isFullySigned = true;
      } else {
        newStatus = 'partial';
      }

      await pool.query(
        `UPDATE leases SET
          landlord_signed = true,
          landlord_signed_at = $1,
          landlord_signed_ip = $2,
          landlord_signature = $3,
          status = $4,
          link_expires_at = $5,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [now, ip, signature, newStatus, newExpiration, lease.id]
      );

      // Log audit
      await logAudit(
        lease.id,
        null,
        'LANDLORD_SIGNED',
        `${wizardData?.landlord?.firstName || ''} ${wizardData?.landlord?.lastName || ''}`.trim(),
        wizardData?.landlord?.email || '',
        'landlord',
        ip,
        userAgent
      );

      // Send email to tenant if not yet signed
      if (!lease.tenant_signed_at) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const tenantSignUrl = `${baseUrl}/sign/${lease.tenant_sign_token}`;
        const tenantName = `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim();
        const landlordName = `${wizardData?.landlord?.firstName || ''} ${wizardData?.landlord?.lastName || ''}`.trim();

        const emailData = emailTemplates.signingRequest({
          recipientName: tenantName,
          recipientEmail: wizardData?.tenant?.email || '',
          senderName: landlordName,
          leaseNumber: lease.lease_number,
          propertyName: wizardData?.property?.address || 'Property',
          propertyAddress: wizardData?.property?.address || '',
          signUrl: tenantSignUrl,
          expiresAt: newExpiration.toISOString()
        });

        await sendEmail({ 
          to: wizardData?.tenant?.email || '', 
          subject: `[Action Required] Landlord Signed - Please Sign Lease ${lease.lease_number}`, 
          html: emailData.html 
        });
      }

    } else {
      // Tenant signing
      if (lease.landlord_signed_at) {
        newStatus = 'active';
        isFullySigned = true;
      }

      await pool.query(
        `UPDATE leases SET
          tenant_signed = true,
          tenant_signed_at = $1,
          tenant_signed_ip = $2,
          tenant_signature = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [now, ip, signature, newStatus, lease.id]
      );

      // Log audit
      await logAudit(
        lease.id,
        null,
        'TENANT_SIGNED',
        `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim(),
        wizardData?.tenant?.email || '',
        'tenant',
        ip,
        userAgent
      );
    }

    // If fully signed, generate PDF and send completion emails
    if (isFullySigned) {
      // Get full lease data for PDF
      const fullLeaseResult = await pool.query(
        `SELECT l.* FROM leases l WHERE l.id = $1`,
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

      // Log completion
      await logAudit(
        lease.id,
        null,
        'DOCUMENT_COMPLETED',
        'System',
        '',
        'system',
        ip,
        userAgent
      );

      // Send completion emails
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const landlordName = `${wizardData?.landlord?.firstName || ''} ${wizardData?.landlord?.lastName || ''}`.trim();
      const tenantName = `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim();

      // Email to tenant
      const tenantEmail = emailTemplates.leaseCompleted({
        recipientName: tenantName,
        leaseNumber: lease.lease_number,
        propertyName: wizardData?.property?.address || 'Property',
        propertyAddress: wizardData?.property?.address || '',
        downloadUrl: `${baseUrl}/api/lease-sign/documents/${lease.id}/pdf`
      });

      await sendEmail({
        to: wizardData?.tenant?.email || '',
        subject: `✅ Lease Completed - ${lease.lease_number}`,
        html: tenantEmail.html,
        attachments: pdfPath ? [{ filename: `Lease_${lease.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
      });

      // Email to landlord
      const landlordEmailTemplate = emailTemplates.leaseCompleted({
        recipientName: landlordName,
        leaseNumber: lease.lease_number,
        propertyName: wizardData?.property?.address || 'Property',
        propertyAddress: wizardData?.property?.address || '',
        downloadUrl: `${baseUrl}/api/lease-sign/documents/${lease.id}/pdf`
      });

      await sendEmail({
        to: wizardData?.landlord?.email || '',
        subject: `✅ Lease Completed - ${lease.lease_number}`,
        html: landlordEmailTemplate.html,
        attachments: pdfPath ? [{ filename: `Lease_${lease.lease_number}.pdf`, path: pdfPath, contentType: 'application/pdf' }] : undefined
      });

      // Auto-create tenant, property, lease in main system
      await autoCreateRecords(lease, wizardData, lease.landlord_id);
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

// Auto-create records in main system after signing
const autoCreateRecords = async (lease: any, wizardData: any, landlordUserId: string) => {
  try {
    console.log('🔄 Auto-creating records in main system...');

    // 1. Create or update tenant
    const tenantEmail = wizardData?.tenant?.email;
    let tenantId: string | null = null;

    if (tenantEmail) {
      const existingTenant = await pool.query(
        'SELECT id FROM tenants WHERE email = $1',
        [tenantEmail]
      );

      if (existingTenant.rows.length > 0) {
        tenantId = existingTenant.rows[0].id;
        console.log('✅ Found existing tenant:', tenantId);
      } else {
        const newTenant = await pool.query(
          `INSERT INTO tenants (first_name, last_name, email, phone)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [
            wizardData?.tenant?.firstName || '',
            wizardData?.tenant?.lastName || '',
            tenantEmail,
            wizardData?.tenant?.phone || null
          ]
        );
        tenantId = newTenant.rows[0].id;
        console.log('✅ Created new tenant:', tenantId);
      }
    }

    // 2. Create or update property
    const propertyAddress = wizardData?.property?.address;
    let propertyId: string | null = null;

    if (propertyAddress) {
      const existingProperty = await pool.query(
        'SELECT id FROM properties WHERE address = $1 AND owner_id = $2',
        [propertyAddress, landlordUserId]
      );

      if (existingProperty.rows.length > 0) {
        propertyId = existingProperty.rows[0].id;
        console.log('✅ Found existing property:', propertyId);
      } else {
        const newProperty = await pool.query(
          `INSERT INTO properties (name, address, city, state, zip_code, property_type, owner_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            propertyAddress,
            propertyAddress,
            wizardData?.property?.city || '',
            wizardData?.property?.state || 'TX',
            wizardData?.property?.zip || '',
            wizardData?.property?.propertyType || 'single_family',
            landlordUserId
          ]
        );
        propertyId = newProperty.rows[0].id;
        console.log('✅ Created new property:', propertyId);
      }
    }

    // 3. Create unit if needed
    let unitId: string | null = null;
    if (propertyId) {
      const newUnit = await pool.query(
        `INSERT INTO units (property_id, unit_number, unit_type, rent_amount)
         VALUES ($1, '1', 'studio', $2) RETURNING id`,
        [propertyId, wizardData?.rent?.monthlyRent || 0]
      );
      unitId = newUnit.rows[0].id;
      console.log('✅ Created unit:', unitId);
    }

    // 4. Update the lease with the main system references
    if (tenantId && propertyId) {
      await pool.query(
        `UPDATE leases SET tenant_id = $1, property_id = $2, unit_id = $3 WHERE id = $4`,
        [tenantId, propertyId, unitId, lease.id]
      );
      console.log('✅ Updated lease with tenant and property references');
    }

    console.log('✅ Auto-create records completed');
  } catch (error) {
    console.error('❌ Auto-create records error:', error);
  }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1 AND landlord_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const lease = checkResult.rows[0];

    if (lease.status === 'active') {
      return res.status(400).json({ error: 'Cannot delete an active lease. Void it instead.' });
    }

    await pool.query('DELETE FROM leases WHERE id = $1', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Void document
export const voidDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const checkResult = await pool.query(
      'SELECT * FROM leases WHERE id = $1 AND landlord_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await pool.query(
      'UPDATE leases SET status = $1, termination_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['terminated', reason || 'Voided by user', id]
    );

    res.json({ message: 'Document voided successfully' });
  } catch (error) {
    console.error('Void document error:', error);
    res.status(500).json({ error: 'Failed to void document' });
  }
};

// Download PDF
export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    let userId: string | undefined;

    // Check for token in query param
    if (token && typeof token === 'string') {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Get lease
    const result = await pool.query('SELECT * FROM leases WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const lease = result.rows[0];

    // Generate PDF
    await generateLeasePDF(lease as any, res);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// Add comment
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { text, section } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const result = await pool.query(
      `INSERT INTO lease_comments (lease_id, author_name, author_email, author_role, comment_text, section)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, `${user.first_name} ${user.last_name}`, user.email, 'landlord', text, section]
    );

    res.status(201).json({ comment: result.rows[0] });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// Mark notification read
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Get stats
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_documents,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_documents,
        COUNT(CASE WHEN status = 'pending_signature' THEN 1 END) as pending_documents,
        COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_documents,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as completed_documents,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as voided_documents
       FROM leases WHERE landlord_id = $1 AND is_template = false`,
      [userId]
    );

    const unreadResult = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      stats: {
        ...statsResult.rows[0],
        unreadNotifications: parseInt(unreadResult.rows[0].unread_count) || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
