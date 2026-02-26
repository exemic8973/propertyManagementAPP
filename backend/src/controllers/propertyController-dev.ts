import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// In-memory properties for development
let properties = [
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

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let userProperties = properties;

    // Filter based on user role
    if (userRole === 'landlord') {
      userProperties = properties.filter(p => p.owner_id === userId);
    } else if (userRole === 'tenant') {
      // Tenants can only see properties they're associated with
      userProperties = properties.filter(p => p.status === 'available');
    }
    // Property managers and agents can see all properties

    res.json({
      properties: userProperties,
      total: userProperties.length
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to get properties' });
  }
};

export const getProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const property = properties.find(p => p.id === id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check access permissions
    if (userRole === 'landlord' && property.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ property });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only landlords and property managers can create properties
    if (userRole !== 'landlord' && userRole !== 'property_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      name,
      address,
      type,
      bedrooms,
      bathrooms,
      square_footage,
      rent_amount,
      description
    } = req.body;

    // Validate required fields
    if (!name || !address || !type || !bedrooms || !bathrooms || !square_footage || !rent_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'address', 'type', 'bedrooms', 'bathrooms', 'square_footage', 'rent_amount']
      });
    }

    // Validate property type
    const validTypes = ['apartment', 'house', 'condo', 'townhouse', 'commercial'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid property type',
        validTypes
      });
    }

    // Create new property
    const newProperty = {
      id: (properties.length + 1).toString(),
      name,
      address,
      type,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      square_footage: parseInt(square_footage),
      rent_amount: parseFloat(rent_amount),
      description: description || '',
      status: 'available',
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    properties.push(newProperty);

    res.status(201).json({
      message: 'Property created successfully',
      property: newProperty
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const propertyIndex = properties.findIndex(p => p.id === id);

    if (propertyIndex === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[propertyIndex];

    // Check permissions
    if (userRole === 'landlord' && property.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update property
    const updatedProperty = {
      ...property,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    properties[propertyIndex] = updatedProperty;

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const propertyIndex = properties.findIndex(p => p.id === id);

    if (propertyIndex === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[propertyIndex];

    // Only landlords can delete their own properties
    if (userRole !== 'landlord' || property.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    properties.splice(propertyIndex, 1);

    res.json({
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
