import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation middleware factory
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown keys
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
    first_name: Joi.string().min(1).max(100).required().messages({
      'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(1).max(100).required().messages({
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: Joi.string().valid('landlord', 'property_manager', 'tenant', 'agent').required().messages({
      'any.required': 'Role is required',
      'any.only': 'Invalid role'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(1).max(100).optional(),
    last_name: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    })
  }),

  // Property schemas
  createProperty: Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
      'any.required': 'Property name is required'
    }),
    address: Joi.string().min(1).required().messages({
      'any.required': 'Address is required'
    }),
    city: Joi.string().min(1).max(100).required().messages({
      'any.required': 'City is required'
    }),
    state: Joi.string().min(1).max(50).required().messages({
      'any.required': 'State is required'
    }),
    zip_code: Joi.string().min(1).max(20).required().messages({
      'any.required': 'ZIP code is required'
    }),
    country: Joi.string().max(50).optional().default('USA'),
    property_type: Joi.string().valid('residential', 'commercial', 'mixed_use').required().messages({
      'any.required': 'Property type is required',
      'any.only': 'Invalid property type'
    }),
    total_units: Joi.number().integer().min(1).optional().default(1),
    year_built: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    square_footage: Joi.number().integer().min(1).optional(),
    description: Joi.string().max(2000).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    purchase_price: Joi.number().min(0).optional(),
    purchase_date: Joi.date().optional()
  }),

  updateProperty: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    address: Joi.string().min(1).optional(),
    city: Joi.string().min(1).max(100).optional(),
    state: Joi.string().min(1).max(50).optional(),
    zip_code: Joi.string().min(1).max(20).optional(),
    country: Joi.string().max(50).optional(),
    property_type: Joi.string().valid('residential', 'commercial', 'mixed_use').optional(),
    total_units: Joi.number().integer().min(1).optional(),
    year_built: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    square_footage: Joi.number().integer().min(1).optional(),
    description: Joi.string().max(2000).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    purchase_price: Joi.number().min(0).optional(),
    purchase_date: Joi.date().optional(),
    is_active: Joi.boolean().optional()
  }),

  // Tenant schemas
  createTenant: Joi.object({
    first_name: Joi.string().min(1).max(100).required().messages({
      'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(1).max(100).required().messages({
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional(),
    date_of_birth: Joi.date().optional(),
    ssn_last_four: Joi.string().pattern(/^\d{4}$/).optional().messages({
      'string.pattern.base': 'SSN last four must be exactly 4 digits'
    }),
    driver_license: Joi.string().max(50).optional(),
    emergency_contact_name: Joi.string().max(255).optional(),
    emergency_contact_phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional(),
    employment_status: Joi.string().max(50).optional(),
    employer_name: Joi.string().max(255).optional(),
    monthly_income: Joi.number().min(0).optional(),
    credit_score: Joi.number().integer().min(300).max(850).optional(),
    background_check_status: Joi.string().valid('pending', 'approved', 'rejected', 'not_required').optional(),
    notes: Joi.string().optional()
  }),

  updateTenant: Joi.object({
    first_name: Joi.string().min(1).max(100).optional(),
    last_name: Joi.string().min(1).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional(),
    date_of_birth: Joi.date().optional(),
    ssn_last_four: Joi.string().pattern(/^\d{4}$/).optional(),
    driver_license: Joi.string().max(50).optional(),
    emergency_contact_name: Joi.string().max(255).optional(),
    emergency_contact_phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).max(20).optional(),
    employment_status: Joi.string().max(50).optional(),
    employer_name: Joi.string().max(255).optional(),
    monthly_income: Joi.number().min(0).optional(),
    credit_score: Joi.number().integer().min(300).max(850).optional(),
    background_check_status: Joi.string().valid('pending', 'approved', 'rejected', 'not_required').optional(),
    notes: Joi.string().optional()
  }),

  // Lease schemas
  createLease: Joi.object({
    property_id: Joi.string().uuid().required().messages({
      'any.required': 'Property is required'
    }),
    unit_id: Joi.string().uuid().optional(),
    tenant_id: Joi.string().uuid().required().messages({
      'any.required': 'Tenant is required'
    }),
    start_date: Joi.date().required().messages({
      'any.required': 'Start date is required'
    }),
    end_date: Joi.date().greater(Joi.ref('start_date')).required().messages({
      'any.required': 'End date is required',
      'date.greater': 'End date must be after start date'
    }),
    monthly_rent: Joi.number().min(0).required().messages({
      'any.required': 'Monthly rent is required'
    }),
    security_deposit: Joi.number().min(0).required().messages({
      'any.required': 'Security deposit is required'
    }),
    late_fee_amount: Joi.number().min(0).optional().default(0),
    late_fee_grace_period: Joi.number().integer().min(0).optional().default(3),
    pet_fee: Joi.number().min(0).optional().default(0),
    pet_deposit: Joi.number().min(0).optional().default(0),
    utilities_included: Joi.boolean().optional().default(false),
    parking_spaces: Joi.number().integer().min(0).optional().default(0),
    auto_renew: Joi.boolean().optional().default(false),
    renewal_notice_days: Joi.number().integer().min(0).optional().default(60)
  }),

  updateLease: Joi.object({
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    monthly_rent: Joi.number().min(0).optional(),
    security_deposit: Joi.number().min(0).optional(),
    late_fee_amount: Joi.number().min(0).optional(),
    late_fee_grace_period: Joi.number().integer().min(0).optional(),
    pet_fee: Joi.number().min(0).optional(),
    pet_deposit: Joi.number().min(0).optional(),
    utilities_included: Joi.boolean().optional(),
    parking_spaces: Joi.number().integer().min(0).optional(),
    auto_renew: Joi.boolean().optional(),
    renewal_notice_days: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('draft', 'pending_signature', 'active', 'expired', 'terminated').optional(),
    termination_reason: Joi.string().optional()
  }),

  // Maintenance schemas
  createMaintenance: Joi.object({
    property_id: Joi.string().uuid().required().messages({
      'any.required': 'Property is required'
    }),
    unit_id: Joi.string().uuid().optional(),
    title: Joi.string().min(1).max(255).required().messages({
      'any.required': 'Title is required'
    }),
    description: Joi.string().min(1).required().messages({
      'any.required': 'Description is required'
    }),
    category: Joi.string().valid('plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'landscaping', 'other').required().messages({
      'any.required': 'Category is required',
      'any.only': 'Invalid category'
    }),
    priority: Joi.string().valid('low', 'medium', 'high', 'emergency').optional().default('medium'),
    estimated_cost: Joi.number().min(0).optional(),
    photos: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  updateMaintenance: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().min(1).optional(),
    category: Joi.string().valid('plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'landscaping', 'other').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'emergency').optional(),
    status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled').optional(),
    assigned_to: Joi.string().uuid().optional(),
    estimated_cost: Joi.number().min(0).optional(),
    actual_cost: Joi.number().min(0).optional(),
    photos: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  // Payment schemas
  createPayment: Joi.object({
    lease_id: Joi.string().uuid().required().messages({
      'any.required': 'Lease is required'
    }),
    payment_date: Joi.date().required().messages({
      'any.required': 'Payment date is required'
    }),
    amount: Joi.number().min(0.01).required().messages({
      'any.required': 'Amount is required',
      'number.min': 'Amount must be greater than 0'
    }),
    payment_method: Joi.string().valid('cash', 'check', 'bank_transfer', 'online', 'other').required().messages({
      'any.required': 'Payment method is required',
      'any.only': 'Invalid payment method'
    }),
    transaction_id: Joi.string().max(255).optional(),
    notes: Joi.string().optional()
  }),

  updatePayment: Joi.object({
    payment_date: Joi.date().optional(),
    amount: Joi.number().min(0.01).optional(),
    payment_method: Joi.string().valid('cash', 'check', 'bank_transfer', 'online', 'other').optional(),
    payment_status: Joi.string().valid('pending', 'completed', 'failed', 'partial', 'overdue').optional(),
    transaction_id: Joi.string().max(255).optional(),
    notes: Joi.string().optional(),
    late_fee_applied: Joi.boolean().optional(),
    late_fee_amount: Joi.number().min(0).optional()
  })
};

// UUID validation helper
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// Param validation middleware
export const validateParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!isValidUUID(value)) {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
    next();
  };
};
