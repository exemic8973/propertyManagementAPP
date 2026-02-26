import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../database/connection';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and are active
    const userQuery = await pool.query(
      'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userQuery.rows[0];
    
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
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Landlord and Property Manager can access everything
// Agent has limited access
// Tenant can only access their own data
export const checkResourceOwnership = (resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Landlords and Property Managers can access all resources
      if (userRole === 'landlord' || userRole === 'property_manager') {
        return next();
      }

      let query = '';
      let hasAccess = false;

      switch (resourceType) {
        case 'property':
          query = 'SELECT owner_id FROM properties WHERE id = $1';
          break;
        case 'lease':
          query = 'SELECT landlord_id, tenant_id FROM leases WHERE id = $1';
          break;
        case 'maintenance':
          query = 'SELECT tenant_id FROM maintenance_requests WHERE id = $1';
          break;
        case 'payment':
          query = `
            SELECT l.landlord_id, l.tenant_id 
            FROM rent_payments rp 
            JOIN leases l ON rp.lease_id = l.id 
            WHERE rp.id = $1
          `;
          break;
        default:
          return res.status(403).json({ error: 'Invalid resource type' });
      }

      const result = await pool.query(query, [resourceId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const resource = result.rows[0];

      // Check ownership based on resource type and user role
      switch (resourceType) {
        case 'property':
          hasAccess = resource.owner_id === userId;
          break;
        case 'lease':
          hasAccess = resource.landlord_id === userId || resource.tenant_id === userId;
          break;
        case 'maintenance':
          hasAccess = resource.tenant_id === userId;
          break;
        case 'payment':
          hasAccess = resource.landlord_id === userId || resource.tenant_id === userId;
          break;
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};
