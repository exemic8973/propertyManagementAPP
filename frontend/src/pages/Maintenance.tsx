import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { maintenanceApi, propertiesApi, MaintenanceRequest, Property } from '../services/api';

const Maintenance: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    const [requestsRes, propertiesRes] = await Promise.all([
      maintenanceApi.getAll(filter),
      propertiesApi.getAll()
    ]);
    
    if (requestsRes.data) {
      setRequests(requestsRes.data.requests);
    }
    if (propertiesRes.data) {
      setProperties(propertiesRes.data.properties);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await maintenanceApi.create(formData);
    if (response.data) {
      showNotification('Maintenance request created successfully!', 'success');
      setShowAddModal(false);
      setFormData({
        property_id: '',
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
        notes: ''
      });
      fetchData();
    } else {
      showNotification(response.error || 'Failed to create request', 'error');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const response = await maintenanceApi.update(id, { status: status as any });
    if (response.data) {
      showNotification('Status updated successfully!', 'success');
      fetchData();
    } else {
      showNotification(response.error || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    const response = await maintenanceApi.delete(id);
    if (response.data) {
      showNotification('Request deleted successfully!', 'success');
      fetchData();
    } else {
      showNotification(response.error || 'Failed to delete request', 'error');
    }
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
      open: 'warning',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
      emergency: 'danger'
    };
    return colors[priority] || 'secondary';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      plumbing: '🚿',
      electrical: '⚡',
      hvac: '❄️',
      appliance: '🔧',
      pest_control: '🐛',
      structural: '🏗️',
      landscaping: '🌳',
      other: '📋'
    };
    return icons[category] || '📋';
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
      
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Maintenance Requests</h1>
            <p className="text-muted mb-0">Track and manage property maintenance</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager' || user?.role === 'tenant') && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + New Request
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <select 
                  className="form-select" 
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={filter.priority}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                >
                  <option value="">All Priorities</option>
                  <option value="emergency">Emergency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="card text-center py-5">
            <div className="card-body">
              <h5 className="text-muted">No Maintenance Requests</h5>
              <p className="text-muted">No requests match your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {requests.map(request => (
              <div key={request.id} className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                      {getCategoryIcon(request.category)} {request.title}
                    </span>
                    <div>
                      <span className={`badge bg-${getPriorityBadge(request.priority)} me-2`}>
                        {request.priority}
                      </span>
                      <span className={`badge bg-${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text">
                      <small className="text-muted">Property:</small><br />
                      <strong>{request.property.name}</strong>
                      {request.unit && <span className="text-muted ms-2">Unit {request.unit.unit_number}</span>}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Category:</small><br />
                      <strong className="text-capitalize">{request.category.replace('_', ' ')}</strong>
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Description:</small><br />
                      {request.description}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Created:</small><br />
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="card-footer">
                    <div className="btn-group w-100">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                      >
                        View Details
                      </button>
                      {user?.role !== 'tenant' && request.status === 'open' && (
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                      )}
                      {user?.role !== 'tenant' && request.status === 'in_progress' && (
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleStatusUpdate(request.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(request.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">New Maintenance Request</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Property *</label>
                        <select
                          className="form-select"
                          value={formData.property_id}
                          onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                          required
                        >
                          <option value="">Select Property</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        >
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="hvac">HVAC</option>
                          <option value="appliance">Appliance</option>
                          <option value="pest_control">Pest Control</option>
                          <option value="structural">Structural</option>
                          <option value="landscaping">Landscaping</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Request Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Title:</strong></td><td>{selectedRequest.title}</td></tr>
                          <tr><td><strong>Category:</strong></td><td className="text-capitalize">{selectedRequest.category.replace('_', ' ')}</td></tr>
                          <tr><td><strong>Priority:</strong></td><td><span className={`badge bg-${getPriorityBadge(selectedRequest.priority)}`}>{selectedRequest.priority}</span></td></tr>
                          <tr><td><strong>Status:</strong></td><td><span className={`badge bg-${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Property Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><td><strong>Property:</strong></td><td>{selectedRequest.property.name}</td></tr>
                          <tr><td><strong>Address:</strong></td><td>{selectedRequest.property.address}</td></tr>
                          {selectedRequest.unit && (
                            <tr><td><strong>Unit:</strong></td><td>{selectedRequest.unit.unit_number}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="col-12">
                      <h6>Description</h6>
                      <p>{selectedRequest.description}</p>
                    </div>
                    {selectedRequest.notes && (
                      <div className="col-12">
                        <h6>Notes</h6>
                        <p>{selectedRequest.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                    Close
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

export default Maintenance;
