import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

// Create test users (for development only)
router.post('/create-users', async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        email: 'landlord@test.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Landlord',
        role: 'landlord',
        phone: '+1234567890'
      },
      {
        email: 'manager@test.com',
        password: 'password123',
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'property_manager',
        phone: '+1234567891'
      },
      {
        email: 'tenant@test.com',
        password: 'password123',
        first_name: 'Mike',
        last_name: 'Tenant',
        role: 'tenant',
        phone: '+1234567892'
      },
      {
        email: 'agent@test.com',
        password: 'password123',
        first_name: 'Emily',
        last_name: 'Agent',
        role: 'agent',
        phone: '+1234567893'
      }
    ];

    // For now, just return the test users info
    // In a real app, these would be saved to database
    res.json({
      message: 'Test accounts created (demo mode - not saved to database)',
      users: testUsers,
      note: 'Use these credentials to test the login functionality'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to create test users' });
  }
});

export default router;
