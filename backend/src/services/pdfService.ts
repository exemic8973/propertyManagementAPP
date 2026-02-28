import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

interface WizardData {
  landlord?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  tenant?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    ssn?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  property?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    furnished?: boolean;
  };
  terms?: {
    startDate?: string;
    endDate?: string;
    leaseType?: string;
    isRenewal?: boolean;
  };
  rent?: {
    monthlyRent?: number;
    securityDeposit?: number;
    petDeposit?: number;
    petRent?: number;
    lateFee?: number;
    gracePeriod?: number;
    rentDueDay?: number;
    paymentMethods?: string[];
    proratedRent?: number;
  };
  rules?: {
    smokingAllowed?: boolean;
    petAllowed?: boolean;
    petDetails?: string;
    guestPolicy?: string;
    quietHours?: string;
    subletAllowed?: boolean;
    alterationsAllowed?: boolean;
  };
  additional?: {
    utilities?: string[];
    appliances?: string[];
    parkingSpaces?: number;
    parkingFee?: number;
    storageIncluded?: boolean;
    specialProvisions?: string;
    leadPaintDisclosure?: boolean;
    moldDisclosure?: boolean;
  };
  additionalTenants?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
  }>;
  otherOccupants?: Array<{
    name: string;
    age: number;
    relationship: string;
  }>;
}

interface LeaseData {
  id: string;
  lease_number: string;
  start_date?: string;
  end_date?: string;
  monthly_rent?: number;
  security_deposit?: number;
  pet_fee?: number;
  pet_deposit?: number;
  utilities_included?: boolean;
  parking_spaces?: number;
  status: string;
  wizard_data?: WizardData;
  // Flat structure from SQL joins (legacy support)
  tenant_first_name?: string;
  tenant_last_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  property_name?: string;
  property_address?: string;
  property_city?: string;
  property_state?: string;
  property_zip?: string;
  unit_number?: string;
  unit_type?: string;
  landlord_first_name?: string;
  landlord_last_name?: string;
  landlord_signed_at?: string;
  landlord_signed_ip?: string;
  tenant_signed_at?: string;
  tenant_signed_ip?: string;
  tenant_signature?: string;
  landlord_signature?: string;
  created_at?: string;
}

const UPLOADS_DIR = path.join(__dirname, '../../uploads/leases');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper functions
const field = (val: any, defaultVal = '________________________') => val || defaultVal;
const money = (val: number | undefined) => val ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$____________';
const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '____________';
const yesNo = (val: boolean | undefined) => val === true ? 'Yes' : val === false ? 'No' : '____________';

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

    // Determine if using wizard_data or legacy format
    const wizard = lease.wizard_data;
    const useWizard = !!wizard;

    // Extract data based on format
    const landlordFirstName = useWizard ? wizard!.landlord?.firstName : lease.landlord_first_name;
    const landlordLastName = useWizard ? wizard!.landlord?.lastName : lease.landlord_last_name;
    const landlordEmail = useWizard ? wizard!.landlord?.email : '';
    const landlordPhone = useWizard ? wizard!.landlord?.phone : undefined;
    const landlordAddress = useWizard ? wizard!.landlord?.address : undefined;

    const tenantFirstName = useWizard ? wizard!.tenant?.firstName : lease.tenant_first_name;
    const tenantLastName = useWizard ? wizard!.tenant?.lastName : lease.tenant_last_name;
    const tenantEmail = useWizard ? wizard!.tenant?.email : lease.tenant_email;
    const tenantPhone = useWizard ? wizard!.tenant?.phone : lease.tenant_phone;

    const propertyAddress = useWizard ? wizard!.property?.address : lease.property_address;
    const propertyCity = useWizard ? wizard!.property?.city : lease.property_city;
    const propertyState = useWizard ? wizard!.property?.state : lease.property_state;
    const propertyZip = useWizard ? wizard!.property?.zip : lease.property_zip;

    const startDate = useWizard ? wizard!.terms?.startDate : lease.start_date;
    const endDate = useWizard ? wizard!.terms?.endDate : lease.end_date;
    const monthlyRent = useWizard ? wizard!.rent?.monthlyRent : lease.monthly_rent;
    const securityDeposit = useWizard ? wizard!.rent?.securityDeposit : lease.security_deposit;
    const petDeposit = useWizard ? wizard!.rent?.petDeposit : lease.pet_deposit;

    let pageNum = 1;

    // Header
    const addHeader = () => {
      doc.fontSize(8).fillColor('#666666');
      doc.text('RESIDENTIAL LEASE AGREEMENT', 60, 30, { align: 'center' });
      doc.text(`Page ${pageNum}`, 500, 30);
      doc.text(`Lease #: ${lease.lease_number}`, 60, 30, { align: 'right' });
      doc.fillColor('#000000');
    };

    // Footer
    const addFooter = () => {
      const y = doc.page.height - 40;
      doc.fontSize(7).fillColor('#666666');
      doc.text(`${propertyAddress || 'Property Address'} | Landlord: ${landlordFirstName || ''} ${landlordLastName || ''} | Tenant: ${tenantFirstName || ''} ${tenantLastName || ''}`, 60, y, { align: 'center' });
      doc.fillColor('#000000');
    };

    // Add section with consistent styling
    const addSection = (title: string) => {
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(title, { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.3);
    };

    // Content
    addHeader();

    // Title
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('RESIDENTIAL LEASE AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);

    // TAR TXR-2001 Header
    doc.fontSize(10).font('Helvetica');
    doc.text('Texas Real Estate Commission', { align: 'center' });
    doc.text('Residential Lease Agreement (TAR TXR-2001)', { align: 'center' });
    doc.moveDown(0.3);

    // Lease Info
    doc.text(`Lease Number: ${lease.lease_number}`, { align: 'center' });
    doc.text(`Date: ${formatDate(lease.created_at || new Date().toISOString())}`, { align: 'center' });
    doc.moveDown();

    // Section 1: Parties
    addSection('1. PARTIES');
    doc.text(`This Lease Agreement ("Agreement") is entered into by and between:`);
    doc.moveDown(0.3);
    
    doc.font('Helvetica-Bold').text('LANDLORD:');
    doc.font('Helvetica');
    doc.text(`Name: ${field(landlordFirstName)} ${field(landlordLastName)}`);
    if (landlordEmail) doc.text(`Email: ${landlordEmail}`);
    if (landlordPhone) doc.text(`Phone: ${landlordPhone}`);
    if (landlordAddress) doc.text(`Address: ${landlordAddress}`);
    if (useWizard && wizard?.landlord?.city) {
      doc.text(`City: ${wizard.landlord.city}, ${wizard.landlord.state || ''} ${wizard.landlord.zip || ''}`);
    }
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('TENANT:');
    doc.font('Helvetica');
    doc.text(`Name: ${field(tenantFirstName)} ${field(tenantLastName)}`);
    if (tenantEmail) doc.text(`Email: ${tenantEmail}`);
    if (tenantPhone) doc.text(`Phone: ${tenantPhone}`);
    if (useWizard && wizard?.tenant?.dateOfBirth) doc.text(`Date of Birth: ${formatDate(wizard.tenant.dateOfBirth)}`);
    doc.moveDown(0.5);

    // Additional Tenants
    if (useWizard && wizard?.additionalTenants && wizard.additionalTenants.length > 0) {
      doc.font('Helvetica-Bold').text('ADDITIONAL TENANTS:');
      doc.font('Helvetica');
      wizard.additionalTenants.forEach((t, i) => {
        doc.text(`${i + 1}. ${t.firstName} ${t.lastName} (${t.relationship}) - Email: ${t.email}`);
      });
      doc.moveDown(0.5);
    }

    // Other Occupants
    if (useWizard && wizard?.otherOccupants && wizard.otherOccupants.length > 0) {
      doc.font('Helvetica-Bold').text('OTHER OCCUPANTS:');
      doc.font('Helvetica');
      wizard.otherOccupants.forEach((o, i) => {
        doc.text(`${i + 1}. ${o.name} (Age: ${o.age}, Relationship: ${o.relationship})`);
      });
      doc.moveDown(0.5);
    }

    // Section 2: Premises
    addSection('2. PREMISES');
    doc.text('The Landlord leases to Tenant the following premises:');
    doc.moveDown(0.3);
    doc.text(`Property Address: ${field(propertyAddress)}`);
    if (propertyCity || propertyState || propertyZip) {
      doc.text(`City: ${field(propertyCity)}, ${field(propertyState)} ${field(propertyZip)}`);
    }
    if (useWizard) {
      if (wizard?.property?.propertyType) doc.text(`Property Type: ${wizard.property.propertyType.replace('_', ' ')}`);
      if (wizard?.property?.bedrooms) doc.text(`Bedrooms: ${wizard.property.bedrooms}`);
      if (wizard?.property?.bathrooms) doc.text(`Bathrooms: ${wizard.property.bathrooms}`);
      if (wizard?.property?.squareFeet) doc.text(`Square Feet: ${wizard.property.squareFeet.toLocaleString()}`);
      if (wizard?.property?.furnished !== undefined) doc.text(`Furnished: ${yesNo(wizard.property.furnished)}`);
    } else {
      if (lease.unit_number) doc.text(`Unit: ${lease.unit_number}`);
      if (lease.unit_type) doc.text(`Unit Type: ${lease.unit_type.replace('_', ' ')}`);
    }
    doc.moveDown();

    // Section 3: Term
    addSection('3. LEASE TERM');
    doc.text(`Start Date: ${formatDate(startDate)}`);
    doc.text(`End Date: ${formatDate(endDate)}`);
    if (useWizard) {
      if (wizard?.terms?.leaseType) doc.text(`Lease Type: ${wizard.terms.leaseType}`);
      if (wizard?.terms?.isRenewal) doc.text(`This is a renewal lease: Yes`);
    }
    doc.moveDown();

    // Section 4: Rent
    addSection('4. RENT');
    doc.text(`Monthly Rent: ${money(monthlyRent)}`);
    doc.text(`Security Deposit: ${money(securityDeposit)}`);
    if (petDeposit) doc.text(`Pet Deposit: ${money(petDeposit)}`);
    if (useWizard) {
      if (wizard?.rent?.petRent) doc.text(`Monthly Pet Rent: ${money(wizard.rent.petRent)}`);
      if (wizard?.rent?.lateFee) doc.text(`Late Fee: ${money(wizard.rent.lateFee)}`);
      if (wizard?.rent?.gracePeriod) doc.text(`Grace Period: ${wizard.rent.gracePeriod} days`);
      if (wizard?.rent?.rentDueDay) doc.text(`Rent Due Day: ${wizard.rent.rentDueDay}${wizard.rent.rentDueDay === 1 ? 'st' : wizard.rent.rentDueDay === 2 ? 'nd' : wizard.rent.rentDueDay === 3 ? 'rd' : 'th'} of each month`);
      if (wizard?.rent?.proratedRent) doc.text(`Prorated First Month Rent: ${money(wizard.rent.proratedRent)}`);
      if (wizard?.rent?.paymentMethods && wizard.rent.paymentMethods.length > 0) {
        doc.text(`Payment Methods: ${wizard.rent.paymentMethods.join(', ')}`);
      }
    }
    doc.moveDown();

    // Section 5: Utilities and Services
    addSection('5. UTILITIES AND SERVICES');
    if (useWizard && wizard?.additional?.utilities) {
      doc.text('Utilities to be paid by Tenant:', { underline: true });
      if (wizard.additional.utilities.length > 0) {
        wizard.additional.utilities.forEach((u) => doc.text(`• ${u}`));
      } else {
        doc.text('None specified');
      }
    } else {
      doc.text(`Utilities Included in Rent: ${yesNo(lease.utilities_included)}`);
    }
    doc.moveDown();

    // Section 6: Parking and Storage
    addSection('6. PARKING AND STORAGE');
    if (useWizard) {
      if (wizard?.additional?.parkingSpaces) {
        doc.text(`Parking Spaces: ${wizard.additional.parkingSpaces}`);
        if (wizard.additional.parkingFee) doc.text(`Parking Fee: ${money(wizard.additional.parkingFee)}`);
      }
      if (wizard?.additional?.storageIncluded !== undefined) {
        doc.text(`Storage Included: ${yesNo(wizard.additional.storageIncluded)}`);
      }
    } else {
      doc.text(`Parking Spaces: ${lease.parking_spaces || 0}`);
    }
    doc.moveDown();

    // Section 7: Appliances and Furnishings
    if (useWizard && wizard?.additional?.appliances && wizard.additional.appliances.length > 0) {
      addSection('7. APPLIANCES AND FURNISHINGS');
      doc.text('Appliances included:');
      wizard.additional.appliances.forEach((a) => doc.text(`• ${a}`));
      doc.moveDown();
    }

    // Section 8: Rules and Restrictions
    addSection(useWizard && wizard?.additional?.appliances && wizard.additional.appliances.length > 0 ? '8. RULES AND RESTRICTIONS' : '7. RULES AND RESTRICTIONS');
    if (useWizard) {
      doc.text(`Smoking Allowed: ${yesNo(wizard?.rules?.smokingAllowed)}`);
      doc.text(`Pets Allowed: ${yesNo(wizard?.rules?.petAllowed)}`);
      if (wizard?.rules?.petDetails) doc.text(`Pet Details: ${wizard.rules.petDetails}`);
      if (wizard?.rules?.guestPolicy) doc.text(`Guest Policy: ${wizard.rules.guestPolicy}`);
      if (wizard?.rules?.quietHours) doc.text(`Quiet Hours: ${wizard.rules.quietHours}`);
      doc.text(`Subletting Allowed: ${yesNo(wizard?.rules?.subletAllowed)}`);
      doc.text(`Alterations Allowed: ${yesNo(wizard?.rules?.alterationsAllowed)}`);
    }
    doc.moveDown();

    // Section 9: Disclosures
    addSection(useWizard && wizard?.additional?.appliances && wizard.additional.appliances.length > 0 ? '9. DISCLOSURES' : '8. DISCLOSURES');
    if (useWizard) {
      doc.text(`Lead Paint Disclosure Provided: ${yesNo(wizard?.additional?.leadPaintDisclosure)}`);
      doc.text(`Mold Disclosure Provided: ${yesNo(wizard?.additional?.moldDisclosure)}`);
    } else {
      doc.text('Lead Paint Disclosure: Provided if property was built before 1978');
      doc.text('Mold Disclosure: Provided as required by Texas law');
    }
    doc.moveDown();

    // Section 10: Special Provisions
    if (useWizard && wizard?.additional?.specialProvisions) {
      addSection(useWizard && wizard?.additional?.appliances && wizard.additional.appliances.length > 0 ? '10. SPECIAL PROVISIONS' : '9. SPECIAL PROVISIONS');
      doc.text(wizard.additional.specialProvisions);
      doc.moveDown();
    }

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
    
    doc.text(`Name: ${tenantFirstName || ''} ${tenantLastName || ''}`);
    if (tenantEmail) doc.text(`Email: ${tenantEmail}`);
    if (tenantPhone) doc.text(`Phone: ${tenantPhone}`);
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
          doc.text(`Signature: ${tenantFirstName || ''} ${tenantLastName || ''}`, { underline: true });
        }
      } else {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Signature: ${tenantFirstName || ''} ${tenantLastName || ''}`, { underline: true });
      }
    } else {
      doc.text('Status: Pending Signature');
    }
    doc.moveDown(2);

    // Additional Tenant Signatures
    if (useWizard && wizard?.additionalTenants && wizard.additionalTenants.length > 0) {
      wizard.additionalTenants.forEach((t, i) => {
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`ADDITIONAL TENANT ${i + 1} SIGNATURE`);
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${t.firstName} ${t.lastName}`);
        doc.text(`Email: ${t.email}`);
        doc.text(`Relationship: ${t.relationship}`);
        doc.text('Status: Pending Signature');
        doc.moveDown(1);
      });
    }

    // Landlord Signature
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('LANDLORD SIGNATURE');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    doc.text(`Name: ${landlordFirstName || ''} ${landlordLastName || ''}`);
    if (landlordEmail) doc.text(`Email: ${landlordEmail}`);
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
          doc.text(`Signature: ${landlordFirstName || ''} ${landlordLastName || ''}`, { underline: true });
        }
      } else {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Signature: ${landlordFirstName || ''} ${landlordLastName || ''}`, { underline: true });
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
      doc.text(`Property: ${propertyAddress || 'Property Address'}`);
      if (propertyCity || propertyState || propertyZip) {
        doc.text(`Location: ${propertyCity || ''}, ${propertyState || ''} ${propertyZip || ''}`);
      }
      doc.text(`Tenant: ${tenantFirstName || ''} ${tenantLastName || ''} (${tenantEmail || ''})`);
      doc.text(`Landlord: ${landlordFirstName || ''} ${landlordLastName || ''}`);
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
      doc.moveDown();
      doc.text('Texas law requires landlords to provide a copy of this signed lease to the tenant within 3 business days of execution.', { align: 'justify' });
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
