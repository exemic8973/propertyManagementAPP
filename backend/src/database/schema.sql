-- Property Management Database Schema
-- PostgreSQL Schema for Complete Property Management Suite

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table - Authentication and User Management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('landlord', 'property_manager', 'tenant', 'agent')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('residential', 'commercial', 'mixed_use')),
    total_units INTEGER NOT NULL DEFAULT 1,
    year_built INTEGER,
    square_footage INTEGER,
    description TEXT,
    amenities TEXT[],
    purchase_price DECIMAL(12,2),
    purchase_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units Table
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('studio', '1_bed', '2_bed', '3_bed', '4_bed', 'loft', 'townhouse', 'house')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_footage INTEGER,
    rent_amount DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    is_occupied BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    amenities TEXT[],
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
);

-- Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    driver_license VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    employment_status VARCHAR(50),
    employer_name VARCHAR(255),
    monthly_income DECIMAL(10,2),
    credit_score INTEGER,
    background_check_status VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected', 'not_required')),
    background_check_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leases Table
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lease_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    late_fee_grace_period INTEGER DEFAULT 3,
    pet_fee DECIMAL(10,2) DEFAULT 0,
    pet_deposit DECIMAL(10,2) DEFAULT 0,
    utilities_included BOOLEAN DEFAULT false,
    parking_spaces INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
    signing_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    auto_renew BOOLEAN DEFAULT false,
    renewal_notice_days INTEGER DEFAULT 60,
    document_url TEXT,
    esignature_token UUID,
    landlord_signed BOOLEAN DEFAULT false,
    landlord_signed_at TIMESTAMP,
    tenant_signed BOOLEAN DEFAULT false,
    tenant_signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rent Payments Table
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'online', 'other')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'partial', 'overdue')),
    transaction_id VARCHAR(255),
    notes TEXT,
    late_fee_applied BOOLEAN DEFAULT false,
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests Table
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'landscaping', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('maintenance', 'repairs', 'utilities', 'insurance', 'taxes', 'mortgage', 'marketing', 'legal', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'other')),
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
    vendor_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    maintenance_request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('lease_agreement', 'application', 'id_proof', 'income_proof', 'receipt', 'invoice', 'photo', 'inspection_report', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('payment_reminder', 'late_fee', 'maintenance_update', 'lease_expiration', 'general', 'system')),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Audit Trail Table
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_units_property_id ON units(property_id);
CREATE INDEX idx_units_is_occupied ON units(is_occupied);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_leases_property_id ON leases(property_id);
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_rent_payments_lease_id ON rent_payments(lease_id);
CREATE INDEX idx_rent_payments_payment_date ON rent_payments(payment_date);
CREATE INDEX idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_expenses_property_id ON expenses(property_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_table_name ON audit_trail(table_name);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Updated At
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON rent_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
