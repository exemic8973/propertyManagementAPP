import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { Notification } from '../services/api';

interface LeaseSignLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const LeaseSignLayout: React.FC<LeaseSignLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const result = await api.leaseSign.getNotifications();
    if (result.data) {
      setNotifications(result.data.notifications);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const menuItems = [
    { path: '/lease-sign/documents', icon: '📊', label: 'Dashboard', badge: null },
    { path: '/lease-sign/documents?view=all', icon: '📄', label: 'All Documents', badge: null },
    { path: '/lease-sign/templates', icon: '📋', label: 'Templates', badge: null },
  ];

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const markNotificationRead = async (notificationId: string) => {
    await api.leaseSign.markNotificationRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#4f46e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        {/* Left: Logo & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'white', fontFamily: '"DM Sans", sans-serif' }}>
              LeaseSign
            </span>
          </a>
        </div>

        {/* Right: Notifications & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '6px',
                position: 'relative',
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2zM9 21h6M12 3v2" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '360px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{unreadCount} unread</span>
                  )}
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          markNotificationRead(notification.id);
                          if (notification.document_id) {
                            navigate(`/lease-sign/documents/${notification.document_id}`);
                          }
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          backgroundColor: notification.is_read ? 'transparent' : '#f0f9ff',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>
                            {notification.type === 'sent' ? '📤' : 
                             notification.type === 'signed' ? '✍️' : 
                             notification.type === 'completed' ? '✅' : '📄'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '14px', color: '#1f2937' }}>
                              {notification.title}
                            </div>
                            {notification.message && (
                              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                {notification.message}
                              </div>
                            )}
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                              {new Date(notification.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
              }}>
                {user?.first_name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontWeight: 500 }}>{user?.first_name}</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '220px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{user?.email}</div>
                </div>
                <div style={{ padding: '8px' }}>
                  <a
                    href="/dashboard"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    🏠 Main Dashboard
                  </a>
                  <a
                    href="/lease-sign/documents"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    📄 All Documents
                  </a>
                </div>
                <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      color: '#ef4444',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        bottom: 0,
        width: sidebarOpen ? '260px' : '0',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s',
        overflow: 'hidden',
        zIndex: 40,
      }}>
        <div style={{ padding: '20px 16px' }}>
          {/* New Document Button */}
          <button
            onClick={() => navigate('/lease-sign/new')}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Document
          </button>

          {/* Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: isActive(item.path) ? '#eef2ff' : 'transparent',
                  color: isActive(item.path) ? '#4f46e5' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive(item.path) ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen ? '260px' : '0',
        marginTop: '64px',
        minHeight: 'calc(100vh - 64px)',
        transition: 'margin-left 0.3s',
      }}>
        {children}
      </main>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
};

export default LeaseSignLayout;
