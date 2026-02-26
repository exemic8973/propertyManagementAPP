import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestAccounts from './pages/TestAccounts';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/leases" element={<Leases />} />
          <Route path="/test-accounts" element={<TestAccounts />} />
          <Route path="/" element={<Navigate to="/test-accounts" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
