import pool from './connection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixStatusConstraint() {
  try {
    console.log('🔄 Fixing status constraint to include "partial"...');

    // Drop the existing constraint
    await pool.query(`
      ALTER TABLE leases DROP CONSTRAINT IF EXISTS leases_status_check
    `);

    // Add the new constraint with 'partial' included
    await pool.query(`
      ALTER TABLE leases ADD CONSTRAINT leases_status_check 
      CHECK (status IN ('draft', 'pending_signature', 'partial', 'active', 'expired', 'terminated'))
    `);

    console.log('✅ Status constraint updated successfully');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixStatusConstraint();
