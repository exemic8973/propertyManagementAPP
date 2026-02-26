import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Maintenance from './pages/Maintenance';
import Payments from './pages/Payments';
import TestAccounts from './pages/TestAccounts';
import SignLease from './pages/SignLease';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
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
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
