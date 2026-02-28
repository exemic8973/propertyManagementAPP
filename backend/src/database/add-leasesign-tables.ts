import pool from './connection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function addLeaseSignTables() {
  try {
    console.log('🔄 Adding LeaseSign tables...');

    // Create templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lease_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        template_data JSONB NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created lease_templates table');

    // Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        document_id UUID REFERENCES leases(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        actor_name VARCHAR(255),
        actor_email VARCHAR(255),
        actor_role VARCHAR(50),
        ip_address VARCHAR(50),
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created audit_logs table');

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lease_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        author_role VARCHAR(50),
        comment_text TEXT NOT NULL,
        section VARCHAR(100),
        resolved BOOLEAN DEFAULT false,
        resolved_by VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created lease_comments table');

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        document_id UUID REFERENCES leases(id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created notifications table');

    // Add additional columns to leases table for LeaseSign data
    await pool.query(`
      ALTER TABLE leases 
      ADD COLUMN IF NOT EXISTS wizard_data JSONB,
      ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES lease_templates(id),
      ADD COLUMN IF NOT EXISTS additional_tenants JSONB,
      ADD COLUMN IF NOT EXISTS other_occupants JSONB
    `);
    console.log('✅ Added wizard_data and related columns to leases table');

    // Add template reference to users table for default template
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS default_template_id UUID REFERENCES lease_templates(id)
    `);
    console.log('✅ Added default_template_id to users table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_document ON audit_logs(document_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_comments_lease ON lease_comments(lease_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_templates_user ON lease_templates(user_id);
    `);
    console.log('✅ Created indexes');

    console.log('✅ LeaseSign tables added successfully');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addLeaseSignTables();
