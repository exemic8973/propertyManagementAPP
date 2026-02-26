import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  lease_start_date: string;
  lease_end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  rent_amount: number;
  unit_number?: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    property_id: '',
    unit_number: '',
    rent_amount: '',
    lease_start_date: '',
    lease_end_date: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchTenants(token);
      fetchProperties(token);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchTenants = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      } else {
        console.error('Failed to fetch tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchProperties = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertySelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    const selectedProperty = properties.find(p => p.id === propertyId);
    
    if (selectedProperty) {
      const today = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(today.getFullYear() + 1);
      
      setFormData(prev => ({
        ...prev,
        property_id: propertyId,
        unit_number: selectedProperty.unit_number || '',
        rent_amount: selectedProperty.rent_amount.toString(),
        lease_start_date: today.toISOString().split('T')[0],
        lease_end_date: oneYearLater.toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        property_id: propertyId,
        unit_number: '',
        rent_amount: '',
        lease_start_date: '',
        lease_end_date: ''
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/tenants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Tenant created successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          property_id: '',
          unit_number: '',
          rent_amount: '',
          lease_start_date: '',
          lease_end_date: ''
        });
        fetchTenants(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to create tenant', 'error');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      showNotification('Failed to create tenant', 'error');
    }
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone,
      property_id: tenant.property_id || '',
      unit_number: tenant.unit_number || '',
      rent_amount: tenant.rent_amount ? tenant.rent_amount.toString() : '',
      lease_start_date: tenant.lease_start_date || '',
      lease_end_date: tenant.lease_end_date || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token || !editingTenant) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Tenant updated successfully!', 'success');
        setShowEditModal(false);
        setEditingTenant(null);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          property_id: '',
          unit_number: '',
          rent_amount: '',
          lease_start_date: '',
          lease_end_date: ''
        });
        fetchTenants(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update tenant', 'error');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      showNotification('Failed to update tenant', 'error');
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Tenant deleted successfully!', 'success');
        fetchTenants(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete tenant', 'error');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      showNotification('Failed to delete tenant', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      <strong>${type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info!'}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning'
    };
    return statusColors[status] || 'secondary';
  };

  const getPropertyById = (propertyId: string | null | undefined) => {
    if (!propertyId) return undefined;
    return properties.find(p => p.id === propertyId);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/dashboard">
            🏠 Property Manager
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/dashboard' ? 'active' : ''}`} href="/dashboard">
                  📊 Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/properties' ? 'active' : ''}`} href="/properties">
                  🏠 Properties
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/tenants' ? 'active' : ''}`} href="/tenants">
                  👥 Tenants
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/leases' ? 'active' : ''}`} href="/leases">
                  📄 Leases
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/maintenance' ? 'active' : ''}`} href="/maintenance">
                  🔧 Maintenance
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${window.location.pathname === '/payments' ? 'active' : ''}`} href="/payments">
                  💳 Payments
                </a>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="/tenants" role="button" data-bs-toggle="dropdown">
                  👤 {user?.first_name} {user?.last_name}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="/dashboard">📊 Dashboard</a></li>
                  <li><a className="dropdown-item" href="/properties">🏠 Properties</a></li>
                  <li><a className="dropdown-item" href="/tenants">👥 Tenants</a></li>
                  <li><a className="dropdown-item" href="/leases">📄 Leases</a></li>
                  <li><a className="dropdown-item" href="/maintenance">🔧 Maintenance</a></li>
                  <li><a className="dropdown-item" href="/payments">💳 Payments</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/login" onClick={handleLogout}>🚪 Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Tenants</h1>
            <p className="text-muted mb-0">Manage your tenant relationships</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Tenant
            </button>
          )}
        </div>

        <div className="row">
          {tenants.length === 0 ? (
            <div className="col-12">
              <div className="card text-center py-5">
                <div className="card-body">
                  <h5 className="card-title text-muted">No Tenants Found</h5>
                  <p className="card-text text-muted">
                    {user?.role === 'landlord' || user?.role === 'property_manager'
                      ? 'Start by adding your first tenant!'
                      : 'No tenants are currently assigned to you.'}
                  </p>
                  {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      Add Your First Tenant
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            tenants.map(tenant => {
              const property = getPropertyById(tenant.property_id);
              return (
                <div key={tenant.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="card-title mb-0">
                        {tenant.first_name} {tenant.last_name}
                      </h6>
                      <span className={`badge bg-${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        <small className="text-muted d-block">Email</small>
                        <strong>{tenant.email}</strong>
                      </p>
                      <p className="card-text">
                        <small className="text-muted d-block">Phone</small>
                        <strong>{tenant.phone || 'Not provided'}</strong>
                      </p>
                      {property && (
                        <p className="card-text">
                          <small className="text-muted d-block">Property</small>
                          <strong>{property.name}</strong>
                        </p>
                      )}
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">Unit</small>
                          <strong>{tenant.unit_number || 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Rent</small>
                          <strong>{tenant.rent_amount ? `$${tenant.rent_amount}/mo` : 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Lease Start</small>
                          <strong>{tenant.lease_start_date ? new Date(tenant.lease_start_date).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Lease End</small>
                          <strong>{tenant.lease_end_date ? new Date(tenant.lease_end_date).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewDetails(tenant)}
                        >
                          View Details
                        </button>
                        {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                          <>
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleEdit(tenant)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(tenant.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showAddModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Tenant</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property</label>
                        <select
                          className="form-select"
                          name="property_id"
                          value={formData.property_id}
                          onChange={handlePropertySelect}
                        >
                          <option value="">Select Property</option>
                          {properties.map(property => (
                            <option key={property.id} value={property.id}>
                              {property.name} - ${property.rent_amount}/mo
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Unit Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="unit_number"
                          value={formData.unit_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rent Amount ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="rent_amount"
                          value={formData.rent_amount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lease Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="lease_start_date"
                          value={formData.lease_start_date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lease End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="lease_end_date"
                          value={formData.lease_end_date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Tenant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && selectedTenant && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tenant Details</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedTenant(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Personal Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Name:</strong></td>
                            <td>{selectedTenant.first_name} {selectedTenant.last_name}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{selectedTenant.email}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{selectedTenant.phone || 'Not provided'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Lease Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><span className={`badge bg-${getStatusBadge(selectedTenant.status)}`}>{selectedTenant.status}</span></td>
                          </tr>
                          <tr>
                            <td><strong>Unit:</strong></td>
                            <td>{selectedTenant.unit_number || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Rent:</strong></td>
                            <td>{selectedTenant.rent_amount ? `$${selectedTenant.rent_amount}/mo` : 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Lease Start:</strong></td>
                            <td>{selectedTenant.lease_start_date ? new Date(selectedTenant.lease_start_date).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Lease End:</strong></td>
                            <td>{selectedTenant.lease_end_date ? new Date(selectedTenant.lease_end_date).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {(() => {
                    const property = getPropertyById(selectedTenant.property_id);
                    return property ? (
                      <div className="col-12 mt-3">
                        <h6>Property Information</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Property:</strong></td>
                              <td>{property.name}</td>
                            </tr>
                            <tr>
                              <td><strong>Address:</strong></td>
                              <td>{property.address}</td>
                            </tr>
                            <tr>
                              <td><strong>Type:</strong></td>
                              <td>{property.type}</td>
                            </tr>
                            <tr>
                              <td><strong>Status:</strong></td>
                              <td><span className={`badge bg-${getStatusBadge(property.status)}`}>{property.status}</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingTenant && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Tenant</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTenant(null);
                      setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        property_id: '',
                        unit_number: '',
                        rent_amount: '',
                        lease_start_date: '',
                        lease_end_date: ''
                      });
                    }}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property</label>
                        <select
                          className="form-select"
                          name="property_id"
                          value={formData.property_id}
                          onChange={handlePropertySelect}
                        >
                          <option value="">Select Property</option>
                          {properties.map(property => (
                            <option key={property.id} value={property.id}>
                              {property.name} - ${property.rent_amount}/mo
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Unit Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="unit_number"
                          value={formData.unit_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rent Amount ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="rent_amount"
                          value={formData.rent_amount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lease Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="lease_start_date"
                          value={formData.lease_start_date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lease End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="lease_end_date"
                          value={formData.lease_end_date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingTenant(null);
                        setFormData({
                          first_name: '',
                          last_name: '',
                          email: '',
                          phone: '',
                          property_id: '',
                          unit_number: '',
                          rent_amount: '',
                          lease_start_date: '',
                          lease_end_date: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Tenant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tenants;
