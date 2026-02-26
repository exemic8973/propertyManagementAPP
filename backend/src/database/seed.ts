import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/property_management'
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create test users
    const testUsers = [
      {
        email: 'landlord@test.com',
        password_hash: passwordHash,
        first_name: 'John',
        last_name: 'Landlord',
        role: 'landlord',
        phone: '+1234567890',
        is_active: true
      },
      {
        email: 'manager@test.com',
        password_hash: passwordHash,
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'property_manager',
        phone: '+1234567891',
        is_active: true
      },
      {
        email: 'tenant@test.com',
        password_hash: passwordHash,
        first_name: 'Mike',
        last_name: 'Tenant',
        role: 'tenant',
        phone: '+1234567892',
        is_active: true
      },
      {
        email: 'agent@test.com',
        password_hash: passwordHash,
        first_name: 'Emily',
        last_name: 'Agent',
        role: 'agent',
        phone: '+1234567893',
        is_active: true
      }
    ];

    // Insert users
    for (const user of testUsers) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()
         RETURNING id, email, first_name, last_name, role`,
        [user.email, user.password_hash, user.first_name, user.last_name, user.role, user.phone, user.is_active]
      );

      console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
    }

    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Test Accounts Created:');
    console.log('┌─────────────────────┬─────────────────┬──────────────┐');
    console.log('│ Email                │ Role            │ Password     │');
    console.log('├─────────────────────┼─────────────────┼──────────────┤');
    console.log('│ landlord@test.com    │ Landlord        │ password123 │');
    console.log('│ manager@test.com     │ Property Manager│ password123 │');
    console.log('│ tenant@test.com      │ Tenant          │ password123 │');
    console.log('│ agent@test.com       │ Agent           │ password123 │');
    console.log('└─────────────────────┴─────────────────┴──────────────┘');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
