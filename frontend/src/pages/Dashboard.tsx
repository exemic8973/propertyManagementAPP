import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddProperty = () => {
    navigate('/properties');
  };

  const handleAddTenant = () => {
    navigate('/tenants');
  };

  const handleCreateLease = () => {
    navigate('/leases');
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

  if (!user) {
    return null; // Will redirect
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
                <a className="nav-link dropdown-toggle" href="/dashboard" role="button" data-bs-toggle="dropdown">
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

      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-1">Property Management</h1>
              <p className="mb-0 opacity-75">Welcome back, {user.first_name}!</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-white text-dark">
                Role: <span className="fw-normal capitalize">{user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4">
        {/* Dashboard Stats */}
        <div className="row g-4 mb-5">
          {/* Properties Card */}
          <div className="col-md-6 col-lg-3">
            <div className="card stat-card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 bg-primary-custom text-white rounded p-3 me-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Properties</h6>
                    <h3 className="h4 mb-0">0</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tenants Card */}
          <div className="col-md-6 col-lg-3">
            <div className="card stat-card success h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 bg-success text-white rounded p-3 me-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Tenants</h6>
                    <h3 className="h4 mb-0">0</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Leases Card */}
          <div className="col-md-6 col-lg-3">
            <div className="card stat-card warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 bg-warning text-white rounded p-3 me-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Active Leases</h6>
                    <h3 className="h4 mb-0">0</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="col-md-6 col-lg-3">
            <div className="card stat-card danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 bg-danger text-white rounded p-3 me-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Maintenance</h6>
                    <h3 className="h4 mb-0">0</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <button className="btn btn-primary w-100" onClick={handleAddProperty}>
                  Add Property
                </button>
              </div>
              <div className="col-md-4">
                <button className="btn btn-secondary w-100" onClick={handleAddTenant}>
                  Add Tenant
                </button>
              </div>
              <div className="col-md-4">
                <button className="btn btn-success w-100" onClick={handleCreateLease}>
                  Create Lease
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Recent Activity</h5>
          </div>
          <div className="card-body">
            <div className="text-center text-muted py-5">
              <p className="mb-0">No recent activity. Start by adding your first property!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
