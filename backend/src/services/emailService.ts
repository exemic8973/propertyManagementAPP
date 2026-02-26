import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Property Management" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  // Lease created notification
  leaseCreated: (data: {
    landlordName: string;
    tenantName: string;
    tenantEmail: string;
    leaseNumber: string;
    propertyName: string;
    propertyAddress: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
    signUrl: string;
  }) => ({
    to: data.tenantEmail,
    subject: `New Lease Agreement Ready for Signature - ${data.leaseNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Lease Agreement Ready</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.tenantName}</strong>,</p>
            <p>A new lease agreement has been created for you by <strong>${data.landlordName}</strong>.</p>
            <p>Please review and sign the lease agreement at your earliest convenience.</p>
            
            <div class="details">
              <h3>Lease Details</h3>
              <div class="detail-row">
                <span class="detail-label">Lease Number:</span>
                <span>${data.leaseNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Property:</span>
                <span>${data.propertyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span>${data.propertyAddress}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monthly Rent:</span>
                <span>$${data.monthlyRent.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Lease Period:</span>
                <span>${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.signUrl}" class="button">✍️ Sign Lease Agreement</a>
            </p>
            
            <p><small>By clicking the button above, you will be directed to our secure portal to review and electronically sign your lease agreement.</small></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Property Management Suite.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Signing request email (for public signing page)
  signingRequest: (data: {
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    leaseNumber: string;
    propertyName: string;
    propertyAddress: string;
    signUrl: string;
    expiresAt: string;
  }) => ({
    to: data.recipientEmail,
    subject: `[Action Required] Sign Lease Agreement - ${data.leaseNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✍️ E-Signature Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required: Please review and sign</p>
          </div>
          <div class="content">
            <p>Hello <strong>${data.recipientName}</strong>,</p>
            <p><strong>${data.senderName}</strong> has requested your electronic signature on a lease agreement.</p>
            
            <div class="details">
              <h3 style="margin-top: 0;">📄 Document Details</h3>
              <p><strong>Lease Number:</strong> ${data.leaseNumber}</p>
              <p><strong>Property:</strong> ${data.propertyName}</p>
              <p><strong>Address:</strong> ${data.propertyAddress}</p>
            </div>
            
            <div class="warning">
              <strong>⏰ Expires:</strong> This signing link will expire on ${new Date(data.expiresAt).toLocaleDateString()}. 
              Please sign before this date.
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.signUrl}" class="button">Review & Sign Document</a>
            </p>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${data.signUrl}" style="word-break: break-all; color: #3b82f6;">${data.signUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Property Management Suite.</p>
            <p>Your electronic signature is legally binding under the ESIGN Act and UETA.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Lease signed notification
  leaseSigned: (data: {
    recipientName: string;
    signerName: string;
    signerRole: string;
    leaseNumber: string;
    propertyName: string;
    isFullySigned: boolean;
    signUrl?: string;
  }) => ({
    to: '', // Will be set by caller
    subject: `Lease Signed - ${data.leaseNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Lease Agreement Signed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.recipientName}</strong>,</p>
            <p><strong>${data.signerName}</strong> (${data.signerRole}) has signed the lease agreement <strong>${data.leaseNumber}</strong> for <strong>${data.propertyName}</strong>.</p>
            
            ${data.isFullySigned ? `
              <div class="details" style="border-left: 4px solid #22c55e;">
                <h3 style="color: #22c55e; margin-top: 0;">🎉 Lease is Now Active!</h3>
                <p>All parties have signed the lease agreement. The lease is now legally binding and active.</p>
              </div>
            ` : `
              <div class="details">
                <p>The lease is still awaiting signatures from other parties. You will be notified once all signatures are collected.</p>
                ${data.signUrl ? `<p style="text-align: center; margin: 20px 0;"><a href="${data.signUrl}" class="button">Sign Your Copy</a></p>` : ''}
              </div>
            `}
          </div>
          <div class="footer">
            <p>This is an automated message from Property Management Suite.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Lease completed with PDF attachment
  leaseCompleted: (data: {
    recipientName: string;
    leaseNumber: string;
    propertyName: string;
    propertyAddress: string;
    downloadUrl: string;
  }) => ({
    to: '', // Will be set by caller
    subject: `✅ Lease Completed - ${data.leaseNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
          .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Lease Fully Executed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">All parties have signed</p>
          </div>
          <div class="content">
            <p>Hello <strong>${data.recipientName}</strong>,</p>
            <p>Great news! The lease agreement has been fully executed with all required signatures.</p>
            
            <div class="details">
              <h3 style="margin-top: 0;">📄 Lease Details</h3>
              <p><strong>Lease Number:</strong> ${data.leaseNumber}</p>
              <p><strong>Property:</strong> ${data.propertyName}</p>
              <p><strong>Address:</strong> ${data.propertyAddress}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.downloadUrl}" class="button">📥 Download Signed Lease (PDF)</a>
            </p>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              A copy of the signed lease is also attached to this email.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Property Management Suite.</p>
            <p>Please keep this document for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export default { sendEmail, emailTemplates };
