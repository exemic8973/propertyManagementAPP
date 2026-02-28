import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LeaseSignLayout from '../components/LeaseSignLayout';
import api, { LeaseSignDocument } from '../services/api';

const statusColors: Record<string, { bg: string; text: string; light: string }> = {
  draft: { bg: '#6b7280', text: '#374151', light: '#f3f4f6' },
  pending_signature: { bg: '#f59e0b', text: '#92400e', light: '#fef3c7' },
  partial: { bg: '#3b82f6', text: '#1e40af', light: '#dbeafe' },
  active: { bg: '#10b981', text: '#065f46', light: '#d1fae5' },
  terminated: { bg: '#ef4444', text: '#991b1b', light: '#fee2e2' },
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_signature: 'Pending',
  partial: 'Partially Signed',
  active: 'Completed',
  terminated: 'Voided',
};

const LeaseSignList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  
  const [documents, setDocuments] = useState<LeaseSignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total_documents: 0,
    draft_documents: 0,
    pending_documents: 0,
    partial_documents: 0,
    completed_documents: 0,
    voided_documents: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    loadData();
  }, [filterStatus, search]);

  const loadData = async () => {
    setLoading(true);
    const [docsResult, statsResult] = await Promise.all([
      api.leaseSign.getDocuments({ status: filterStatus || undefined, search: search || undefined }),
      api.leaseSign.getStats(),
    ]);

    if (docsResult.data) {
      setDocuments(docsResult.data.documents);
    }
    if (statsResult.data) {
      setStats({ ...stats, ...statsResult.data.stats });
    }
    setLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(d => d.id));
    }
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    const result = await api.leaseSign.deleteDocument(id);
    if (result.data) {
      loadData();
    } else {
      alert(result.error || 'Failed to delete document');
    }
  };

  const handleVoid = async (id: string) => {
    const reason = window.prompt('Enter reason for voiding:');
    if (!reason) return;
    
    const result = await api.leaseSign.voidDocument(id, reason);
    if (result.data) {
      loadData();
    } else {
      alert(result.error || 'Failed to void document');
    }
  };

  const handleBulkDelete = async () => {
    const draftsToDelete = documents.filter(d => selectedDocs.includes(d.id) && d.status === 'draft');
    if (draftsToDelete.length === 0) {
      alert('Only draft documents can be deleted');
      return;
    }
    
    if (!window.confirm(`Delete ${draftsToDelete.length} draft document(s)?`)) return;
    
    for (const doc of draftsToDelete) {
      await api.leaseSign.deleteDocument(doc.id);
    }
    setSelectedDocs([]);
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMoney = (amount: number | undefined) => {
    if (!amount) return '$0';
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Calculate completion rate
  const completionRate = stats.total_documents > 0 
    ? Math.round((stats.completed_documents / stats.total_documents) * 100) 
    : 0;

  // Monthly trend data (mock - would come from API in real implementation)
  const monthlyData = [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 8 },
    { month: 'Mar', count: 12 },
    { month: 'Apr', count: 7 },
    { month: 'May', count: 15 },
    { month: 'Jun', count: stats.total_documents },
  ];
  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <LeaseSignLayout title="Dashboard">
      <div style={{ padding: '32px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>📄</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Documents</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>{stats.total_documents}</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>⏳</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Awaiting</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{stats.pending_documents}</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>✅</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Completed</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{stats.completed_documents}</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>📝</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Drafts</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#6b7280' }}>{stats.draft_documents}</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>📊</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Completion Rate</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>{completionRate}%</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#cffafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>⏱️</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Partial</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#06b6d4' }}>{stats.partial_documents || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {/* Monthly Trends */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: '#1f2937' }}>Monthly Trends</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '150px' }}>
              {monthlyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: `${(d.count / maxCount) * 100}%`,
                    minHeight: '20px',
                    backgroundColor: i === monthlyData.length - 1 ? '#4f46e5' : '#818cf8',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s',
                  }} />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Overview */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: '#1f2937' }}>Status Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Drafts', count: stats.draft_documents, color: '#6b7280' },
                { label: 'Pending', count: stats.pending_documents, color: '#f59e0b' },
                { label: 'Partial', count: stats.partial_documents || 0, color: '#3b82f6' },
                { label: 'Completed', count: stats.completed_documents, color: '#10b981' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '80px', fontSize: '13px', color: '#6b7280' }}>{item.label}</div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${stats.total_documents > 0 ? (item.count / stats.total_documents) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: '4px',
                    }} />
                  </div>
                  <div style={{ width: '30px', textAlign: 'right', fontSize: '13px', fontWeight: 500 }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6',
          overflow: 'hidden',
        }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by lease number, name, or address..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                minWidth: '160px',
                cursor: 'pointer',
              }}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="partial">Partially Signed</option>
              <option value="active">Completed</option>
              <option value="terminated">Voided</option>
            </select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedDocs.length > 0 && (
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#eef2ff',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: 500 }}>
                {selectedDocs.length} selected
              </span>
              <button
                onClick={() => setSelectedDocs([])}
                style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                Delete Drafts
              </button>
            </div>
          )}

          {/* Documents List */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No documents found</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
                {search || filterStatus ? 'Try adjusting your search or filters' : 'Create your first lease document to get started'}
              </div>
              {!search && !filterStatus && (
                <button
                  onClick={() => navigate('/lease-sign/new')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  + New Document
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Header Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 180px 120px 140px 180px',
                gap: '16px',
                padding: '12px 20px',
                backgroundColor: '#f9fafb',
                fontSize: '12px',
                fontWeight: 500,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <div>
                  <input
                    type="checkbox"
                    checked={selectedDocs.length === documents.length}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>
                <div>Document</div>
                <div>Tenant</div>
                <div>Rent</div>
                <div>Status</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {/* Document Rows */}
              {documents.map(doc => {
                const wizardData = doc.wizard_data;
                const tenantName = `${wizardData?.tenant?.firstName || ''} ${wizardData?.tenant?.lastName || ''}`.trim() || 'Unknown';
                const propertyAddress = wizardData?.property?.address || 'Unknown Property';
                const monthlyRent = wizardData?.rent?.monthlyRent || 0;
                const colors = statusColors[doc.status] || statusColors.draft;

                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 180px 120px 140px 180px',
                      gap: '16px',
                      padding: '16px 20px',
                      alignItems: 'center',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1f2937', marginBottom: '4px' }}>
                        {doc.lease_number}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        📍 {propertyAddress}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        Created {formatDate(doc.created_at)}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>{tenantName}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{formatMoney(monthlyRent)}</div>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: colors.light,
                        color: colors.text,
                      }}>
                        {statusLabels[doc.status]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {doc.status === 'draft' && (
                        <>
                          <button
                            onClick={() => navigate(`/lease-sign/new?edit=${doc.id}`)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4f46e5',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'white',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {(doc.status === 'pending_signature' || doc.status === 'partial') && (
                        <button
                          onClick={() => handleVoid(doc.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Void
                        </button>
                      )}
                      {doc.status === 'active' && (
                        <button
                          onClick={() => window.open(api.leaseSign.getPdfUrl(doc.id), '_blank')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          PDF
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/lease-sign/documents/${doc.id}`)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LeaseSignLayout>
  );
};

export default LeaseSignList;