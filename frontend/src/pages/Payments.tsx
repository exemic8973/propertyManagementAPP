import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { paymentsApi, leasesApi, Payment, Lease } from '../services/api';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', lease_id: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    lease_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'online',
    transaction_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    const [paymentsRes, leasesRes] = await Promise.all([
      paymentsApi.getAll(filter),
      leasesApi.getAll({ status: 'active' })
    ]);
    
    if (paymentsRes.data) {
      setPayments(paymentsRes.data.payments);
    }
    if (leasesRes.data) {
      setLeases(leasesRes.data.leases);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await paymentsApi.create({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    if (response.data) {
      showNotification('Payment recorded successfully!', 'success');
      setShowAddModal(false);
      setFormData({
        lease_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'online',
        transaction_id: '',
        notes: ''
      });
      fetchData();
    } else {
      showNotification(response.error || 'Failed to record payment', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    const response = await paymentsApi.delete(id);
    if (response.data) {
      showNotification('Payment deleted successfully!', 'success');
      fetchData();
    } else {
      showNotification(response.error || 'Failed to delete payment', 'error');
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
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      partial: 'info',
      overdue: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      check: '📝',
      bank_transfer: '🏦',
      online: '💳',
      other: '💰'
    };
    return icons[method] || '💰';
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
      
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Payments</h1>
            <p className="text-muted mb-0">Track rent payments and transactions</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'property_manager' || user?.role === 'tenant') && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Record Payment
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={filter.lease_id}
                  onChange={(e) => setFilter({ ...filter, lease_id: e.target.value })}
                >
                  <option value="">All Leases</option>
                  {leases.map(lease => (
                    <option key={lease.id} value={lease.id}>
                      {lease.lease_number} - {lease.tenant.first_name} {lease.tenant.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="card text-center py-5">
            <div className="card-body">
              <h5 className="text-muted">No Payments Found</h5>
              <p className="text-muted">No payments match your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td>
                        {payment.tenant.first_name} {payment.tenant.last_name}
                        {payment.late_fee_applied && (
                          <span className="badge bg-warning ms-2">Late</span>
                        )}
                      </td>
                      <td>
                        {payment.property.name}
                        {payment.property.unit_number && (
                          <span className="text-muted ms-1">Unit {payment.property.unit_number}</span>
                        )}
                      </td>
                      <td>
                        <strong>{formatCurrency(payment.amount)}</strong>
                        {payment.late_fee_amount > 0 && (
                          <div><small className="text-danger">+{formatCurrency(payment.late_fee_amount)} late fee</small></div>
                        )}
                      </td>
                      <td>
                        {getMethodIcon(payment.payment_method)} 
                        <span className="text-capitalize ms-1">{payment.payment_method.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailsModal(true);
                            }}
                          >
                            View
                          </button>
                          {(user?.role === 'landlord' || user?.role === 'property_manager') && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(payment.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Record Payment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Lease *</label>
                        <select
                          className="form-select"
                          value={formData.lease_id}
                          onChange={(e) => {
                            const selectedLease = leases.find(l => l.id === e.target.value);
                            setFormData({ 
                              ...formData, 
                              lease_id: e.target.value,
                              amount: selectedLease ? selectedLease.monthly_rent.toString() : ''
                            });
                          }}
                          required
                        >
                          <option value="">Select Lease</option>
                          {leases.map(lease => (
                            <option key={lease.id} value={lease.id}>
                              {lease.lease_number} - {lease.tenant.first_name} {lease.tenant.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Payment Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.payment_date}
                          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Amount ($) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Payment Method *</label>
                        <select
                          className="form-select"
                          value={formData.payment_method}
                          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                          required
                        >
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="online">Online</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Transaction ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.transaction_id}
                          onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                        />
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
                      Record Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPayment && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Payment Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Date:</strong></td>
                        <td>{new Date(selectedPayment.payment_date).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Amount:</strong></td>
                        <td>{formatCurrency(selectedPayment.amount)}</td>
                      </tr>
                      {selectedPayment.late_fee_amount > 0 && (
                        <tr>
                          <td><strong>Late Fee:</strong></td>
                          <td className="text-danger">{formatCurrency(selectedPayment.late_fee_amount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>Method:</strong></td>
                        <td className="text-capitalize">{selectedPayment.payment_method.replace('_', ' ')}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(selectedPayment.payment_status)}`}>
                            {selectedPayment.payment_status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Tenant:</strong></td>
                        <td>{selectedPayment.tenant.first_name} {selectedPayment.tenant.last_name}</td>
                      </tr>
                      <tr>
                        <td><strong>Property:</strong></td>
                        <td>{selectedPayment.property.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Lease #:</strong></td>
                        <td>{selectedPayment.lease.lease_number}</td>
                      </tr>
                      {selectedPayment.transaction_id && (
                        <tr>
                          <td><strong>Transaction ID:</strong></td>
                          <td>{selectedPayment.transaction_id}</td>
                        </tr>
                      )}
                      {selectedPayment.notes && (
                        <tr>
                          <td><strong>Notes:</strong></td>
                          <td>{selectedPayment.notes}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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

export default Payments;
