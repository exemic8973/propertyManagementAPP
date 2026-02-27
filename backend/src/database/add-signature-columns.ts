import pool from './connection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function addSignatureColumns() {
  try {
    console.log('🔄 Adding signature image columns to leases table...');

    // Add columns for storing signature images (base64)
    await pool.query(`
      ALTER TABLE leases 
      ADD COLUMN IF NOT EXISTS tenant_signature TEXT,
      ADD COLUMN IF NOT EXISTS landlord_signature TEXT
    `);

    console.log('✅ Signature image columns added successfully');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addSignatureColumns();
