// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  property_type: string;
  total_units: number;
  year_built?: number;
  square_footage?: number;
  description?: string;
  amenities?: string[];
  purchase_price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unit_count?: number;
  occupied_units?: number;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  employment_status?: string;
  employer_name?: string;
  monthly_income?: number;
  credit_score?: number;
  background_check_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lease?: {
    id: string;
    start_date: string;
    end_date: string;
    rent_amount: number;
    property_name: string;
    property_address: string;
    unit_number: string;
  } | null;
}

export interface Lease {
  id: string;
  lease_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  pet_fee?: number;
  pet_deposit?: number;
  utilities_included?: boolean;
  parking_spaces?: number;
  auto_renew?: boolean;
  created_at: string;
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  };
  unit?: {
    id: string;
    unit_number: string;
    unit_type: string;
  } | null;
  landlord: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface LeaseCreate {
  tenant_id: string;
  property_id: string;
  unit_id?: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  pet_fee?: number;
  pet_deposit?: number;
  utilities_included?: boolean;
  parking_spaces?: number;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
  photos?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  completed_at?: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
  unit?: {
    id: string;
    unit_number: string;
  } | null;
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  notes?: string;
  late_fee_applied: boolean;
  late_fee_amount: number;
  created_at: string;
  lease: {
    id: string;
    lease_number: string;
    monthly_rent: number;
  };
  tenant: {
    first_name: string;
    last_name: string;
    email: string;
  };
  property: {
    name: string;
    address: string;
    unit_number?: string;
  };
}

export interface DashboardStats {
  properties: number;
  tenants: number;
  activeLeases: number;
  maintenance: number;
  monthlyRevenue: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'An error occurred',
        details: data.details,
      };
    }

    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: Partial<User> & { password: string }) =>
    apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest<{ user: User }>('/auth/me'),

  updateProfile: (userData: Partial<User>) =>
    apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (current_password: string, new_password: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    }),
};

// Properties API
export const propertiesApi = {
  getAll: () => apiRequest<{ properties: Property[]; total: number }>('/properties'),

  getById: (id: string) => apiRequest<{ property: Property }>(`/properties/${id}`),

  getStats: () => apiRequest<{ stats: { total_properties: number; total_units: number; occupied_units: number; monthly_revenue: number } }>('/properties/stats'),

  create: (property: Partial<Property>) =>
    apiRequest<{ property: Property; message: string }>('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    }),

  update: (id: string, property: Partial<Property>) =>
    apiRequest<{ property: Property; message: string }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/properties/${id}`, {
      method: 'DELETE',
    }),
};

// Tenants API
export const tenantsApi = {
  getAll: () => apiRequest<{ tenants: Tenant[]; total: number }>('/tenants'),

  getById: (id: string) => apiRequest<{ tenant: Tenant }>(`/tenants/${id}`),

  getStats: () => apiRequest<{ stats: { total_tenants: number; active_tenants: number; pending_background_checks: number } }>('/tenants/stats'),

  create: (tenant: Partial<Tenant>) =>
    apiRequest<{ tenant: Tenant; message: string }>('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant),
    }),

  update: (id: string, tenant: Partial<Tenant>) =>
    apiRequest<{ tenant: Tenant; message: string }>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/tenants/${id}`, {
      method: 'DELETE',
    }),
};

// Leases API
export const leasesApi = {
  getAll: (filters?: { status?: string; property_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.property_id) params.append('property_id', filters.property_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ leases: Lease[]; total: number }>(`/leases${query}`);
  },

  getById: (id: string) => apiRequest<{ lease: Lease }>(`/leases/${id}`),

  getStats: () => apiRequest<{ stats: { total_leases: number; active_leases: number; pending_leases: number; expired_leases: number; monthly_revenue: number } }>('/leases/stats'),

  create: (lease: LeaseCreate) =>
    apiRequest<{ lease: Lease; message: string }>('/leases', {
      method: 'POST',
      body: JSON.stringify(lease),
    }),

  update: (id: string, lease: Partial<LeaseCreate>) =>
    apiRequest<{ lease: Lease; message: string }>(`/leases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lease),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/leases/${id}`, {
      method: 'DELETE',
    }),

  sign: (id: string, signature: string) =>
    apiRequest<{ message: string }>(`/leases/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),

  initiateEsign: (id: string) =>
    apiRequest<{ message: string; tenantSignUrl: string; expiresAt: string }>(`/leases/${id}/initiate-esign`, {
      method: 'POST',
    }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (filters?: { status?: string; priority?: string; property_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.property_id) params.append('property_id', filters.property_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ requests: MaintenanceRequest[]; total: number }>(`/maintenance${query}`);
  },

  getById: (id: string) => apiRequest<{ request: MaintenanceRequest }>(`/maintenance/${id}`),

  getStats: () => apiRequest<{ stats: { total_requests: number; open_requests: number; in_progress_requests: number; completed_requests: number; emergency_requests: number; total_cost: number } }>('/maintenance/stats'),

  create: (request: Partial<MaintenanceRequest>) =>
    apiRequest<{ request: MaintenanceRequest; message: string }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  update: (id: string, request: Partial<MaintenanceRequest>) =>
    apiRequest<{ request: MaintenanceRequest; message: string }>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/maintenance/${id}`, {
      method: 'DELETE',
    }),

  assign: (id: string, assigned_to: string) =>
    apiRequest<{ request: MaintenanceRequest; message: string }>(`/maintenance/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigned_to }),
    }),
};

// Payments API
export const paymentsApi = {
  getAll: (filters?: { status?: string; lease_id?: string; start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.lease_id) params.append('lease_id', filters.lease_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ payments: Payment[]; total: number }>(`/payments${query}`);
  },

  getById: (id: string) => apiRequest<{ payment: Payment }>(`/payments/${id}`),

  getStats: () => apiRequest<{ stats: { total_payments: number; total_amount: number; collected_amount: number; pending_amount: number; overdue_amount: number; total_late_fees: number }; monthly: Array<{ month: string; amount: number; count: number }> }>('/payments/stats'),

  create: (payment: Partial<Payment>) =>
    apiRequest<{ payment: Payment; message: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  update: (id: string, payment: Partial<Payment>) =>
    apiRequest<{ payment: Payment; message: string }>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/payments/${id}`, {
      method: 'DELETE',
    }),

  recordLate: (leaseId: string) =>
    apiRequest<{ payment: Payment; message: string }>(`/payments/late/${leaseId}`, {
      method: 'POST',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const [properties, tenants, leases, maintenance] = await Promise.all([
      propertiesApi.getStats(),
      tenantsApi.getStats(),
      leasesApi.getStats(),
      maintenanceApi.getStats(),
    ]);

    if (properties.error || tenants.error || leases.error || maintenance.error) {
      return { error: 'Failed to fetch dashboard stats' };
    }

    return {
      data: {
        properties: properties.data?.stats.total_properties || 0,
        tenants: tenants.data?.stats.total_tenants || 0,
        activeLeases: leases.data?.stats.active_leases || 0,
        maintenance: maintenance.data?.stats.open_requests || 0,
        monthlyRevenue: leases.data?.stats.monthly_revenue || 0,
      },
    };
  },
};

const api = {
  auth: authApi,
  properties: propertiesApi,
  tenants: tenantsApi,
  leases: leasesApi,
  maintenance: maintenanceApi,
  payments: paymentsApi,
  dashboard: dashboardApi,
};

export default api;
