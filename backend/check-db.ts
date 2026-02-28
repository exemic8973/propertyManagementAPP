import pool from './src/database/connection';

async function check() {
  try {
    // Check leases table structure
    const columns = await pool.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leases' 
      ORDER BY ordinal_position
    `);
    console.log('=== Leases Table Columns ===');
    console.log(JSON.stringify(columns.rows, null, 2));

    // Check existing leases
    const leases = await pool.query(`
      SELECT id, lease_number, status, wizard_data, is_template, property_id, unit_id, tenant_id
      FROM leases
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('\n=== Existing Leases ===');
    console.log(JSON.stringify(leases.rows, null, 2));

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
