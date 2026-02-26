import fs from 'fs';
import path from 'path';
import pool from './connection';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database migrations completed successfully');
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
