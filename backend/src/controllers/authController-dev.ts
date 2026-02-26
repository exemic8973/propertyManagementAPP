import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

// In-memory test users for development
const testUsers = [
  {
    id: '1',
    email: 'landlord@test.com',
    password_hash: '$2a$10$vLDb9HhGXkVMAfiWe.Dum.e1U3eDZzehCpYjkkS8LCIEZ3dox/sXC', // password123
    first_name: 'John',
    last_name: 'Landlord',
    role: 'landlord',
    phone: '+1234567890',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'manager@test.com',
    password_hash: '$2a$10$vLDb9HhGXkVMAfiWe.Dum.e1U3eDZzehCpYjkkS8LCIEZ3dox/sXC', // password123
    first_name: 'Sarah',
    last_name: 'Manager',
    role: 'property_manager',
    phone: '+1234567891',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'tenant@test.com',
    password_hash: '$2a$10$vLDb9HhGXkVMAfiWe.Dum.e1U3eDZzehCpYjkkS8LCIEZ3dox/sXC', // password123
    first_name: 'Mike',
    last_name: 'Tenant',
    role: 'tenant',
    phone: '+1234567892',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    email: 'agent@test.com',
    password_hash: '$2a$10$vLDb9HhGXkVMAfiWe.Dum.e1U3eDZzehCpYjkkS8LCIEZ3dox/sXC', // password123
    first_name: 'Emily',
    last_name: 'Agent',
    role: 'agent',
    phone: '+1234567893',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'first_name', 'last_name', 'role']
      });
    }

    // Validate role
    const validRoles = ['landlord', 'property_manager', 'tenant', 'agent'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles
      });
    }

    // Check if user already exists
    const existingUser = testUsers.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (in-memory for development)
    const newUser = {
      id: (testUsers.length + 1).toString(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name,
      last_name,
      phone: phone || '',
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    testUsers.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password']
      });
    }

    // Find user
    const user = testUsers.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find user
    const user = testUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find user
    const userIndex = testUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user (in-memory)
    const updatedUser = {
      ...testUsers[userIndex],
      first_name: first_name || testUsers[userIndex].first_name,
      last_name: last_name || testUsers[userIndex].last_name,
      phone: phone || testUsers[userIndex].phone,
      updated_at: new Date().toISOString()
    };

    testUsers[userIndex] = updatedUser;

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['current_password', 'new_password']
      });
    }

    // Find user
    const userIndex = testUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = testUsers[userIndex];

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password (in-memory)
    testUsers[userIndex] = {
      ...user,
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString()
    };

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
