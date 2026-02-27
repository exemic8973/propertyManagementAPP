import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

interface LeaseData {
  id: string;
  lease_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  pet_fee?: number;
  pet_deposit?: number;
  utilities_included?: boolean;
  parking_spaces?: number;
  status: string;
  // Flat structure from SQL joins
  tenant_first_name: string;
  tenant_last_name: string;
  tenant_email: string;
  tenant_phone?: string;
  property_name: string;
  property_address: string;
  property_city?: string;
  property_state?: string;
  property_zip?: string;
  unit_number?: string;
  unit_type?: string;
  landlord_first_name: string;
  landlord_last_name: string;
  landlord_signed_at?: string;
  landlord_signed_ip?: string;
  tenant_signed_at?: string;
  tenant_signed_ip?: string;
  tenant_signature?: string;
  landlord_signature?: string;
}

const UPLOADS_DIR = path.join(__dirname, '../../uploads/leases');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const generateLeasePDF = (lease: LeaseData, res?: Response): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: `Lease Agreement - ${lease.lease_number}`,
        Author: 'Property Management Suite',
        Subject: 'Residential Lease Agreement'
      }
    });

    const fileName = `lease_${lease.lease_number}_${Date.now()}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Also pipe to response if provided
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Lease_${lease.lease_number}.pdf"`);
      doc.pipe(res);
    }

    // Helper functions
    const field = (val: any) => val || '________________________';
    const money = (val: number) => val ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$____________';
    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '____________';

    let pageNum = 1;

    // Header
    const addHeader = () => {
      doc.fontSize(8).fillColor('#666666');
      doc.text('RESIDENTIAL LEASE AGREEMENT', 60, 30, { align: 'center' });
      doc.text(`Page ${pageNum}`, 500, 30);
      doc.text(`Lease #: ${lease.lease_number}`, 60, 30, { align: 'right' });
      doc.fillColor('#000000');
      pageNum++;
    };

    // Footer
    const addFooter = () => {
      const y = doc.page.height - 40;
      doc.fontSize(7).fillColor('#666666');
      doc.text(`${lease.property_address} | Landlord: ${lease.landlord_first_name} ${lease.landlord_last_name} | Tenant: ${lease.tenant_first_name} ${lease.tenant_last_name}`, 60, y, { align: 'center' });
      doc.fillColor('#000000');
    };

    // Content
    addHeader();

    // Title
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('RESIDENTIAL LEASE AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);

    // Lease Info
    doc.fontSize(10).font('Helvetica');
    doc.text(`Lease Number: ${lease.lease_number}`, { align: 'center' });
    doc.text(`Created: ${formatDate(new Date().toISOString())}`, { align: 'center' });
    doc.moveDown();

    // Section 1: Parties
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('1. PARTIES', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.3);
    doc.text(`This Lease Agreement ("Agreement") is entered into by and between:`);
    doc.moveDown(0.3);
    doc.text(`LANDLORD: ${lease.landlord_first_name} ${lease.landlord_last_name}`);
    doc.moveDown(0.3);
    doc.text(`TENANT: ${lease.tenant_first_name} ${lease.tenant_last_name}`);
    doc.text(`Email: ${lease.tenant_email}`);
    if (lease.tenant_phone) doc.text(`Phone: ${lease.tenant_phone}`);
    doc.moveDown();

    // Section 2: Premises
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('2. PREMISES', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.3);
    doc.text(`Property: ${lease.property_name}`);
    doc.text(`Address: ${lease.property_address}`);
    if (lease.property_city) doc.text(`City: ${lease.property_city}, ${lease.property_state || ''} ${lease.property_zip || ''}`);
    if (lease.unit_number) doc.text(`Unit: ${lease.unit_number} (${(lease.unit_type || '').replace('_', ' ')})`);
    doc.moveDown();

    // Section 3: Term
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('3. LEASE TERM', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.3);
    doc.text(`Start Date: ${formatDate(lease.start_date)}`);
    doc.text(`End Date: ${formatDate(lease.end_date)}`);
    doc.moveDown();

    // Section 4: Rent
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('4. RENT', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.3);
    doc.text(`Monthly Rent: ${money(lease.monthly_rent)}`);
    doc.text(`Security Deposit: ${money(lease.security_deposit)}`);
    if (lease.pet_fee && lease.pet_fee > 0) doc.text(`Pet Fee: ${money(lease.pet_fee)}`);
    if (lease.pet_deposit && lease.pet_deposit > 0) doc.text(`Pet Deposit: ${money(lease.pet_deposit)}`);
    doc.moveDown();

    // Section 5: Other Terms
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('5. OTHER TERMS', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.3);
    doc.text(`Utilities Included: ${lease.utilities_included ? 'Yes' : 'No'}`);
    doc.text(`Parking Spaces: ${lease.parking_spaces || 0}`);
    doc.moveDown();

    // Signatures Section
    doc.addPage();
    addHeader();

    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('ELECTRONIC SIGNATURES', { align: 'center' });
    doc.moveDown();

    doc.fontSize(9).font('Helvetica');
    doc.text('By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this Lease Agreement. Electronic signatures are legally binding under the ESIGN Act and UETA.', { align: 'justify' });
    doc.moveDown(2);

    // Tenant Signature
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('TENANT SIGNATURE');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    doc.text(`Name: ${lease.tenant_first_name} ${lease.tenant_last_name}`);
    doc.text(`Email: ${lease.tenant_email}`);
    doc.moveDown(0.5);
    
    if (lease.tenant_signed_at) {
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text(`Signed: ${formatDate(lease.tenant_signed_at)}`);
      doc.text(`IP Address: ${lease.tenant_signed_ip || 'N/A'}`);
      doc.moveDown(0.5);
      
      // Draw signature image if available
      if (lease.tenant_signature) {
        try {
          const signatureData = lease.tenant_signature.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(signatureData, 'base64');
          doc.image(signatureBuffer, { width: 200, height: 60 });
        } catch (e) {
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text(`Signature: ${lease.tenant_first_name} ${lease.tenant_last_name}`, { underline: true });
        }
      } else {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Signature: ${lease.tenant_first_name} ${lease.tenant_last_name}`, { underline: true });
      }
    } else {
      doc.text('Status: Pending Signature');
    }
    doc.moveDown(2);

    // Landlord Signature
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('LANDLORD SIGNATURE');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    doc.text(`Name: ${lease.landlord_first_name} ${lease.landlord_last_name}`);
    doc.moveDown(0.5);
    
    if (lease.landlord_signed_at) {
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text(`Signed: ${formatDate(lease.landlord_signed_at)}`);
      doc.text(`IP Address: ${lease.landlord_signed_ip || 'N/A'}`);
      doc.moveDown(0.5);
      
      // Draw signature image if available
      if (lease.landlord_signature) {
        try {
          const signatureData = lease.landlord_signature.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(signatureData, 'base64');
          doc.image(signatureBuffer, { width: 200, height: 60 });
        } catch (e) {
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text(`Signature: ${lease.landlord_first_name} ${lease.landlord_last_name}`, { underline: true });
        }
      } else {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Signature: ${lease.landlord_first_name} ${lease.landlord_last_name}`, { underline: true });
      }
    } else {
      doc.text('Status: Pending Signature');
    }
    doc.moveDown(2);

    // Certificate
    if (lease.status === 'active' || (lease.tenant_signed_at && lease.landlord_signed_at)) {
      doc.addPage();
      addHeader();

      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('ELECTRONIC SIGNING CERTIFICATE', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      doc.text(`This document was electronically signed on ${formatDate(lease.landlord_signed_at || lease.tenant_signed_at || new Date().toISOString())}.`);
      doc.moveDown();

      doc.text('Document Details:', { underline: true });
      doc.text(`Lease Number: ${lease.lease_number}`);
      doc.text(`Property: ${lease.property_name} - ${lease.property_address}`);
      doc.text(`Tenant: ${lease.tenant_first_name} ${lease.tenant_last_name} (${lease.tenant_email})`);
      doc.text(`Landlord: ${lease.landlord_first_name} ${lease.landlord_last_name}`);
      doc.moveDown();

      doc.text('Signature Audit Trail:', { underline: true });
      if (lease.tenant_signed_at) {
        doc.text(`Tenant signed on ${formatDate(lease.tenant_signed_at)} from IP: ${lease.tenant_signed_ip || 'N/A'}`);
      }
      if (lease.landlord_signed_at) {
        doc.text(`Landlord signed on ${formatDate(lease.landlord_signed_at)} from IP: ${lease.landlord_signed_ip || 'N/A'}`);
      }
      doc.moveDown();

      doc.fontSize(8).fillColor('#666666');
      doc.text('This electronic record and electronic signature are legally binding under the Electronic Signatures in Global and National Commerce Act (ESIGN Act) and the Uniform Electronic Transactions Act (UETA).', { align: 'justify' });
    }

    addFooter();

    // Finalize PDF
    doc.end();

    writeStream.on('finish', () => {
      resolve(filePath);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};

export const getPDFPath = (leaseId: string): string | null => {
  const files = fs.readdirSync(UPLOADS_DIR);
  const leaseFile = files.find(f => f.includes(leaseId));
  return leaseFile ? path.join(UPLOADS_DIR, leaseFile) : null;
};

export default { generateLeasePDF, getPDFPath };
