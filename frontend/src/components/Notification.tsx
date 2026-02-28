import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Notification Types
interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (message: string, type: NotificationItem['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use notifications
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationItem['type'] = 'info', duration = 5000) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const notification: NotificationItem = { id, message, type, duration };

      setNotifications(prev => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Container Component for rendering notifications
interface NotificationContainerProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="position-fixed"
      style={{
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        width: '100%',
      }}
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast Component
interface NotificationToastProps {
  notification: NotificationItem;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const bgClass = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
  }[notification.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[notification.type];

  return (
    <div
      className={`alert ${bgClass} text-white alert-dismissible fade show mb-2`}
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex align-items-center">
        <span className="me-2" aria-hidden="true">{icon}</span>
        <span className="flex-grow-1">{notification.message}</span>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close notification"
        />
      </div>
    </div>
  );
};

export default NotificationProvider;
