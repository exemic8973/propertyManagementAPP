import pool from './connection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function addEsignColumns() {
  try {
    console.log('🔄 Adding e-signature columns to leases table...');

    // Add signing tokens and tracking columns
    await pool.query(`
      ALTER TABLE leases 
      ADD COLUMN IF NOT EXISTS landlord_sign_token UUID,
      ADD COLUMN IF NOT EXISTS tenant_sign_token UUID,
      ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS landlord_signed_ip VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tenant_signed_ip VARCHAR(50),
      ADD COLUMN IF NOT EXISTS pdf_path TEXT
    `);

    console.log('✅ E-signature columns added successfully');

    // Generate tokens for existing leases that don't have them
    await pool.query(`
      UPDATE leases 
      SET landlord_sign_token = gen_random_uuid(),
          tenant_sign_token = gen_random_uuid()
      WHERE landlord_sign_token IS NULL
    `);

    console.log('✅ Generated signing tokens for existing leases');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addEsignColumns();
