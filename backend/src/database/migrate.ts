import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pool from './connection';

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    console.log(`📍 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    
    // Read the schema file from src directory
    const schemaPath = path.join(__dirname, '../../src/database/schema.sql');
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
