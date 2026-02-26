import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { tenantsApi, Tenant } from '../services/api';

interface TenantFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  employment_status: string;
  employer_name: string;
  monthly_income: string;
  notes: string;
}

const Tenants: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState<TenantFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    employment_status: '',
    employer_name: '',
    monthly_income: '',
    notes: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const response = await tenantsApi.getAll();
    if (response.data) {
      setTenants(response.data.tenants || []);
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
    const response = await tenantsApi.create({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      employment_status: formData.employment_status || undefined,
      employer_name: formData.employer_name || undefined,
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : undefined,
      notes: formData.notes || undefined
    });
    
    if (response.data) {
      showNotification('Tenant created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchTenants();
    } else {
      showNotification(response.error || 'Failed to create tenant', 'error');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    const response = await tenantsApi.update(selectedTenant.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      employment_status: formData.employment_status || undefined,
      employer_name: formData.employer_name || undefined,
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : undefined,
      notes: formData.notes || undefined
    });
    
    if (response.data) {
      showNotification('Tenant updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedTenant(null);
      resetForm();
      fetchTenants();
    } else {
      showNotification(response.error || 'Failed to update tenant', 'error');
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    
    const response = await tenantsApi.delete(tenantId);
    if (response.data) {
      showNotification('Tenant deleted successfully!', 'success');
      fetchTenants();
    } else {
      showNotification(response.error || 'Failed to delete tenant', 'error');
    }
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone || '',
      date_of_birth: tenant.date_of_birth || '',
      employment_status: tenant.employment_status || '',
      employer_name: tenant.employer_name || '',
      monthly_income: tenant.monthly_income?.toString() || '',
      notes: tenant.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      employment_status: '',
      employer_name: '',
      monthly_income: '',
      notes: ''
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

  const getBackgroundCheckBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      not_required: 'secondary'
    };
    return colors[status] || 'secondary';
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Tenants</h1>
            <p className="text-muted mb-0">Manage your tenant relationships</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Add Tenant
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
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                      Add Your First Tenant
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            tenants.map(tenant => (
              <div key={tenant.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">
                      {tenant.first_name} {tenant.last_name}
                    </h6>
                    <span className={`badge bg-${getBackgroundCheckBadge(tenant.background_check_status || 'pending')}`}>
                      {tenant.background_check_status || 'pending'}
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
                    {tenant.lease && (
                      <>
                        <p className="card-text">
                          <small className="text-muted d-block">Property</small>
                          <strong>{tenant.lease.property_name}</strong>
                        </p>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <small className="text-muted d-block">Unit</small>
                            <strong>{tenant.lease.unit_number || 'N/A'}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Rent</small>
                            <strong>${tenant.lease.rent_amount}/mo</strong>
                          </div>
                        </div>
                      </>
                    )}
                    {tenant.employment_status && (
                      <p className="card-text">
                        <small className="text-muted d-block">Employment</small>
                        <strong className="text-capitalize">{tenant.employment_status}</strong>
                        {tenant.employer_name && <span className="text-muted"> at {tenant.employer_name}</span>}
                      </p>
                    )}
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
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Tenant</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date of Birth</label>
                        <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Employment Status</label>
                        <select className="form-select" name="employment_status" value={formData.employment_status} onChange={handleInputChange}>
                          <option value="">Select...</option>
                          <option value="employed">Employed</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="student">Student</option>
                          <option value="retired">Retired</option>
                          <option value="unemployed">Unemployed</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Employer Name</label>
                        <input type="text" className="form-control" name="employer_name" value={formData.employer_name} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Monthly Income ($)</label>
                        <input type="number" className="form-control" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notes</label>
                        <textarea className="form-control" name="notes" value={formData.notes} onChange={handleInputChange} rows={3}></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Tenant</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedTenant && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tenant Details</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowDetailsModal(false); setSelectedTenant(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Personal Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Name:</strong></td><td>{selectedTenant.first_name} {selectedTenant.last_name}</td></tr>
                          <tr><td><strong>Email:</strong></td><td>{selectedTenant.email}</td></tr>
                          <tr><td><strong>Phone:</strong></td><td>{selectedTenant.phone || 'Not provided'}</td></tr>
                          <tr><td><strong>DOB:</strong></td><td>{selectedTenant.date_of_birth ? new Date(selectedTenant.date_of_birth).toLocaleDateString() : 'Not provided'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Employment Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Status:</strong></td><td className="text-capitalize">{selectedTenant.employment_status || 'Not provided'}</td></tr>
                          <tr><td><strong>Employer:</strong></td><td>{selectedTenant.employer_name || 'Not provided'}</td></tr>
                          <tr><td><strong>Monthly Income:</strong></td><td>{selectedTenant.monthly_income ? `$${selectedTenant.monthly_income.toLocaleString()}` : 'Not provided'}</td></tr>
                          <tr><td><strong>Credit Score:</strong></td><td>{selectedTenant.credit_score || 'Not provided'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    {selectedTenant.lease && (
                      <div className="col-12 mt-3">
                        <h6>Lease Information</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr><td><strong>Property:</strong></td><td>{selectedTenant.lease.property_name}</td></tr>
                            <tr><td><strong>Address:</strong></td><td>{selectedTenant.lease.property_address}</td></tr>
                            <tr><td><strong>Unit:</strong></td><td>{selectedTenant.lease.unit_number || 'N/A'}</td></tr>
                            <tr><td><strong>Rent:</strong></td><td>${selectedTenant.lease.rent_amount}/mo</td></tr>
                            <tr><td><strong>Lease Period:</strong></td><td>{new Date(selectedTenant.lease.start_date).toLocaleDateString()} - {new Date(selectedTenant.lease.end_date).toLocaleDateString()}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    {selectedTenant.notes && (
                      <div className="col-12 mt-3">
                        <h6>Notes</h6>
                        <p>{selectedTenant.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowDetailsModal(false); setSelectedTenant(null); }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedTenant && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Tenant</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setSelectedTenant(null); resetForm(); }}></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date of Birth</label>
                        <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Employment Status</label>
                        <select className="form-select" name="employment_status" value={formData.employment_status} onChange={handleInputChange}>
                          <option value="">Select...</option>
                          <option value="employed">Employed</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="student">Student</option>
                          <option value="retired">Retired</option>
                          <option value="unemployed">Unemployed</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Employer Name</label>
                        <input type="text" className="form-control" name="employer_name" value={formData.employer_name} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Monthly Income ($)</label>
                        <input type="number" className="form-control" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notes</label>
                        <textarea className="form-control" name="notes" value={formData.notes} onChange={handleInputChange} rows={3}></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setSelectedTenant(null); resetForm(); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Tenant</button>
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