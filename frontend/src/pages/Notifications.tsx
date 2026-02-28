import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useNotification } from '../components/Notification';
import { leaseSignApi, Notification as NotificationType } from '../services/api';

// Date utility function
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { showNotification } = useNotification();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const response = await leaseSignApi.getNotifications();
    if (response.data) {
      setNotifications(response.data.notifications);
    } else {
      showNotification('Failed to load notifications', 'error');
    }
    setLoading(false);
  }, [showNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const response = await leaseSignApi.markNotificationRead(notificationId);
    if (response.data) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    await Promise.all(
      unreadNotifications.map(n => leaseSignApi.markNotificationRead(n.id))
    );
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showNotification('All notifications marked as read', 'success');
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_signed': return '✍️';
      case 'document_sent': return '📧';
      case 'document_created': return '📄';
      case 'document_voided': return '❌';
      case 'comment_added': return '💬';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading notifications..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Notifications</h1>
            <p className="text-muted mb-0">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="d-flex gap-2">
            <div className="btn-group" role="group" aria-label="Filter notifications">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('unread')}
              >
                Unread {unreadCount > 0 && <span className="badge bg-secondary">{unreadCount}</span>}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-outline-secondary"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {filteredNotifications.length === 0 ? (
              <EmptyState
                icon={filter === 'unread' ? '📭' : '🔔'}
                title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                description="You're all caught up!"
              />
            ) : (
              <div className="list-group list-group-flush">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`list-group-item list-group-item-action ${
                      !notification.is_read ? 'bg-light' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    style={{ cursor: notification.is_read ? 'default' : 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0 me-3" style={{ fontSize: '1.5rem' }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="badge bg-primary ms-2">New</span>
                            )}
                          </h6>
                          <small className="text-muted">
                            {formatDistanceToNow(new Date(notification.created_at))}
                          </small>
                        </div>
                        {notification.message && (
                          <p className="mb-1 text-muted small">{notification.message}</p>
                        )}
                        {notification.document_id && (
                          <a
                            href={`/lease-sign/documents/${notification.document_id}`}
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
