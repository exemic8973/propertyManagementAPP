import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth-dev';

// In-memory leases for development
let leases = [
  {
    id: '1',
    tenant_id: '1',
    property_id: '1',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    rent_amount: 1500,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    tenant_id: '2',
    property_id: '2',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    rent_amount: 2200,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Import tenants and properties for validation
const tenants = [
  {
    id: '1',
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1234567890',
    property_id: '1',
    unit_number: '101',
    rent_amount: 1500,
    lease_start_date: '2024-01-01',
    lease_end_date: '2024-12-31',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob.smith@email.com',
    phone: '+1234567891',
    property_id: '2',
    unit_number: '201',
    rent_amount: 2200,
    lease_start_date: '2024-02-01',
    lease_end_date: '2025-01-31',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const properties = [
  {
    id: '1',
    name: 'Sunset Apartments - Unit 101',
    address: '123 Main St, Anytown, USA 12345',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1200,
    rent_amount: 1500,
    status: 'available',
    owner_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Oak House',
    address: '456 Oak Ave, Anytown, USA 12345',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 1800,
    rent_amount: 2200,
    status: 'occupied',
    owner_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Pine Condo - Unit 5B',
    address: '789 Pine St, Anytown, USA 12345',
    type: 'condo',
    bedrooms: 1,
    bathrooms: 1,
    square_footage: 800,
    rent_amount: 950,
    status: 'available',
    owner_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const getLeases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let userLeases = leases;

    // Filter based on user role
    if (userRole === 'landlord') {
      userLeases = leases.filter(l => {
        const property = properties.find(p => p.id === l.property_id);
        return property && property.owner_id === userId;
      });
    } else if (userRole === 'tenant') {
      userLeases = leases.filter(l => {
        const tenant = tenants.find(t => t.id === l.tenant_id);
        return tenant && tenant.email === req.user?.email;
      });
    }
    // Property managers and agents can see all leases

    res.json({
      leases: userLeases,
      total: userLeases.length
    });

  } catch (error) {
    console.error('Get leases error:', error);
    res.status(500).json({ error: 'Failed to get leases' });
  }
};

export const getLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lease = leases.find(l => l.id === id);

    if (!lease) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    // Check access permissions
    if (userRole === 'landlord') {
      const property = properties.find(p => p.id === lease.property_id);
      if (!property || property.owner_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'tenant') {
      const tenant = tenants.find(t => t.id === lease.tenant_id);
      if (!tenant || tenant.email !== req.user?.email) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ lease });

  } catch (error) {
    console.error('Get lease error:', error);
    res.status(500).json({ error: 'Failed to get lease' });
  }
};

export const createLease = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only landlords and property managers can create leases
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      tenant_id,
      property_id,
      start_date,
      end_date,
      rent_amount,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!tenant_id || !property_id || !start_date || !end_date || !rent_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['tenant_id', 'property_id', 'start_date', 'end_date', 'rent_amount']
      });
    }

    // Validate property access for landlords
    if (userRole === 'landlord') {
      const property = properties.find(p => p.id === property_id);
      if (!property || property.owner_id !== userId) {
        return res.status(403).json({ error: 'Access denied to this property' });
      }
    }

    // Validate tenant exists
    const tenant = tenants.find(t => t.id === tenant_id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Create new lease
    const newLease = {
      id: (leases.length + 1).toString(),
      tenant_id,
      property_id,
      start_date,
      end_date,
      rent_amount: parseFloat(rent_amount),
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    leases.push(newLease);

    res.status(201).json({
      message: 'Lease created successfully',
      lease: newLease
    });

  } catch (error) {
    console.error('Create lease error:', error);
    res.status(500).json({ error: 'Failed to create lease' });
  }
};

export const updateLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const leaseIndex = leases.findIndex(l => l.id === id);

    if (leaseIndex === -1) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = leases[leaseIndex];

    // Check permissions
    if (userRole === 'landlord') {
      const property = properties.find(p => p.id === lease.property_id);
      if (!property || property.owner_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'tenant') {
      const tenant = tenants.find(t => t.id === lease.tenant_id);
      if (!tenant || tenant.email !== req.user?.email) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Update lease
    const updatedLease = {
      ...lease,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    leases[leaseIndex] = updatedLease;

    res.json({
      message: 'Lease updated successfully',
      lease: updatedLease
    });

  } catch (error) {
    console.error('Update lease error:', error);
    res.status(500).json({ error: 'Failed to update lease' });
  }
};

export const deleteLease = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const leaseIndex = leases.findIndex(l => l.id === id);

    if (leaseIndex === -1) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    const lease = leases[leaseIndex];

    // Only landlords can delete leases
    if (userRole !== 'landlord') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check property access
    const property = properties.find(p => p.id === lease.property_id);
    if (!property || property.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this property' });
    }

    leases.splice(leaseIndex, 1);

    res.json({
      message: 'Lease deleted successfully'
    });

  } catch (error) {
    console.error('Delete lease error:', error);
    res.status(500).json({ error: 'Failed to delete lease' });
  }
};
