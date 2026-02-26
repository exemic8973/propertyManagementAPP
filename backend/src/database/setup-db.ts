import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load current .env to get the postgres admin credentials
const envPath = path.join(__dirname, '../../.env');

// First connect with the admin credentials to create user and database
async function setupDatabase() {
  // Prompt for admin credentials
  console.log('='.repeat(60));
  console.log('Property Management Database Setup');
  console.log('='.repeat(60));
  console.log('\nThis script will create:');
  console.log('  - Database: property_management');
  console.log('  - User: pm_user');
  console.log('  - Password: pm_secure_2024');
  console.log('\nPlease provide your PostgreSQL admin credentials:');
  console.log('='.repeat(60));

  // Admin connection (using postgres user)
  const adminPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: process.argv[2] || '12345', // Get password from command line
    database: 'postgres'
  });

  try {
    console.log('\n🔄 Connecting to PostgreSQL as admin...');
    
    // Test connection
    await adminPool.query('SELECT 1');
    console.log('✅ Connected successfully');

    // Check if database exists
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'property_management'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('\n🔄 Creating database "property_management"...');
      await adminPool.query('CREATE DATABASE property_management');
      console.log('✅ Database created');
    } else {
      console.log('\n✅ Database already exists');
    }

    // Check if user exists
    const userCheck = await adminPool.query(
      "SELECT 1 FROM pg_roles WHERE rolname = 'pm_user'"
    );

    if (userCheck.rows.length === 0) {
      console.log('\n🔄 Creating user "pm_user"...');
      await adminPool.query("CREATE USER pm_user WITH PASSWORD 'pm_secure_2024'");
      console.log('✅ User created');
    } else {
      console.log('\n🔄 User exists, updating password...');
      await adminPool.query("ALTER USER pm_user WITH PASSWORD 'pm_secure_2024'");
      console.log('✅ Password updated');
    }

    // Grant privileges
    console.log('\n🔄 Granting privileges...');
    await adminPool.query('GRANT ALL PRIVILEGES ON DATABASE property_management TO pm_user');
    console.log('✅ Privileges granted');

    // Close admin connection
    await adminPool.end();

    // Now connect as the new user to grant schema permissions
    const userPool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      user: 'pm_user',
      password: 'pm_secure_2024',
      database: 'property_management'
    });

    // Grant schema permissions
    await userPool.query('GRANT ALL ON SCHEMA public TO pm_user');
    await userPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pm_user');
    await userPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pm_user');
    
    console.log('✅ Schema permissions granted');
    
    await userPool.end();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Setup complete!');
    console.log('='.repeat(60));
    console.log('\nConnection details:');
    console.log('  Host: 127.0.0.1');
    console.log('  Port: 5432');
    console.log('  Database: property_management');
    console.log('  User: pm_user');
    console.log('  Password: pm_secure_2024');
    console.log('\nNow run: npm run migrate');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nPlease make sure:');
    console.log('  1. PostgreSQL is running on 127.0.0.1:5432');
    console.log('  2. The postgres user password is correct');
    console.log('  3. You may need to pass the password: node setup-db.js YOUR_PASSWORD');
    await adminPool.end().catch(() => {});
    process.exit(1);
  }
}

setupDatabase();
