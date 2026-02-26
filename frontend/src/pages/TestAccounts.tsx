import React, { useState, useEffect } from 'react';

interface TestUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
}

const TestAccounts: React.FC = () => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestAccounts();
  }, []);

  const fetchTestAccounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test/create-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch test accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (email: string, password: string) => {
    const text = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
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

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0">🧪 Test Accounts</h2>
              </div>
              <div className="card-body">
                <div className="alert alert-info" role="alert">
                  <strong>📋 Instructions:</strong> Use any of these accounts to test the Property Management application.
                  Click the "Copy Credentials" button to quickly copy login details.
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`badge bg-${user.role === 'landlord' ? 'primary' : user.role === 'property_manager' ? 'info' : user.role === 'tenant' ? 'success' : 'secondary'}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>{user.first_name} {user.last_name}</td>
                          <td>
                            <code className="bg-light p-1 rounded">{user.email}</code>
                          </td>
                          <td>
                            <code className="bg-light p-1 rounded">password123</code>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => copyToClipboard(user.email, 'password123')}
                            >
                              📋 Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <h5>🎭 Role-Based Access</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-primary">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">👑 Landlord</h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>Full access to all properties</li>
                            <li>Manage all tenants and leases</li>
                            <li>View financial reports</li>
                            <li>Approve maintenance requests</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">🏢 Property Manager</h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>Manage assigned properties</li>
                            <li>Handle tenant communications</li>
                            <li>Process maintenance requests</li>
                            <li>Generate property reports</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="card border-success">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">👤 Tenant</h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>View personal dashboard</li>
                            <li>See lease details</li>
                            <li>Make rent payments</li>
                            <li>Submit maintenance requests</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-secondary">
                        <div className="card-header bg-secondary text-white">
                          <h6 className="mb-0">🏠 Agent</h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>Show properties</li>
                            <li>Schedule viewings</li>
                            <li>Manage leads</li>
                            <li>Update property availability</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <a href="/login" className="btn btn-primary btn-lg me-2">
                    🚀 Go to Login
                  </a>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Refresh Accounts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAccounts;
