// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Secure token storage utilities
const TOKEN_KEY = 'pm_auth_token';
const USER_KEY = 'pm_user_data';

const getToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string, rememberMe: boolean = false): void => {
  // Use sessionStorage by default for better security
  // Use localStorage only if user opts for "remember me"
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user: User, rememberMe: boolean = false): void => {
  const userStr = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem(USER_KEY, userStr);
  } else {
    sessionStorage.setItem(USER_KEY, userStr);
  }
};

const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
};

// Sanitize text to prevent XSS
const sanitizeText = (text: string): string => {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
};

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
  is_esign?: boolean;
  wizard_data?: any;
  tenant: {
    id: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  property: {
    id: string | null;
    name: string;
    address: string;
    city?: string;
    state?: string;
    zip_code?: string;
    square_feet?: number;
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
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<ApiResponse<T>> {
  const token = getToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(requireAuth && token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle 401 - token expired or invalid
    if (response.status === 401 && requireAuth) {
      removeToken();
      removeStoredUser();
      // Don't redirect here - let the calling code handle it
      return { error: 'Session expired. Please login again.' };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error: sanitizeText(data.error || 'An error occurred'),
        details: data.details,
      };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please check your connection.' };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string, rememberMe: boolean = false) =>
    apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false).then(response => {
      if (response.data) {
        setToken(response.data.token, rememberMe);
        setStoredUser(response.data.user, rememberMe);
      }
      return response;
    }),

  register: (userData: Partial<User> & { password: string }, rememberMe: boolean = false) =>
    apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false).then(response => {
      if (response.data) {
        setToken(response.data.token, rememberMe);
        setStoredUser(response.data.user, rememberMe);
      }
      return response;
    }),

  getProfile: () => apiRequest<{ user: User }>('/auth/me'),

  updateProfile: (userData: Partial<User>) =>
    apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }).then(response => {
      if (response.data) {
        setStoredUser(response.data.user, !!localStorage.getItem(TOKEN_KEY));
      }
      return response;
    }),

  changePassword: (current_password: string, new_password: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    }),

  logout: () => {
    removeToken();
    removeStoredUser();
  },
};

// Export utilities for use in AuthContext
export { getToken, setToken, removeToken, getStoredUser, setStoredUser, removeStoredUser };

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

  terminate: (id: string, reason?: string) =>
    apiRequest<{ message: string }>(`/leases/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ termination_reason: reason }),
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

// LeaseSign Types
export interface WizardData {
  landlord?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  tenant?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    ssn?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  property?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    furnished?: boolean;
  };
  terms?: {
    startDate?: string;
    endDate?: string;
    leaseType?: string;
    isRenewal?: boolean;
  };
  rent?: {
    monthlyRent?: number;
    securityDeposit?: number;
    petDeposit?: number;
    petRent?: number;
    lateFee?: number;
    gracePeriod?: number;
    rentDueDay?: number;
    paymentMethods?: string[];
    proratedRent?: number;
  };
  rules?: {
    smokingAllowed?: boolean;
    petAllowed?: boolean;
    petDetails?: string;
    guestPolicy?: string;
    quietHours?: string;
    subletAllowed?: boolean;
    alterationsAllowed?: boolean;
  };
  additional?: {
    utilities?: string[];
    appliances?: string[];
    parkingSpaces?: number;
    parkingFee?: number;
    storageIncluded?: boolean;
    specialProvisions?: string;
    leadPaintDisclosure?: boolean;
    moldDisclosure?: boolean;
  };
  additionalTenants?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
  }>;
  otherOccupants?: Array<{
    name: string;
    age: number;
    relationship: string;
  }>;
}

export interface LeaseSignDocument {
  id: string;
  lease_number: string;
  status: 'draft' | 'pending_signature' | 'partial' | 'active' | 'terminated';
  wizard_data: WizardData;
  landlord_signed: boolean;
  tenant_signed: boolean;
  landlord_signed_at?: string;
  tenant_signed_at?: string;
  link_expires_at?: string;
  created_at: string;
  updated_at: string;
  pdf_path?: string;
  monthly_rent?: number;
  security_deposit?: number;
  start_date?: string;
  end_date?: string;
}

export interface LeaseTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: WizardData;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  ip_address?: string;
  details?: any;
  created_at: string;
}

export interface LeaseComment {
  id: string;
  author_name: string;
  author_email: string;
  author_role: string;
  comment_text: string;
  section?: string;
  resolved: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  document_id?: string;
  is_read: boolean;
  created_at: string;
}

// LeaseSign API
export const leaseSignApi = {
  // Documents
  getDocuments: (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ documents: LeaseSignDocument[] }>(`/lease-sign/documents${query}`);
  },

  getDocument: (id: string) =>
    apiRequest<{ document: LeaseSignDocument; comments: LeaseComment[]; auditLog: AuditLog[] }>(`/lease-sign/documents/${id}`),

  createDocument: (wizardData: WizardData, saveAsTemplate?: boolean, templateName?: string) =>
    apiRequest<{ document: LeaseSignDocument }>('/lease-sign/documents', {
      method: 'POST',
      body: JSON.stringify({ wizardData, saveAsTemplate, templateName }),
    }),

  updateDocument: (id: string, wizardData: WizardData) =>
    apiRequest<{ document: LeaseSignDocument }>(`/lease-sign/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ wizardData }),
    }),

  deleteDocument: (id: string) =>
    apiRequest<{ message: string }>(`/lease-sign/documents/${id}`, {
      method: 'DELETE',
    }),

  sendForSignature: (id: string) =>
    apiRequest<{ message: string; expiresAt: string }>(`/lease-sign/documents/${id}/send`, {
      method: 'POST',
    }),

  voidDocument: (id: string, reason?: string) =>
    apiRequest<{ message: string }>(`/lease-sign/documents/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getStats: () =>
    apiRequest<{ stats: { total_documents: number; draft_documents: number; pending_documents: number; completed_documents: number; unreadNotifications: number } }>('/lease-sign/documents/stats'),

  // Comments
  addComment: (documentId: string, text: string, section?: string) =>
    apiRequest<{ comment: LeaseComment }>(`/lease-sign/documents/${documentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, section }),
    }),

  // Notifications
  getNotifications: () =>
    apiRequest<{ notifications: Notification[] }>('/lease-sign/notifications'),

  markNotificationRead: (notificationId: string) =>
    apiRequest<{ message: string }>(`/lease-sign/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  // PDF - Use secure token via query param for window.open compatibility
  getPdfUrl: (documentId: string) => {
    const token = getToken();
    // Return the API endpoint with token in query string for download
    return `${API_BASE_URL}/lease-sign/documents/${documentId}/pdf?token=${token}`;
  },
  
  // Fetch PDF as blob with proper auth
  fetchPdf: async (documentId: string): Promise<Blob | null> => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/lease-sign/documents/${documentId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  },
};

// Templates API
export const templatesApi = {
  getAll: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<{ templates: LeaseTemplate[] }>(`/templates/templates${params}`);
  },

  getById: (id: string) =>
    apiRequest<{ template: LeaseTemplate }>(`/templates/templates/${id}`),

  getDefault: () =>
    apiRequest<{ template: LeaseTemplate | null }>('/templates/templates/default'),

  create: (name: string, templateData: WizardData, description?: string, isPublic?: boolean) =>
    apiRequest<{ template: LeaseTemplate }>('/templates/templates', {
      method: 'POST',
      body: JSON.stringify({ name, templateData, description, isPublic }),
    }),

  update: (id: string, data: Partial<{ name: string; description: string; templateData: WizardData; isPublic: boolean }>) =>
    apiRequest<{ template: LeaseTemplate }>(`/templates/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/templates/templates/${id}`, {
      method: 'DELETE',
    }),

  duplicate: (id: string) =>
    apiRequest<{ template: LeaseTemplate }>(`/templates/templates/${id}/duplicate`, {
      method: 'POST',
    }),

  setDefault: (id: string | null) =>
    apiRequest<{ message: string }>(`/templates/templates/${id || 'null'}/default`, {
      method: 'PUT',
    }),
};

// Public signing API (no auth required)
export const signingApi = {
  getDocumentForSigning: (token: string) =>
    apiRequest<{
      document: LeaseSignDocument;
      signerType: 'landlord' | 'tenant';
      signerName: string;
      wizardData: WizardData;
      waitingForLandlord?: boolean;
    }>(`/sign/${token}`),

  submitSignature: (token: string, signature: string) =>
    apiRequest<{
      success: boolean;
      message: string;
      status: string;
      isFullySigned: boolean;
    }>(`/sign/${token}`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),
};

const api = {
  auth: authApi,
  properties: propertiesApi,
  tenants: tenantsApi,
  leases: leasesApi,
  maintenance: maintenanceApi,
  payments: paymentsApi,
  dashboard: dashboardApi,
  leaseSign: leaseSignApi,
  templates: templatesApi,
  signing: signingApi,
};

export default api;
