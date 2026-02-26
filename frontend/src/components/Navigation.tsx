import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  showDropdown?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ showDropdown = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <a className="navbar-brand" href="/dashboard">
          🏠 Property Manager
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
                href="/dashboard"
              >
                📊 Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/properties') ? 'active' : ''}`} 
                href="/properties"
              >
                🏠 Properties
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/tenants') ? 'active' : ''}`} 
                href="/tenants"
              >
                👥 Tenants
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/leases') ? 'active' : ''}`} 
                href="/leases"
              >
                📄 Leases
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/maintenance') ? 'active' : ''}`} 
                href="/maintenance"
              >
                🔧 Maintenance
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${isActive('/payments') ? 'active' : ''}`} 
                href="/payments"
              >
                💳 Payments
              </a>
            </li>
          </ul>
          
          {showDropdown && user && (
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle btn btn-link border-0 bg-transparent" 
                  type="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👤 {user.first_name} {user.last_name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      {user.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/dashboard">📊 Dashboard</a></li>
                  <li><a className="dropdown-item" href="/properties">🏠 Properties</a></li>
                  <li><a className="dropdown-item" href="/tenants">👥 Tenants</a></li>
                  <li><a className="dropdown-item" href="/leases">📄 Leases</a></li>
                  <li><a className="dropdown-item" href="/maintenance">🔧 Maintenance</a></li>
                  <li><a className="dropdown-item" href="/payments">💳 Payments</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger border-0 bg-transparent w-100 text-start" 
                      type="button"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
