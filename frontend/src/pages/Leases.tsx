import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { leasesApi, tenantsApi, propertiesApi, Lease, Tenant, Property } from '../services/api';

interface LeaseFormData {
  tenant_id: string;
  property_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  security_deposit: string;
  pet_fee: string;
  pet_deposit: string;
  utilities_included: boolean;
  parking_spaces: string;
  notes: string;
}

const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  return months > 0 ? `${months} month${months > 1 ? 's' : ''}` : `${diffDays} days`;
};

const Leases: React.FC = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signing, setSigning] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [formData, setFormData] = useState<LeaseFormData>({
    tenant_id: '',
    property_id: '',
    unit_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    pet_fee: '0',
    pet_deposit: '0',
    utilities_included: false,
    parking_spaces: '0',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [leasesRes, tenantsRes, propertiesRes] = await Promise.all([
      leasesApi.getAll(),
      tenantsApi.getAll(),
      propertiesApi.getAll()
    ]);
    
    if (leasesRes.data) setLeases(leasesRes.data.leases || []);
    if (tenantsRes.data) setTenants(tenantsRes.data.tenants || []);
    if (propertiesRes.data) setProperties(propertiesRes.data.properties || []);
    setLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePropertyChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    setFormData(prev => ({ ...prev, property_id: propertyId, unit_id: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await leasesApi.create({
      tenant_id: formData.tenant_id,
      property_id: formData.property_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      monthly_rent: parseFloat(formData.monthly_rent),
      security_deposit: parseFloat(formData.security_deposit),
      pet_fee: parseFloat(formData.pet_fee) || 0,
      pet_deposit: parseFloat(formData.pet_deposit) || 0,
      utilities_included: formData.utilities_included,
      parking_spaces: parseInt(formData.parking_spaces) || 0
    });
    
    if (response.data) {
      showNotification('Lease created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } else {
      showNotification(response.error || 'Failed to create lease', 'error');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLease) return;
    
    const response = await leasesApi.update(selectedLease.id, {
      tenant_id: formData.tenant_id,
      property_id: formData.property_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      monthly_rent: parseFloat(formData.monthly_rent),
      security_deposit: parseFloat(formData.security_deposit),
      pet_fee: parseFloat(formData.pet_fee) || 0,
      pet_deposit: parseFloat(formData.pet_deposit) || 0,
      utilities_included: formData.utilities_included,
      parking_spaces: parseInt(formData.parking_spaces) || 0
    });
    
    if (response.data) {
      showNotification('Lease updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedLease(null);
      resetForm();
      fetchData();
    } else {
      showNotification(response.error || 'Failed to update lease', 'error');
    }
  };

  const handleDelete = async (leaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this lease?')) return;
    
    const response = await leasesApi.delete(leaseId);
    if (response.data) {
      showNotification('Lease deleted successfully!', 'success');
      fetchData();
    } else {
      showNotification(response.error || 'Failed to delete lease', 'error');
    }
  };

  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [terminating, setTerminating] = useState(false);

  const openTerminateModal = (lease: Lease) => {
    setSelectedLease(lease);
    setTerminateReason('');
    setShowTerminateModal(true);
  };

  const handleTerminateLease = async () => {
    if (!selectedLease) return;
    
    setTerminating(true);
    const response = await leasesApi.terminate(selectedLease.id, terminateReason);
    setTerminating(false);

    if (response.data) {
      showNotification('Lease terminated successfully!', 'success');
      setShowTerminateModal(false);
      setTerminateReason('');
      setSelectedLease(null);
      fetchData();
    } else {
      showNotification(response.error || 'Failed to terminate lease', 'error');
    }
  };

  const handleSignLease = async () => {
    if (!selectedLease || !signatureName.trim()) {
      showNotification('Please enter your full name to sign', 'error');
      return;
    }

    setSigning(true);
    const response = await leasesApi.sign(selectedLease.id, signatureName);
    setSigning(false);

    if (response.data) {
      showNotification('Lease signed successfully!', 'success');
      setShowSignModal(false);
      setSignatureName('');
      setSelectedLease(null);
      fetchData();
    } else {
      showNotification(response.error || 'Failed to sign lease', 'error');
    }
  };

  // Send for e-signature (initiate e-sign process)
  const [sendingEsign, setSendingEsign] = useState(false);
  
  const handleInitiateEsign = async (leaseId: string) => {
    if (!window.confirm('Send this lease to the tenant for e-signature? The tenant will receive an email with a signing link.')) return;
    
    setSendingEsign(true);
    try {
      const response = await leasesApi.initiateEsign(leaseId);
      if (response.data) {
        showNotification('E-sign request sent to tenant successfully!', 'success');
        fetchData();
      } else {
        showNotification(response.error || 'Failed to send e-sign request', 'error');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to send e-sign request', 'error');
    } finally {
      setSendingEsign(false);
    }
  };

  const openSignModal = (lease: Lease) => {
    setSelectedLease(lease);
    setSignatureName(`${user?.first_name} ${user?.last_name}`);
    setShowSignModal(true);
  };

  const handleViewPdf = async (leaseId: string) => {
    setPdfLoading(true);
    setShowPdfModal(true);
    setPdfUrl(null);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/leases/${leaseId}/pdf?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error loading PDF:', error);
      showNotification('Failed to load PDF document', 'error');
      setShowPdfModal(false);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl && selectedLease) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Lease_${selectedLease.lease_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClosePdfModal = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setShowPdfModal(false);
  };

  const handleViewDetails = (lease: Lease) => {
    setSelectedLease(lease);
    setShowDetailsModal(true);
  };

  const handleEdit = (lease: Lease) => {
    setSelectedLease(lease);
    setFormData({
      tenant_id: lease.tenant.id,
      property_id: lease.property.id,
      unit_id: lease.unit?.id || '',
      start_date: lease.start_date,
      end_date: lease.end_date,
      monthly_rent: lease.monthly_rent.toString(),
      security_deposit: lease.security_deposit.toString(),
      pet_fee: lease.pet_fee?.toString() || '0',
      pet_deposit: lease.pet_deposit?.toString() || '0',
      utilities_included: lease.utilities_included || false,
      parking_spaces: lease.parking_spaces?.toString() || '0',
      notes: ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      property_id: '',
      unit_id: '',
      start_date: '',
      end_date: '',
      monthly_rent: '',
      security_deposit: '',
      pet_fee: '0',
      pet_deposit: '0',
      utilities_included: false,
      parking_spaces: '0',
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      expired: 'danger',
      pending_signature: 'warning',
      draft: 'secondary',
      terminated: 'dark'
    };
    return colors[status] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <h1 className="h3 mb-1">Leases</h1>
            <p className="text-muted mb-0">Manage rental agreements and contracts</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Create Lease
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
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                      Create Your First Lease
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            leases.map(lease => (
              <div key={lease.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">{lease.lease_number}</h6>
                    <span className={`badge bg-${getStatusBadge(lease.status)}`}>
                      {lease.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="card-text">
                      <small className="text-muted d-block">Tenant</small>
                      <strong>{lease.tenant.first_name} {lease.tenant.last_name}</strong>
                    </p>
                    <p className="card-text">
                      <small className="text-muted d-block">Property</small>
                      <strong>{lease.property.name}</strong>
                      {lease.unit && <span className="text-muted ms-1">(Unit {lease.unit.unit_number})</span>}
                    </p>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">Monthly Rent</small>
                        <strong>{formatCurrency(lease.monthly_rent)}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Duration</small>
                        <strong>{calculateDuration(lease.start_date, lease.end_date)}</strong>
                      </div>
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
                      {lease.status === 'active' && (
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => { setSelectedLease(lease); handleViewPdf(lease.id); }}
                        >
                          View Document
                        </button>
                      )}
                      {lease.status === 'active' && (user?.role === 'landlord' || user?.role === 'property_manager') && (
                        <button 
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => openTerminateModal(lease)}
                        >
                          Terminate
                        </button>
                      )}
                      {(lease.status === 'pending_signature' || lease.status === 'partial') && (
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => openSignModal(lease)}
                        >
                          Sign
                        </button>
                      )}
                      {(user?.role === 'landlord' || user?.role === 'property_manager') && lease.status === 'pending_signature' && (
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleInitiateEsign(lease.id)}
                          disabled={sendingEsign}
                        >
                          {sendingEsign ? 'Sending...' : 'Send for E-Sign'}
                        </button>
                      )}
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
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Lease</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tenant *</label>
                        <select className="form-select" name="tenant_id" value={formData.tenant_id} onChange={handleInputChange} required>
                          <option value="">Select Tenant</option>
                          {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property *</label>
                        <select className="form-select" name="property_id" value={formData.property_id} onChange={handlePropertyChange} required>
                          <option value="">Select Property</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input type="date" className="form-control" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input type="date" className="form-control" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Monthly Rent ($) *</label>
                        <input type="number" className="form-control" name="monthly_rent" value={formData.monthly_rent} onChange={handleInputChange} min="0" step="0.01" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Security Deposit ($) *</label>
                        <input type="number" className="form-control" name="security_deposit" value={formData.security_deposit} onChange={handleInputChange} min="0" step="0.01" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pet Fee ($)</label>
                        <input type="number" className="form-control" name="pet_fee" value={formData.pet_fee} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pet Deposit ($)</label>
                        <input type="number" className="form-control" name="pet_deposit" value={formData.pet_deposit} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Parking Spaces</label>
                        <input type="number" className="form-control" name="parking_spaces" value={formData.parking_spaces} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mt-4">
                          <input type="checkbox" className="form-check-input" name="utilities_included" checked={formData.utilities_included} onChange={handleInputChange} id="utilitiesIncluded" />
                          <label className="form-check-label" htmlFor="utilitiesIncluded">Utilities Included</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Lease</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedLease && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Lease Details</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowDetailsModal(false); setSelectedLease(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6>Lease Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Lease #:</strong></td><td>{selectedLease.lease_number}</td></tr>
                          <tr><td><strong>Status:</strong></td><td><span className={`badge bg-${getStatusBadge(selectedLease.status)}`}>{selectedLease.status.replace('_', ' ')}</span></td></tr>
                          <tr><td><strong>Rent:</strong></td><td>{formatCurrency(selectedLease.monthly_rent)}/mo</td></tr>
                          <tr><td><strong>Security Deposit:</strong></td><td>{formatCurrency(selectedLease.security_deposit)}</td></tr>
                          <tr><td><strong>Duration:</strong></td><td>{calculateDuration(selectedLease.start_date, selectedLease.end_date)}</td></tr>
                          <tr><td><strong>Start Date:</strong></td><td>{new Date(selectedLease.start_date).toLocaleDateString()}</td></tr>
                          <tr><td><strong>End Date:</strong></td><td>{new Date(selectedLease.end_date).toLocaleDateString()}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Tenant Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Name:</strong></td><td>{selectedLease.tenant.first_name} {selectedLease.tenant.last_name}</td></tr>
                          <tr><td><strong>Email:</strong></td><td>{selectedLease.tenant.email}</td></tr>
                          <tr><td><strong>Phone:</strong></td><td>{selectedLease.tenant.phone || 'Not provided'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-12">
                      <h6>Property Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Property:</strong></td><td>{selectedLease.property.name}</td></tr>
                          <tr><td><strong>Address:</strong></td><td>{selectedLease.property.address}</td></tr>
                          {selectedLease.unit && (
                            <tr><td><strong>Unit:</strong></td><td>{selectedLease.unit.unit_number} ({selectedLease.unit.unit_type.replace('_', ' ')})</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Signature Status Section */}
                    {(selectedLease.status === 'pending_signature' || selectedLease.status === 'partial') && (
                      <div className="col-12">
                        <div className="alert alert-warning">
                          <h6 className="alert-heading">⏳ Awaiting Signatures</h6>
                          <p className="mb-2">This lease requires signatures before it becomes active.</p>
                          <div className="row">
                            <div className="col-6">
                              <strong>Landlord:</strong>
                              <span className={`badge ${selectedLease.status === 'partial' ? 'bg-secondary' : 'bg-secondary'} ms-2`}>
                                {selectedLease.status === 'partial' ? 'Pending' : 'Pending'}
                              </span>
                            </div>
                            <div className="col-6">
                              <strong>Tenant:</strong>
                              <span className={`badge ${selectedLease.status === 'partial' ? 'bg-success' : 'bg-secondary'} ms-2`}>
                                {selectedLease.status === 'partial' ? 'Signed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {(selectedLease.pet_fee || selectedLease.pet_deposit || selectedLease.parking_spaces) && (
                      <div className="col-12">
                        <h6>Additional Details</h6>
                        <table className="table table-sm">
                          <tbody>
                            {selectedLease.pet_fee && selectedLease.pet_fee > 0 && (
                              <tr><td><strong>Pet Fee:</strong></td><td>{formatCurrency(selectedLease.pet_fee)}</td></tr>
                            )}
                            {selectedLease.pet_deposit && selectedLease.pet_deposit > 0 && (
                              <tr><td><strong>Pet Deposit:</strong></td><td>{formatCurrency(selectedLease.pet_deposit)}</td></tr>
                            )}
                            {selectedLease.parking_spaces && selectedLease.parking_spaces > 0 && (
                              <tr><td><strong>Parking Spaces:</strong></td><td>{selectedLease.parking_spaces}</td></tr>
                            )}
                            <tr><td><strong>Utilities Included:</strong></td><td>{selectedLease.utilities_included ? 'Yes' : 'No'}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  {(selectedLease.status === 'pending_signature' || selectedLease.status === 'partial') && (
                    <button 
                      type="button" 
                      className="btn btn-success me-auto"
                      onClick={() => { setShowDetailsModal(false); openSignModal(selectedLease); }}
                    >
                      ✍️ Sign This Lease
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowDetailsModal(false); setSelectedLease(null); }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedLease && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Lease</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setSelectedLease(null); resetForm(); }}></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tenant *</label>
                        <select className="form-select" name="tenant_id" value={formData.tenant_id} onChange={handleInputChange} required>
                          <option value="">Select Tenant</option>
                          {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Property *</label>
                        <select className="form-select" name="property_id" value={formData.property_id} onChange={handlePropertyChange} required>
                          <option value="">Select Property</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input type="date" className="form-control" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input type="date" className="form-control" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Monthly Rent ($) *</label>
                        <input type="number" className="form-control" name="monthly_rent" value={formData.monthly_rent} onChange={handleInputChange} min="0" step="0.01" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Security Deposit ($) *</label>
                        <input type="number" className="form-control" name="security_deposit" value={formData.security_deposit} onChange={handleInputChange} min="0" step="0.01" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pet Fee ($)</label>
                        <input type="number" className="form-control" name="pet_fee" value={formData.pet_fee} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pet Deposit ($)</label>
                        <input type="number" className="form-control" name="pet_deposit" value={formData.pet_deposit} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Parking Spaces</label>
                        <input type="number" className="form-control" name="parking_spaces" value={formData.parking_spaces} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mt-4">
                          <input type="checkbox" className="form-check-input" name="utilities_included" checked={formData.utilities_included} onChange={handleInputChange} id="utilitiesIncludedEdit" />
                          <label className="form-check-label" htmlFor="utilitiesIncludedEdit">Utilities Included</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setSelectedLease(null); resetForm(); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Lease</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Sign Lease Modal */}
        {showSignModal && selectedLease && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">✍️ Sign Lease Agreement</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setShowSignModal(false); setSignatureName(''); }}></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Lease:</strong> {selectedLease.lease_number}<br />
                    <strong>Property:</strong> {selectedLease.property.name}<br />
                    <strong>Monthly Rent:</strong> {formatCurrency(selectedLease.monthly_rent)}
                  </div>
                  
                  <p className="text-muted">
                    By signing below, you agree to the terms and conditions of this lease agreement.
                    Your electronic signature will be legally binding.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Type your full name to sign *</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Enter your full legal name"
                      style={{ fontFamily: 'cursive', fontSize: '1.5rem' }}
                    />
                  </div>

                  <div className="form-check mb-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id="agreeTerms"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="agreeTerms">
                      I have read and agree to the lease terms
                    </label>
                  </div>

                  <div className="bg-light p-3 rounded">
                    <small className="text-muted">
                      <strong>Signature:</strong>
                      <div style={{ fontFamily: 'cursive', fontSize: '1.5rem', color: '#333' }}>
                        {signatureName || 'Your signature will appear here'}
                      </div>
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowSignModal(false); setSignatureName(''); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleSignLease}
                    disabled={signing || !signatureName.trim()}
                  >
                    {signing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing...
                      </>
                    ) : (
                      <>✍️ Sign Lease</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPdfModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content" style={{ height: '90vh' }}>
                <div className="modal-header">
                  <h5 className="modal-title">Lease Document - {selectedLease?.lease_number}</h5>
                  <button type="button" className="btn-close" onClick={handleClosePdfModal}></button>
                </div>
                <div className="modal-body p-0" style={{ overflow: 'hidden' }}>
                  {pdfLoading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading PDF document...</p>
                      </div>
                    </div>
                  ) : pdfUrl ? (
                    <iframe 
                      src={pdfUrl} 
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="Lease PDF Preview"
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <p className="text-muted">Failed to load document</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleClosePdfModal}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleDownloadPdf}
                    disabled={!pdfUrl}
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terminate Modal */}
        {showTerminateModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Terminate Lease</h5>
                  <button type="button" className="btn-close" onClick={() => setShowTerminateModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to terminate this lease?</p>
                  <p className="text-muted mb-3">
                    <strong>Lease:</strong> {selectedLease?.lease_number}<br />
                    <strong>Tenant:</strong> {selectedLease?.tenant.first_name} {selectedLease?.tenant.last_name}<br />
                    <strong>Property:</strong> {selectedLease?.property.name}
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Termination Reason (optional)</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      value={terminateReason}
                      onChange={(e) => setTerminateReason(e.target.value)}
                      placeholder="Enter reason for termination..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowTerminateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={handleTerminateLease}
                    disabled={terminating}
                  >
                    {terminating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Terminating...
                      </>
                    ) : (
                      'Terminate Lease'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leases;