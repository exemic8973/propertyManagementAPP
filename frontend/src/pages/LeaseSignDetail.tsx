import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeaseSignLayout from '../components/LeaseSignLayout';
import api, { LeaseSignDocument, AuditLog, LeaseComment } from '../services/api';

const statusColors: Record<string, { bg: string; text: string; light: string }> = {
  draft: { bg: '#6b7280', text: '#374151', light: '#f3f4f6' },
  pending_signature: { bg: '#f59e0b', text: '#92400e', light: '#fef3c7' },
  partial: { bg: '#3b82f6', text: '#1e40af', light: '#dbeafe' },
  active: { bg: '#10b981', text: '#065f46', light: '#d1fae5' },
  terminated: { bg: '#ef4444', text: '#991b1b', light: '#fee2e2' },
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_signature: 'Pending Signature',
  partial: 'Partially Signed',
  active: 'Completed',
  terminated: 'Voided',
};

type TabType = 'preview' | 'details' | 'comments' | 'audit';

const LeaseSignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<LeaseSignDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [comments, setComments] = useState<LeaseComment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    const result = await api.leaseSign.getDocument(id);
    if (result.data && result.data.document) {
      setDocument(result.data.document);
      setComments(result.data.comments || []);
      setAuditLogs(result.data.auditLog || []);
    }
    setLoading(false);
  };

  const handleSendForSignature = async () => {
    if (!document) return;
    
    const result = await api.leaseSign.sendForSignature(document.id);
    if (result.data) {
      setShowSendModal(false);
      loadData();
      alert('Document sent for signature successfully!');
    } else {
      alert(result.error || 'Failed to send document');
    }
  };

  const handleVoidDocument = async () => {
    if (!document || !voidReason.trim()) return;
    
    const result = await api.leaseSign.voidDocument(document.id, voidReason);
    if (result.data) {
      setShowVoidModal(false);
      loadData();
    } else {
      alert(result.error || 'Failed to void document');
    }
  };

  const handleDeleteDocument = async () => {
    if (!document) return;
    
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    const result = await api.leaseSign.deleteDocument(document.id);
    if (result.data) {
      navigate('/lease-sign/documents');
    } else {
      alert(result.error || 'Failed to delete document');
    }
  };

  const handleAddComment = async () => {
    if (!document || !newComment.trim()) return;
    
    const result = await api.leaseSign.addComment(document.id, newComment);
    if (result.data?.comment) {
      setNewComment('');
      setComments(prev => [...prev, result.data!.comment]);
    } else {
      alert(result.error || 'Failed to add comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (amount: number | undefined) => {
    if (!amount) return '$0';
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'DOCUMENT_CREATED': 'Document Created',
      'DOCUMENT_UPDATED': 'Document Updated',
      'SENT_FOR_SIGNATURE': 'Sent for Signature',
      'LANDLORD_SIGNED': 'Landlord Signed',
      'TENANT_SIGNED': 'Tenant Signed',
      'DOCUMENT_COMPLETED': 'Document Completed',
      'DOCUMENT_VOIDED': 'Document Voided',
      'COMMENT_ADDED': 'Comment Added',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <LeaseSignLayout>
        <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      </LeaseSignLayout>
    );
  }

  if (!document) {
    return (
      <LeaseSignLayout>
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Document not found</div>
        </div>
      </LeaseSignLayout>
    );
  }

  const wizardData = document.wizard_data;
  const colors = statusColors[document.status] || statusColors.draft;

  return (
    <LeaseSignLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <button
              onClick={() => navigate('/lease-sign/documents')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Documents
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
              {document.lease_number}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: colors.light,
                color: colors.text,
              }}>
                {statusLabels[document.status]}
              </span>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                Created {formatDate(document.created_at)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {document.status === 'draft' && (
              <>
                <button
                  onClick={() => navigate(`/lease-sign/new?edit=${document.id}`)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowSendModal(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Send for Signature
                </button>
                <button
                  onClick={handleDeleteDocument}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </>
            )}
            {document.status === 'pending_signature' || document.status === 'partial' ? (
              <button
                onClick={() => setShowVoidModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Void Document
              </button>
            ) : null}
            {(document.status === 'active' || document.status === 'pending_signature' || document.status === 'partial' || document.status === 'draft') && (
              <button
                onClick={() => window.open(api.leaseSign.getPdfUrl(document.id), '_blank')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: document.status === 'active' ? '#4f46e5' : 'white',
                  color: document.status === 'active' ? 'white' : '#4f46e5',
                  border: document.status === 'active' ? 'none' : '1px solid #4f46e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {document.status === 'active' ? 'Download PDF' : 'Preview PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Left Column - Main Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}>
              {[
                { key: 'preview', label: 'Preview', icon: '📄' },
                { key: 'details', label: 'Details', icon: '📋' },
                { key: 'comments', label: `Comments (${comments.length})`, icon: '💬' },
                { key: 'audit', label: 'Audit Log', icon: '📜' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  style={{
                    padding: '16px 24px',
                    backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
                    color: activeTab === tab.key ? '#4f46e5' : '#6b7280',
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '24px' }}>
              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '24px',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '14px',
                    lineHeight: 1.8,
                    color: '#374151',
                  }}>
                    <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '24px', fontFamily: 'inherit' }}>
                      RESIDENTIAL LEASE AGREEMENT
                    </h2>
                    <p style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'inherit' }}>
                      Lease Number: {document.lease_number}
                    </p>

                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginTop: '16px', fontFamily: 'inherit' }}>1. PARTIES</h3>
                    <p style={{ fontFamily: 'inherit' }}>
                      This Lease Agreement is entered into between:
                    </p>
                    <p style={{ paddingLeft: '16px', fontFamily: 'inherit' }}>
                      <strong>Landlord:</strong> {wizardData?.landlord?.firstName} {wizardData?.landlord?.lastName}
                    </p>
                    <p style={{ paddingLeft: '16px', fontFamily: 'inherit' }}>
                      <strong>Tenant:</strong> {wizardData?.tenant?.firstName} {wizardData?.tenant?.lastName}
                    </p>

                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginTop: '16px', fontFamily: 'inherit' }}>2. PREMISES</h3>
                    <p style={{ fontFamily: 'inherit' }}>
                      Property Address: {wizardData?.property?.address}
                      {wizardData?.property?.city && `, ${wizardData.property.city}`}
                      {wizardData?.property?.state && `, ${wizardData.property.state}`}
                      {wizardData?.property?.zip && ` ${wizardData.property.zip}`}
                    </p>

                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginTop: '16px', fontFamily: 'inherit' }}>3. LEASE TERM</h3>
                    <p style={{ fontFamily: 'inherit' }}>
                      Start Date: {wizardData?.terms?.startDate ? formatDate(wizardData.terms.startDate) : 'TBD'}
                    </p>
                    <p style={{ fontFamily: 'inherit' }}>
                      End Date: {wizardData?.terms?.endDate ? formatDate(wizardData.terms.endDate) : 'TBD'}
                    </p>

                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginTop: '16px', fontFamily: 'inherit' }}>4. RENT</h3>
                    <p style={{ fontFamily: 'inherit' }}>
                      Monthly Rent: {formatMoney(wizardData?.rent?.monthlyRent)}
                    </p>
                    <p style={{ fontFamily: 'inherit' }}>
                      Security Deposit: {formatMoney(wizardData?.rent?.securityDeposit)}
                    </p>

                    <p style={{ marginTop: '32px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', fontFamily: 'inherit' }}>
                      [Full document will be generated upon completion]
                    </p>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div>
                  {/* Property Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Property Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Address</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>{wizardData?.property?.address || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>City, State, ZIP</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>
                          {wizardData?.property?.city}, {wizardData?.property?.state} {wizardData?.property?.zip}
                        </p>
                      </div>
                      {wizardData?.property?.squareFeet && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '13px', color: '#6b7280' }}>Square Feet</label>
                          <p style={{ fontWeight: 500, color: '#1f2937' }}>{wizardData.property.squareFeet}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Landlord Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Landlord
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Name</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>
                          {wizardData?.landlord?.firstName} {wizardData?.landlord?.lastName}
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Email</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>{wizardData?.landlord?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tenant
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Name</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>
                          {wizardData?.tenant?.firstName} {wizardData?.tenant?.lastName}
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Email</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>{wizardData?.tenant?.email}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Phone</label>
                        <p style={{ fontWeight: 500, color: '#1f2937' }}>{wizardData?.tenant?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Financial Terms
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Monthly Rent</label>
                        <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '18px' }}>
                          {formatMoney(wizardData?.rent?.monthlyRent)}
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#6b7280' }}>Security Deposit</label>
                        <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '18px' }}>
                          {formatMoney(wizardData?.rent?.securityDeposit)}
                        </p>
                      </div>
                      {wizardData?.rent?.petDeposit && wizardData.rent.petDeposit > 0 && (
                        <div>
                          <label style={{ fontSize: '13px', color: '#6b7280' }}>Pet Deposit</label>
                          <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '18px' }}>
                            {formatMoney(wizardData.rent.petDeposit)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  {/* Add Comment */}
                  <div style={{ marginBottom: '24px' }}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: newComment.trim() ? '#4f46e5' : '#d1d5db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No comments yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {comments.map(comment => (
                        <div key={comment.id} style={{
                          padding: '16px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#818cf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}>
                              {comment.author_name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 500, color: '#1f2937' }}>{comment.author_name}</span>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p style={{ color: '#374151', paddingLeft: '36px' }}>{comment.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === 'audit' && (
                <div>
                  {auditLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No audit logs available
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {auditLogs.map((log, index) => (
                        <div key={log.id} style={{ display: 'flex', gap: '16px' }}>
                          {/* Timeline dot */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: index === 0 ? '#4f46e5' : '#d1d5db',
                            }} />
                            {index < auditLogs.length - 1 && (
                              <div style={{ width: '2px', flex: 1, backgroundColor: '#e5e7eb' }} />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div style={{ flex: 1, paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 500, color: '#1f2937' }}>
                                {formatActionLabel(log.action)}
                              </span>
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                            {log.actor_name && (
                              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                                by {log.actor_name} ({log.actor_role})
                              </p>
                            )}
                            {log.ip_address && (
                              <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                                IP: {log.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Signature Status Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f3f4f6',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Signature Status
              </h3>
              
              {/* Landlord */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: document.landlord_signed ? '#f0fdf4' : '#f9fafb',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: document.landlord_signed ? '#10b981' : '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                }}>
                  {document.landlord_signed ? '✓' : '1'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>Landlord</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {wizardData?.landlord?.firstName} {wizardData?.landlord?.lastName}
                  </div>
                </div>
                {document.landlord_signed ? (
                  <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>Signed</span>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Pending</span>
                )}
              </div>

              {/* Tenant */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: document.tenant_signed ? '#f0fdf4' : '#f9fafb',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: document.tenant_signed ? '#10b981' : '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                }}>
                  {document.tenant_signed ? '✓' : '2'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>Tenant</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {wizardData?.tenant?.firstName} {wizardData?.tenant?.lastName}
                  </div>
                </div>
                {document.tenant_signed ? (
                  <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>Signed</span>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Pending</span>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f3f4f6',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Document Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Document ID</span>
                  <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: 500 }}>{document.id.slice(0, 8)}...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Created</span>
                  <span style={{ color: '#1f2937', fontSize: '13px' }}>{formatDate(document.created_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Last Updated</span>
                  <span style={{ color: '#1f2937', fontSize: '13px' }}>{formatDate(document.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Send for Signature</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              This will send an email to the tenant with a link to sign the lease. The signing link will be valid for 7 days.
            </p>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>Recipient</div>
              <div style={{ fontWeight: 500, color: '#1f2937' }}>
                {wizardData?.tenant?.firstName} {wizardData?.tenant?.lastName}
              </div>
              <div style={{ color: '#4f46e5' }}>{wizardData?.tenant?.email}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSendModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendForSignature}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Send for Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {showVoidModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#ef4444' }}>Void Document</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              This will void the document and cancel any pending signature requests. This action cannot be undone.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                Reason for voiding
              </label>
              <textarea
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="Enter reason..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '80px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowVoidModal(false); setVoidReason(''); }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVoidDocument}
                disabled={!voidReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: voidReason.trim() ? '#ef4444' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: voidReason.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Void Document
              </button>
            </div>
          </div>
        </div>
      )}
    </LeaseSignLayout>
  );
};

export default LeaseSignDetail;