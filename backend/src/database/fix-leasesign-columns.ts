import pool from './connection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixLeaseSignColumns() {
  try {
    console.log('🔄 Fixing leases table for e-sign functionality...');

    // Make property_id, unit_id, tenant_id nullable for e-sign drafts
    await pool.query(`
      ALTER TABLE leases 
      ALTER COLUMN property_id DROP NOT NULL,
      ALTER COLUMN unit_id DROP NOT NULL,
      ALTER COLUMN tenant_id DROP NOT NULL,
      ALTER COLUMN start_date DROP NOT NULL,
      ALTER COLUMN end_date DROP NOT NULL,
      ALTER COLUMN monthly_rent DROP NOT NULL,
      ALTER COLUMN security_deposit DROP NOT NULL
    `);
    console.log('✅ Made required columns nullable for e-sign drafts');

    // Add default values for status if needed
    await pool.query(`
      ALTER TABLE leases 
      ALTER COLUMN status SET DEFAULT 'draft'
    `);
    console.log('✅ Set default status to draft');

    // Add is_template column if it doesn't exist
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'leases' AND column_name = 'is_template'
    `);
    
    if (columnCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE leases ADD COLUMN is_template BOOLEAN DEFAULT false
      `);
      console.log('✅ Added is_template column');
    }

    console.log('✅ Migration completed successfully');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixLeaseSignColumns();
