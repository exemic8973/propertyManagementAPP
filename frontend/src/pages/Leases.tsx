import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface Lease {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
};

const Leases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tenant_id: '',
    property_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    status: 'active'
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
      fetchLeases(token);
      fetchTenants(token);
      fetchProperties(token);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchLeases = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/leases', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeases(data.leases || []);
      } else {
        console.error('Failed to fetch leases');
      }
    } catch (error) {
      console.error('Error fetching leases:', error);
    }
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/leases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Lease created successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          tenant_id: '',
          property_id: '',
          start_date: '',
          end_date: '',
          rent_amount: '',
          status: 'active'
        });
        fetchLeases(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to create lease', 'error');
      }
    } catch (error) {
      console.error('Error creating lease:', error);
      showNotification('Failed to create lease', 'error');
    }
  };

  const handleViewDetails = (lease: Lease) => {
    setSelectedLease(lease);
    setShowDetailsModal(true);
  };

  const handleEdit = (lease: Lease) => {
    setEditingLease(lease);
    setFormData({
      tenant_id: lease.tenant_id,
      property_id: lease.property_id,
      start_date: lease.start_date,
      end_date: lease.end_date,
      rent_amount: lease.rent_amount.toString(),
      status: lease.status
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token || !editingLease) return;

    try {
      const response = await fetch(`http://localhost:5000/api/leases/${editingLease.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Lease updated successfully!', 'success');
        setShowEditModal(false);
        setEditingLease(null);
        setFormData({
          tenant_id: '',
          property_id: '',
          start_date: '',
          end_date: '',
          rent_amount: '',
          status: 'active'
        });
        fetchLeases(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update lease', 'error');
      }
    } catch (error) {
      console.error('Error updating lease:', error);
      showNotification('Failed to update lease', 'error');
    }
  };

  const handleDelete = async (leaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this lease?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/leases/${leaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Lease deleted successfully!', 'success');
        fetchLeases(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete lease', 'error');
      }
    } catch (error) {
      console.error('Error deleting lease:', error);
      showNotification('Failed to delete lease', 'error');
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
      expired: 'danger',
      pending: 'warning',
      terminated: 'secondary'
    };
    return statusColors[status] || 'secondary';
  };

  const getTenantById = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId);
  };

  const getPropertyById = (propertyId: string) => {
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
                <a className="nav-link dropdown-toggle" href="/leases" role="button" data-bs-toggle="dropdown">
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
            <h1 className="h3 mb-1">Leases</h1>
            <p className="text-muted mb-0">Manage rental agreements and contracts</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>Create Lease
            </button>
          )}
        </div>

        <div className="row">
          {leases.length === 0 ? (
            <div className="col-12">
              <div className="card text-center py-5">
                <div className="card-body">
                  <h5 className="card-title text-muted">No Leases Found</h5>
                  <p className="card-text text-muted">
                    {user?.role === 'landlord' || user?.role === 'property_manager'
                      ? 'Start by creating your first lease!'
                      : 'No leases are currently available.'}
                  </p>
                  {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      Create Your First Lease
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            leases.map(lease => {
              const tenant = getTenantById(lease.tenant_id);
              const property = getPropertyById(lease.property_id);
              return (
                <div key={lease.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="card-title mb-0">
                        Lease #{lease.id}
                      </h6>
                      <span className={`badge bg-${getStatusBadge(lease.status)}`}>
                        {lease.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        <small className="text-muted d-block">Tenant</small>
                        <strong>{tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Not assigned'}</strong>
                      </p>
                      <p className="card-text">
                        <small className="text-muted d-block">Property</small>
                        <strong>{property ? property.name : 'Not assigned'}</strong>
                      </p>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">Rent</small>
                          <strong>${lease.rent_amount}/mo</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Duration</small>
                          <strong>{calculateDuration(lease.start_date, lease.end_date)}</strong>
                        </div>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">Start Date</small>
                          <strong>{new Date(lease.start_date).toLocaleDateString()}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">End Date</small>
                          <strong>{new Date(lease.end_date).toLocaleDateString()}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewDetails(lease)}
                        >
                          View Details
                        </button>
                        {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                          <>
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleEdit(lease)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(lease.id)}
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
                  <h5 className="modal-title">Create New Lease</h5>
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
                        <label className="form-label">Tenant *</label>
                        <select
                          className="form-select"
                          name="tenant_id"
                          value={formData.tenant_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Tenant</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.first_name} {tenant.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property *</label>
                        <select
                          className="form-select"
                          name="property_id"
                          value={formData.property_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Property</option>
                          {properties.map(property => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rent Amount ($) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="rent_amount"
                          value={formData.rent_amount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="terminated">Terminated</option>
                        </select>
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
                      Create Lease
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && selectedLease && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Lease Details</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLease(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Lease Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Lease ID:</strong></td>
                            <td>{selectedLease.id}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><span className={`badge bg-${getStatusBadge(selectedLease.status)}`}>{selectedLease.status}</span></td>
                          </tr>
                          <tr>
                            <td><strong>Rent:</strong></td>
                            <td>${selectedLease.rent_amount}/mo</td>
                          </tr>
                          <tr>
                            <td><strong>Duration:</strong></td>
                            <td>{calculateDuration(selectedLease.start_date, selectedLease.end_date)}</td>
                          </tr>
                          <tr>
                            <td><strong>Start Date:</strong></td>
                            <td>{new Date(selectedLease.start_date).toLocaleDateString()}</td>
                          </tr>
                          <tr>
                            <td><strong>End Date:</strong></td>
                            <td>{new Date(selectedLease.end_date).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Tenant Information</h6>
                      {(() => {
                        const tenant = getTenantById(selectedLease.tenant_id);
                        return tenant ? (
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td><strong>Name:</strong></td>
                                <td>{tenant.first_name} {tenant.last_name}</td>
                              </tr>
                              <tr>
                                <td><strong>Email:</strong></td>
                                <td>{tenant.email}</td>
                              </tr>
                              <tr>
                                <td><strong>Phone:</strong></td>
                                <td>{tenant.phone || 'Not provided'}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted">No tenant assigned</p>
                        );
                      })()}
                    </div>
                  </div>
                  {(() => {
                    const property = getPropertyById(selectedLease.property_id);
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
                    ) : (
                      <p className="text-muted mt-3">No property assigned</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingLease && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Lease</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingLease(null);
                      setFormData({
                        tenant_id: '',
                        property_id: '',
                        start_date: '',
                        end_date: '',
                        rent_amount: '',
                        status: 'active'
                      });
                    }}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tenant *</label>
                        <select
                          className="form-select"
                          name="tenant_id"
                          value={formData.tenant_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Tenant</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.first_name} {tenant.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property *</label>
                        <select
                          className="form-select"
                          name="property_id"
                          value={formData.property_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Property</option>
                          {properties.map(property => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rent Amount ($) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="rent_amount"
                          value={formData.rent_amount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingLease(null);
                        setFormData({
                          tenant_id: '',
                          property_id: '',
                          start_date: '',
                          end_date: '',
                          rent_amount: '',
                          status: 'active'
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Lease
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

export default Leases;
