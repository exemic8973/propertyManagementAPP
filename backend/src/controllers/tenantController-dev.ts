import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth-dev';

// Import properties from property controller for validation
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

// In-memory tenants for development
let tenants = [
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

export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let userTenants = tenants;

    // Filter based on user role
    if (userRole === 'landlord') {
      // Show tenants with properties owned by landlord OR tenants without any property assigned
      userTenants = tenants.filter(t => 
        !t.property_id || properties.some(p => p.owner_id === userId && p.id === t.property_id)
      );
    } else if (userRole === 'tenant') {
      userTenants = tenants.filter(t => t.email === req.user?.email);
    }
    // Property managers and agents can see all tenants

    res.json({
      tenants: userTenants,
      total: userTenants.length
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Failed to get tenants' });
  }
};

export const getTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const tenant = tenants.find(t => t.id === id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Check access permissions
    if (userRole === 'landlord') {
      // Allow access if tenant has no property OR tenant's property belongs to landlord
      const hasPropertyAccess = !tenant.property_id || properties.some(p => p.owner_id === userId && p.id === tenant.property_id);
      if (!hasPropertyAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'tenant' && tenant.email !== req.user?.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ tenant });

  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only landlords and property managers can create tenants
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      property_id,
      unit_number,
      rent_amount,
      lease_start_date,
      lease_end_date
    } = req.body;

    // Validate required fields - only basic tenant info is required
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['first_name', 'last_name', 'email']
      });
    }

    // Validate property access for landlords (only if property_id is provided)
    if (userRole === 'landlord' && property_id) {
      const hasPropertyAccess = properties.some(p => p.owner_id === userId && p.id === property_id);
      if (!hasPropertyAccess) {
        return res.status(403).json({ error: 'Access denied to this property' });
      }
    }

    // Check if tenant already exists
    const existingTenant = tenants.find(t => t.email === email.toLowerCase());
    if (existingTenant) {
      return res.status(409).json({ error: 'Tenant with this email already exists' });
    }

    // Create new tenant
    const newTenant = {
      id: (tenants.length + 1).toString(),
      first_name,
      last_name,
      email: email.toLowerCase(),
      phone: phone || '',
      property_id: property_id || null,
      unit_number: unit_number || '',
      rent_amount: rent_amount ? parseFloat(rent_amount) : null,
      lease_start_date: lease_start_date || null,
      lease_end_date: lease_end_date || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    tenants.push(newTenant);

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: newTenant
    });

  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const tenantIndex = tenants.findIndex(t => t.id === id);

    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenants[tenantIndex];

    // Check permissions
    if (userRole === 'landlord') {
      // Allow edit if tenant has no property OR tenant's property belongs to landlord
      const currentPropertyAccess = !tenant.property_id || properties.some(p => p.owner_id === userId && p.id === tenant.property_id);
      if (!currentPropertyAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // If assigning a new property, check access to the new property
      const newPropertyId = req.body.property_id;
      if (newPropertyId && newPropertyId !== tenant.property_id) {
        const hasNewPropertyAccess = properties.some(p => p.owner_id === userId && p.id === newPropertyId);
        if (!hasNewPropertyAccess) {
          return res.status(403).json({ error: 'Access denied to new property' });
        }
      }
    } else if (userRole === 'tenant' && tenant.email !== req.user?.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update tenant
    const updatedTenant = {
      ...tenant,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    tenants[tenantIndex] = updatedTenant;

    res.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const tenantIndex = tenants.findIndex(t => t.id === id);

    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenants[tenantIndex];

    // Only landlords can delete tenants
    if (userRole !== 'landlord') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check property access
    const hasPropertyAccess = properties.some(p => p.owner_id === userId && p.id === tenant.property_id);
    if (!hasPropertyAccess) {
      return res.status(403).json({ error: 'Access denied to this property' });
    }

    tenants.splice(tenantIndex, 1);

    res.json({
      message: 'Tenant deleted successfully'
    });

  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
};
