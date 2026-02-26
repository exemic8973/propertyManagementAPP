import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  rent_amount: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    square_footage: '',
    rent_amount: '',
    description: ''
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
      fetchProperties(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

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
      } else {
        console.error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('Property created successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          name: '',
          address: '',
          type: 'apartment',
          bedrooms: '',
          bathrooms: '',
          square_footage: '',
          rent_amount: '',
          description: ''
        });
        fetchProperties(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to create property', 'error');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      showNotification('Failed to create property', 'error');
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Property deleted successfully!', 'success');
        fetchProperties(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete property', 'error');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      showNotification('Failed to delete property', 'error');
    }
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      type: property.type,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      square_footage: property.square_footage.toString(),
      rent_amount: property.rent_amount.toString(),
      description: property.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token || !selectedProperty) return;

    try {
      const response = await fetch(`http://localhost:5000/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification('Property updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedProperty(null);
        setFormData({
          name: '',
          address: '',
          type: 'apartment',
          bedrooms: '',
          bathrooms: '',
          square_footage: '',
          rent_amount: '',
          description: ''
        });
        fetchProperties(token);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update property', 'error');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      showNotification('Failed to update property', 'error');
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
    setTimeout(() => notification.remove(), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      available: 'success',
      occupied: 'primary',
      maintenance: 'warning',
      unavailable: 'secondary'
    };
    return statusColors[status as keyof typeof statusColors] || 'secondary';
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
      {/* Navigation Header */}
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
                <a className="nav-link dropdown-toggle" href="/properties" role="button" data-bs-toggle="dropdown">
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Properties</h1>
            <p className="text-muted mb-0">Manage your property portfolio</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Property
            </button>
          )}
        </div>

        {/* Properties Grid */}
        <div className="row">
          {properties.length === 0 ? (
            <div className="col-12">
              <div className="card text-center py-5">
                <div className="card-body">
                  <h5 className="card-title text-muted">No Properties Found</h5>
                  <p className="card-text text-muted">
                    {user?.role === 'landlord' || user?.role === 'property_manager'
                      ? 'Start by adding your first property!'
                      : 'No properties are currently available.'}
                  </p>
                  {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      Add Your First Property
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            properties.map(property => (
              <div key={property.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">{property.name}</h6>
                    <span className={`badge bg-${getStatusBadge(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="card-text">
                      <small className="text-muted">{property.address}</small>
                    </p>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">Type</small>
                        <strong>{property.type}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Rent</small>
                        <strong>${property.rent_amount}/mo</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Bedrooms</small>
                        <strong>{property.bedrooms}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Bathrooms</small>
                        <strong>{property.bathrooms}</strong>
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block">Square Footage</small>
                        <strong>{property.square_footage.toLocaleString()} sq ft</strong>
                      </div>
                    </div>
                    {property.description && (
                      <p className="card-text">
                        <small>{property.description}</small>
                      </p>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="btn-group w-100" role="group">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewDetails(property)}
                      >
                        View Details
                      </button>
                      {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                        <>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEdit(property)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(property.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Property Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Property</h5>
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
                        <label className="form-label">Property Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property Type *</label>
                        <select
                          className="form-select"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Bedrooms *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Bathrooms *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          min="1"
                          step="0.5"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Square Feet *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="square_footage"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          min="100"
                          required
                        />
                      </div>
                      <div className="col-md-3">
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
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                        ></textarea>
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
                      Add Property
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Property Details Modal */}
        {showViewModal && selectedProperty && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Property Details</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedProperty(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Basic Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Name:</strong></td>
                            <td>{selectedProperty.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Address:</strong></td>
                            <td>{selectedProperty.address}</td>
                          </tr>
                          <tr>
                            <td><strong>Type:</strong></td>
                            <td>{selectedProperty.type}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><span className={`badge bg-${getStatusBadge(selectedProperty.status)}`}>{selectedProperty.status}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Property Details</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Bedrooms:</strong></td>
                            <td>{selectedProperty.bedrooms}</td>
                          </tr>
                          <tr>
                            <td><strong>Bathrooms:</strong></td>
                            <td>{selectedProperty.bathrooms}</td>
                          </tr>
                          <tr>
                            <td><strong>Square Footage:</strong></td>
                            <td>{selectedProperty.square_footage.toLocaleString()} sq ft</td>
                          </tr>
                          <tr>
                            <td><strong>Rent:</strong></td>
                            <td>${selectedProperty.rent_amount}/mo</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {selectedProperty.description && (
                      <div className="col-12">
                        <h6>Description</h6>
                        <p>{selectedProperty.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedProperty(null);
                    }}
                  >
                    Close
                  </button>
                  {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedProperty);
                      }}
                    >
                      Edit Property
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Property Modal */}
        {showEditModal && selectedProperty && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Property</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProperty(null);
                      setFormData({
                        name: '',
                        address: '',
                        type: 'apartment',
                        bedrooms: '',
                        bathrooms: '',
                        square_footage: '',
                        rent_amount: '',
                        description: ''
                      });
                    }}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Property Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property Type *</label>
                        <select
                          className="form-select"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Bedrooms *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Bathrooms *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          min="1"
                          step="0.5"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Square Feet *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="square_footage"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          min="100"
                          required
                        />
                      </div>
                      <div className="col-md-3">
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
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedProperty(null);
                        setFormData({
                          name: '',
                          address: '',
                          type: 'apartment',
                          bedrooms: '',
                          bathrooms: '',
                          square_footage: '',
                          rent_amount: '',
                          description: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Property
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

export default Properties;
