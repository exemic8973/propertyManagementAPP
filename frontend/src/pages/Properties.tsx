import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { propertiesApi, Property } from '../services/api';

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  total_units: string;
  square_footage: string;
  description: string;
}

const Properties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: 'residential',
    total_units: '1',
    square_footage: '',
    description: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const response = await propertiesApi.getAll();
    if (response.data) {
      setProperties(response.data.properties || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await propertiesApi.create({
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      property_type: formData.property_type,
      total_units: parseInt(formData.total_units) || 1,
      square_footage: parseInt(formData.square_footage) || undefined,
      description: formData.description || undefined
    });
    
    if (response.data) {
      showNotification('Property created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchProperties();
    } else {
      showNotification(response.error || 'Failed to create property', 'error');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    
    const response = await propertiesApi.update(selectedProperty.id, {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      property_type: formData.property_type,
      total_units: parseInt(formData.total_units) || 1,
      square_footage: parseInt(formData.square_footage) || undefined,
      description: formData.description || undefined
    });
    
    if (response.data) {
      showNotification('Property updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedProperty(null);
      resetForm();
      fetchProperties();
    } else {
      showNotification(response.error || 'Failed to update property', 'error');
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    const response = await propertiesApi.delete(propertyId);
    if (response.data) {
      showNotification('Property deleted successfully!', 'success');
      fetchProperties();
    } else {
      showNotification(response.error || 'Failed to delete property', 'error');
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
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      property_type: property.property_type,
      total_units: property.total_units.toString(),
      square_footage: property.square_footage?.toString() || '',
      description: property.description || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      property_type: 'residential',
      total_units: '1',
      square_footage: '',
      description: ''
    });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const getPropertyTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      residential: 'primary',
      commercial: 'success',
      mixed_use: 'info'
    };
    return colors[type] || 'secondary';
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
      <Navigation />
      
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
              + Add Property
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
                    <span className={`badge bg-${property.is_active ? 'success' : 'secondary'}`}>
                      {property.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="card-text">
                      <small className="text-muted">{property.address}, {property.city}, {property.state} {property.zip_code}</small>
                    </p>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">Type</small>
                        <span className={`badge bg-${getPropertyTypeBadge(property.property_type)}`}>
                          {property.property_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Total Units</small>
                        <strong>{property.total_units}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Year Built</small>
                        <strong>{property.year_built || 'N/A'}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Sq Ft</small>
                        <strong>{property.square_footage ? property.square_footage.toLocaleString() : 'N/A'}</strong>
                      </div>
                    </div>
                    {property.description && (
                      <p className="card-text">
                        <small>{property.description.substring(0, 100)}{property.description.length > 100 ? '...' : ''}</small>
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
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
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
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="mixed_use">Mixed Use</option>
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
                      <div className="col-md-4">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Zip Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Total Units</label>
                        <input
                          type="number"
                          className="form-control"
                          name="total_units"
                          value={formData.total_units}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Square Footage</label>
                        <input
                          type="number"
                          className="form-control"
                          name="square_footage"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          min="0"
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
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
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
                  <button type="button" className="btn-close" onClick={() => { setShowViewModal(false); setSelectedProperty(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Basic Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Name:</strong></td><td>{selectedProperty.name}</td></tr>
                          <tr><td><strong>Type:</strong></td><td className="text-capitalize">{selectedProperty.property_type.replace('_', ' ')}</td></tr>
                          <tr><td><strong>Total Units:</strong></td><td>{selectedProperty.total_units}</td></tr>
                          <tr><td><strong>Status:</strong></td><td>{selectedProperty.is_active ? 'Active' : 'Inactive'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Location</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Address:</strong></td><td>{selectedProperty.address}</td></tr>
                          <tr><td><strong>City:</strong></td><td>{selectedProperty.city}</td></tr>
                          <tr><td><strong>State:</strong></td><td>{selectedProperty.state}</td></tr>
                          <tr><td><strong>Zip Code:</strong></td><td>{selectedProperty.zip_code}</td></tr>
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
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowViewModal(false); setSelectedProperty(null); }}>
                    Close
                  </button>
                  {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                    <button type="button" className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEdit(selectedProperty); }}>
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
                  <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setSelectedProperty(null); resetForm(); }}></button>
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
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="mixed_use">Mixed Use</option>
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
                      <div className="col-md-4">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Zip Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Total Units</label>
                        <input
                          type="number"
                          className="form-control"
                          name="total_units"
                          value={formData.total_units}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Square Footage</label>
                        <input
                          type="number"
                          className="form-control"
                          name="square_footage"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          min="0"
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
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setSelectedProperty(null); resetForm(); }}>
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