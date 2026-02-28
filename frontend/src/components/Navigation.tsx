import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  showDropdown?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ showDropdown = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsNavCollapsed(true);
  };

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <button
          className="navbar-brand btn btn-link border-0 bg-transparent p-0"
          onClick={() => handleNavClick('/dashboard')}
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label="Go to dashboard"
        >
          🏠 Property Manager
        </button>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => handleNavClick('/dashboard')}
              >
                📊 Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/properties') ? 'active' : ''}`}
                onClick={() => handleNavClick('/properties')}
              >
                🏠 Properties
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/tenants') ? 'active' : ''}`}
                onClick={() => handleNavClick('/tenants')}
              >
                👥 Tenants
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/leases') ? 'active' : ''}`}
                onClick={() => handleNavClick('/leases')}
              >
                📄 Leases
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isSectionActive('/lease-sign') ? 'active' : ''}`}
                onClick={() => handleNavClick('/lease-sign/documents')}
              >
                ✍️ E-Sign
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/maintenance') ? 'active' : ''}`}
                onClick={() => handleNavClick('/maintenance')}
              >
                🔧 Maintenance
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/payments') ? 'active' : ''}`}
                onClick={() => handleNavClick('/payments')}
              >
                💳 Payments
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link border-0 bg-transparent ${isActive('/reports') ? 'active' : ''}`}
                onClick={() => handleNavClick('/reports')}
              >
                📈 Reports
              </button>
            </li>
          </ul>

          {showDropdown && user && (
            <ul className="navbar-nav">
              {/* Notifications Icon */}
              <li className="nav-item me-2">
                <button
                  className="nav-link btn btn-link border-0 bg-transparent position-relative"
                  onClick={() => handleNavClick('/notifications')}
                  aria-label="View notifications"
                >
                  🔔
                </button>
              </li>
              
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link border-0 bg-transparent"
                  type="button"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  👤 {user.first_name} {user.last_name}
                </button>
                {isDropdownOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show" role="menu">
                    <li>
                      <span className="dropdown-item-text text-muted small">
                        {user.email}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/dashboard');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        📊 Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/properties');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        🏠 Properties
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/tenants');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        👥 Tenants
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/leases');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        📄 Leases
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/lease-sign/documents');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        ✍️ E-Sign Documents
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/maintenance');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        🔧 Maintenance
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/payments');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        💳 Payments
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/reports');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        📈 Reports
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleNavClick('/notifications');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        🔔 Notifications
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        🚪 Logout
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;