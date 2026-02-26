import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';

interface SignerInfo {
  signerType: 'landlord' | 'tenant';
  signerName: string;
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
}

// API base URL for public signing endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SignLease: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [waitingForTenant, setWaitingForTenant] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [signerInfo, setSignerInfo] = useState<SignerInfo | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Load lease data
  useEffect(() => {
    const fetchLease = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/leases/sign/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 410) {
            setExpired(true);
            setError(data.error);
          } else if (data.waitingForTenant) {
            setWaitingForTenant(true);
            setError(data.error);
          } else {
            setError(data.error || 'Failed to load lease');
          }
          setLoading(false);
          return;
        }
        
        setLease(data.lease);
        setSignerInfo({
          signerType: data.signerType,
          signerName: data.signerName
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

  // Canvas drawing setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with light background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Convert canvas to base64
    const signatureData = canvas.toDataURL('image/png');

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/leases/sign/${token}`, {
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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (expired) {
    return (
      <Container className="py-5">
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <div className="text-warning mb-3">
              <i className="bi bi-clock" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3>Link Expired</h3>
            <p className="text-muted">{error}</p>
            <Button variant="primary" href="/login">Go to Login</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (waitingForTenant) {
    return (
      <Container className="py-5">
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <div className="text-info mb-3">
              <i className="bi bi-hourglass-split" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3>Waiting for Tenant Signature</h3>
            <p className="text-muted">{error}</p>
            <p className="text-muted">You will receive an email once the tenant has signed.</p>
            <Button variant="primary" href="/login">Go to Login</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-5">
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <div className="text-success mb-3">
              <i className="bi bi-check-circle" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3>Signature Submitted Successfully!</h3>
            <p className="text-muted">
              {lease?.status === 'active' 
                ? 'The lease has been fully signed and is now active. You will receive a copy via email.'
                : 'Your signature has been recorded. The other party will be notified to sign.'}
            </p>
            <Button variant="primary" href="/login">Go to Login</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!lease || !signerInfo) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Lease not found'}</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" href="/login">Go to Login</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Electronic Lease Signing</h2>
        <p className="text-muted">
          Signing as: <strong>{signerInfo.signerName}</strong> ({signerInfo.signerType})
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Lease Summary Card */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Lease Agreement Summary</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Lease Number:</strong> {lease.lease_number}</p>
              <p><strong>Property:</strong> {lease.property_name}</p>
              <p><strong>Address:</strong> {lease.property_address}
                {lease.property_city && `, ${lease.property_city}`}
                {lease.property_state && `, ${lease.property_state}`}
                {lease.property_zip && ` ${lease.property_zip}`}
              </p>
              {lease.unit_number && (
                <p><strong>Unit:</strong> {lease.unit_number} {lease.unit_type && `(${lease.unit_type})`}</p>
              )}
            </Col>
            <Col md={6}>
              <p><strong>Lease Term:</strong></p>
              <ul>
                <li>Start Date: {formatDate(lease.start_date)}</li>
                <li>End Date: {formatDate(lease.end_date)}</li>
              </ul>
              <p><strong>Monthly Rent:</strong> {formatCurrency(lease.monthly_rent)}</p>
              <p><strong>Security Deposit:</strong> {formatCurrency(lease.security_deposit)}</p>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <h6>Landlord</h6>
              <p className="mb-0">{lease.landlord_first_name} {lease.landlord_last_name}</p>
              <small className="text-muted">{lease.landlord_email}</small>
              {lease.landlord_signed && (
                <div className="mt-2">
                  <Badge bg="success">Signed {lease.landlord_signed_at && formatDate(lease.landlord_signed_at)}</Badge>
                </div>
              )}
            </Col>
            <Col md={6}>
              <h6>Tenant</h6>
              <p className="mb-0">{lease.tenant_first_name} {lease.tenant_last_name}</p>
              <small className="text-muted">{lease.tenant_email}</small>
              {lease.tenant_signed && (
                <div className="mt-2">
                  <Badge bg="success">Signed {lease.tenant_signed_at && formatDate(lease.tenant_signed_at)}</Badge>
                </div>
              )}
            </Col>
          </Row>

          {lease.notes && (
            <>
              <hr />
              <p><strong>Additional Notes:</strong> {lease.notes}</p>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Signature Pad */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Your Signature</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Please sign in the box below using your mouse or touch screen.
          </p>
          
          <div 
            className="border rounded mb-3" 
            style={{ touchAction: 'none' }}
          >
            <canvas
              ref={canvasRef}
              className="w-100"
              style={{ cursor: 'crosshair' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <Button variant="outline-secondary" size="sm" onClick={clearSignature}>
            Clear Signature
          </Button>
        </Card.Body>
      </Card>

      {/* Agreement */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form.Check
            type="checkbox"
            id="agree-terms"
            label={
              <span>
                I agree to the terms of this lease agreement and confirm that my electronic signature 
                is as legally binding as a handwritten signature.
              </span>
            }
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
        </Card.Body>
      </Card>

      {/* Submit Button */}
      <div className="d-grid gap-2">
        <Button
          variant="success"
          size="lg"
          onClick={handleSubmit}
          disabled={!agreed || submitting}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting Signature...
            </>
          ) : (
            'Sign & Submit'
          )}
        </Button>
      </div>

      <div className="text-center mt-4">
        <small className="text-muted">
          By signing this document electronically, you acknowledge that you have read, 
          understood, and agree to be bound by all terms and conditions of this lease agreement.
        </small>
      </div>
    </Container>
  );
};

export default SignLease;
