import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/Notification';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const Tenants = lazy(() => import('./pages/Tenants'));
const Leases = lazy(() => import('./pages/Leases'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Payments = lazy(() => import('./pages/Payments'));
const TestAccounts = lazy(() => import('./pages/TestAccounts'));
const SignLease = lazy(() => import('./pages/SignLease'));
const LeaseSignPage = lazy(() => import('./pages/LeaseSignPage'));
const LeaseSignList = lazy(() => import('./pages/LeaseSignList'));
const LeaseSignDetail = lazy(() => import('./pages/LeaseSignDetail'));
// New pages
const Notifications = lazy(() => import('./pages/Notifications'));
const Reports = lazy(() => import('./pages/Reports'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <Loading fullScreen text="Loading page..." />
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/test-accounts" element={<TestAccounts />} />
                <Route path="/sign/:token" element={<SignLease />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/properties" 
                  element={
                    <PrivateRoute>
                      <Properties />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/tenants" 
                  element={
                    <PrivateRoute>
                      <Tenants />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/leases" 
                  element={
                    <PrivateRoute>
                      <Leases />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/maintenance" 
                  element={
                    <PrivateRoute>
                      <Maintenance />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/payments" 
                  element={
                    <PrivateRoute>
                      <Payments />
                    </PrivateRoute>
                  } 
                />
                
                {/* New Feature Routes */}
                <Route 
                  path="/notifications" 
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  } 
                />
                
                {/* LeaseSign Routes */}
                <Route 
                  path="/lease-sign/new" 
                  element={
                    <PrivateRoute>
                      <LeaseSignPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/lease-sign/documents" 
                  element={
                    <PrivateRoute>
                      <LeaseSignList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/lease-sign/documents/:id" 
                  element={
                    <PrivateRoute>
                      <LeaseSignDetail />
                    </PrivateRoute>
                  } 
                />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;