import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

interface SignerInfo {
  signerType: 'landlord' | 'tenant';
  signerName: string;
  signerEmail: string;
}

interface LeaseData {
  id: string;
  lease_number: string;
  status: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  notes?: string;
  tenant_first_name: string;
  tenant_last_name: string;
  tenant_email: string;
  tenant_phone: string;
  landlord_first_name: string;
  landlord_last_name: string;
  landlord_email: string;
  property_name: string;
  property_address: string;
  property_city?: string;
  property_state?: string;
  property_zip?: string;
  unit_number?: string;
  unit_type?: string;
  tenant_signed?: boolean;
  tenant_signed_at?: string;
  landlord_signed?: boolean;
  landlord_signed_at?: string;
  wizard_data?: any;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SignLease: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [waitingForOther, setWaitingForOther] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [signerInfo, setSignerInfo] = useState<SignerInfo | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sign/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 410) {
            setExpired(true);
            setError(data.error);
          } else if (data.waitingForTenant || data.waitingForOther) {
            setWaitingForOther(true);
            setError(data.error || data.message);
          } else {
            setError(data.error || 'Failed to load lease');
          }
          setLoading(false);
          return;
        }
        
        setLease(data.document || data.lease);
        setSignerInfo({
          signerType: data.signerType,
          signerName: data.signerName,
          signerEmail: data.signerEmail || '',
        });
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        setError('Failed to load lease');
      }
    };

    if (token) {
      fetchLease();
    }
  }, [token]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 180;

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw signature line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();
    
    // Reset stroke style
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.5;
  }, [loading]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();
    
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.5;
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please agree to the terms before signing');
      return;
    }

    if (!hasSignature) {
      setError('Please provide your signature');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to submit signature');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError('Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading document...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Expired State
  if (expired) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏰</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Link Expired</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>Please contact the sender to get a new signing link.</p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#4f46e5',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Waiting for Other Party
  if (waitingForOther) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Waiting for Signature</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            You will receive an email notification once the other party has signed.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#4f46e5',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px',
          }}>✓</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Signature Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {lease?.status === 'active' || lease?.landlord_signed 
              ? 'The lease has been fully signed. You will receive a signed copy via email shortly.'
              : 'Your signature has been recorded. The other party will be notified to sign.'}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            Document ID: {lease?.lease_number}
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Done
          </a>
        </div>
      </div>
    );
  }

  // Error State
  if (!lease || !signerInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Document Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error || 'The requested document could not be found.'}</p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#4f46e5',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const wizardData = lease.wizard_data;
  const propertyAddress = wizardData?.property?.address || lease.property_address;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation */}
      <header style={{
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>📝</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', fontFamily: '"DM Sans", sans-serif' }}>
            LeaseSign
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '6px 12px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
          }}>
            {signerInfo.signerType === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}
          </span>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Header Card */}
        <div style={{
          backgroundColor: '#4f46e5',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
                Sign Lease Agreement
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                {lease.lease_number}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Signing as: <strong>{signerInfo.signerName}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px' }}>📄</div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 500, color: '#92400e', marginBottom: '4px' }}>Please Review Carefully</div>
            <div style={{ color: '#a16207', fontSize: '14px' }}>
              Review the lease details below, then sign at the bottom. Your electronic signature is legally binding.
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991b1b',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Document Preview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setPreviewCollapsed(!previewCollapsed)}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#f9fafb',
              border: 'none',
              borderBottom: previewCollapsed ? 'none' : '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📄 Lease Summary
            </span>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: previewCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
            >
              <path d="M6 9l4 4 4-4" />
            </svg>
          </button>

          {!previewCollapsed && (
            <div style={{ padding: '24px' }}>
              {/* Property & Lease Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Property
                  </h3>
                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: 500, marginBottom: '4px' }}>{propertyAddress}</p>
                  {wizardData?.property?.city && (
                    <p style={{ color: '#6b7280' }}>{wizardData.property.city}, {wizardData.property.state} {wizardData.property.zip}</p>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lease Term
                  </h3>
                  <p style={{ fontSize: '16px', color: '#1f2937' }}>
                    {formatDate(lease.start_date)} – {formatDate(lease.end_date)}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Terms
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Monthly Rent</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>{formatCurrency(lease.monthly_rent)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Security Deposit</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>{formatCurrency(lease.security_deposit)}</div>
                  </div>
                  {wizardData?.rent?.petDeposit > 0 && (
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Pet Deposit</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>{formatCurrency(wizardData.rent.petDeposit)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>🏠</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>Landlord</span>
                    {lease.landlord_signed && (
                      <span style={{
                        marginLeft: 'auto',
                        padding: '2px 8px',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>Signed ✓</span>
                    )}
                  </div>
                  <p style={{ color: '#1f2937', fontWeight: 500 }}>{lease.landlord_first_name} {lease.landlord_last_name}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{lease.landlord_email}</p>
                </div>

                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>👤</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>Tenant</span>
                    {lease.tenant_signed && (
                      <span style={{
                        marginLeft: 'auto',
                        padding: '2px 8px',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>Signed ✓</span>
                    )}
                  </div>
                  <p style={{ color: '#1f2937', fontWeight: 500 }}>{lease.tenant_first_name} {lease.tenant_last_name}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{lease.tenant_email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>✍️ Your Signature</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Sign in the box below using your mouse or touch screen
            </p>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Signer Info Box */}
            <div style={{
              backgroundColor: '#eef2ff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '20px',
              }}>
                {signerInfo.signerName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{signerInfo.signerName}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{signerInfo.signerEmail}</div>
                <div style={{ color: '#4f46e5', fontSize: '13px', marginTop: '2px' }}>
                  Signing as {signerInfo.signerType === 'landlord' ? 'Landlord' : 'Tenant'}
                </div>
              </div>
            </div>

            {/* Signature Canvas */}
            <div style={{
              border: '2px dashed #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '12px',
              touchAction: 'none',
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  cursor: 'crosshair',
                  display: 'block',
                  backgroundColor: '#fafafa',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <button
              onClick={clearSignature}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
              Clear Signature
            </button>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: '#4f46e5',
              }}
            />
            <span style={{ color: '#374151', fontSize: '14px', lineHeight: 1.5 }}>
              I agree to the terms of this lease agreement and confirm that my electronic signature 
              is as legally binding as a handwritten signature under the ESIGN Act and UETA.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: agreed ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: agreed && !submitting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
          }}
        >
          {submitting ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Submitting Signature...
            </>
          ) : (
            <>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              Sign & Submit
            </>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Legal Notice */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', maxWidth: '600px', margin: '0 auto' }}>
            By signing this document electronically, you acknowledge that you have read, understood, 
            and agree to be bound by all terms and conditions of this lease agreement. This electronic 
            signature will have the same legal effect as a handwritten signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignLease;