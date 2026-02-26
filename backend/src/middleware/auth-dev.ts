import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

// In-memory test users (same as in authController-dev.ts)
const testUsers = [
  {
    id: '1',
    email: 'landlord@test.com',
    first_name: 'John',
    last_name: 'Landlord',
    role: 'landlord',
    is_active: true
  },
  {
    id: '2',
    email: 'manager@test.com',
    first_name: 'Sarah',
    last_name: 'Manager',
    role: 'property_manager',
    is_active: true
  },
  {
    id: '3',
    email: 'tenant@test.com',
    first_name: 'Mike',
    last_name: 'Tenant',
    role: 'tenant',
    is_active: true
  },
  {
    id: '4',
    email: 'agent@test.com',
    first_name: 'Emily',
    last_name: 'Agent',
    role: 'agent',
    is_active: true
  }
];

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
    
    // Get user from in-memory data to ensure they still exist and are active
    const user = testUsers.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
