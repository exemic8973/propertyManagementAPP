# 🧪 Test Accounts for Property Management Suite

## 📋 Available Test Users

Here are the test accounts you can use to explore the Property Management application:

### 👑 **Landlord Account**
- **Email**: `landlord@test.com`
- **Password**: `password123`
- **Role**: Landlord
- **Name**: John Landlord
- **Access**: Full access to all properties, tenants, leases, and financial data

### 🏢 **Property Manager Account**
- **Email**: `manager@test.com`
- **Password**: `password123`
- **Role**: Property Manager
- **Name**: Sarah Manager
- **Access**: Manage properties assigned to them, handle tenant communications, process maintenance requests

### 👤 **Tenant Account**
- **Email**: `tenant@test.com`
- **Password**: `password123`
- **Role**: Tenant
- **Name**: Mike Tenant
- **Access**: View own lease information, make rent payments, submit maintenance requests

### 🏠 **Real Estate Agent Account**
- **Email**: `agent@test.com`
- **Password**: `password123`
- **Role**: Agent
- **Name**: Emily Agent
- **Access**: Show properties, manage viewings, assist with tenant applications

## 🚀 How to Use These Accounts

### Step 1: Set Up Database
```bash
cd backend
# Create PostgreSQL database
createdb property_management

# Set up environment variables in .env
DATABASE_URL=postgresql://username:password@localhost:5432/property_management
JWT_SECRET=your-super-secret-jwt-key

# Run migrations (when implemented)
npm run migrate

# Seed test accounts
npm run seed
```

### Step 2: Start the Application
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

### Step 3: Test Login
1. Open http://localhost:3000
2. Use any of the test accounts above
3. Explore the dashboard and features based on the role

## 🎭 Role-Based Access Testing

### **Landlord Features**:
- View all properties
- Add/edit properties
- Manage all tenants
- View financial reports
- Approve maintenance requests

### **Property Manager Features**:
- View assigned properties
- Manage tenant communications
- Process maintenance requests
- Generate reports for assigned properties

### **Tenant Features**:
- View personal dashboard
- See lease details
- Make rent payments
- Submit maintenance requests
- View payment history

### **Agent Features**:
- View property listings
- Schedule viewings
- Manage leads
- Update property availability

## 🔧 Quick Setup Commands

If you want to create these accounts manually in the database:

```sql
-- Insert test users (run in PostgreSQL)
INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at, updated_at) VALUES
('landlord@test.com', '$2b$10$rQZ8ZqZqZqZqZqZqZqZqZO', 'John', 'Landlord', 'landlord', '+1234567890', true, NOW(), NOW()),
('manager@test.com', '$2b$10$rQZ8ZqZqZqZqZqZqZqZqZO', 'Sarah', 'Manager', 'property_manager', '+1234567891', true, NOW(), NOW()),
('tenant@test.com', '$2b$10$rQZ8ZqZqZqZqZqZqZqZqZO', 'Mike', 'Tenant', 'tenant', '+1234567892', true, NOW(), NOW()),
('agent@test.com', '$2b$10$rQZ8ZqZqZqZqZqZqZqZqZO', 'Emily', 'Agent', 'agent', '+1234567893', true, NOW(), NOW());
```

## 🐛 Troubleshooting

### **Login Issues**:
1. Make sure the backend is running on port 5000
2. Check that the database connection is working
3. Verify the users exist in the database
4. Ensure JWT_SECRET is set in .env

### **Database Issues**:
1. Make sure PostgreSQL is installed and running
2. Create the database: `createdb property_management`
3. Check the DATABASE_URL in .env file
4. Run migrations to create tables

### **Frontend Issues**:
1. Ensure frontend is running on port 3000
2. Check that Bootstrap 5 is loaded properly
3. Verify API calls are reaching the backend

## 📞 Support

If you encounter issues with these test accounts:
1. Check the backend logs for error messages
2. Verify the database connection
3. Ensure all environment variables are set
4. Restart both frontend and backend servers

---

**🎉 Ready to test! Use any of these accounts to explore the Property Management Suite!**
