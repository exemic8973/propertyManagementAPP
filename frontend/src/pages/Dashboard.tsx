import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification';
import Navigation from '../components/Navigation';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { propertiesApi, tenantsApi, leasesApi, maintenanceApi, Lease, MaintenanceRequest, Property } from '../services/api';

interface DashboardStats {
  properties: number;
  tenants: number;
  activeLeases: number;
  maintenanceOpen: number;
  totalRentCollected: number;
  occupancyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'lease' | 'maintenance' | 'tenant' | 'payment';
  message: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    tenants: 0,
    activeLeases: 0,
    maintenanceOpen: 0,
    totalRentCollected: 0,
    occupancyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch all data in parallel
      const [propertiesRes, tenantsRes, leasesRes, maintenanceRes] = await Promise.all([
        propertiesApi.getAll(),
        tenantsApi.getAll(),
        leasesApi.getAll({ status: 'active' }),
        maintenanceApi.getAll({ status: 'open' })
      ]);

      // Calculate from individual responses
      const properties = propertiesRes.data?.properties || [];
      const tenants = tenantsRes.data?.tenants || [];
      const activeLeases = leasesRes.data?.leases || [];
      const openMaintenance = maintenanceRes.data?.requests || [];
      
      const occupiedProperties = properties.filter((p: Property) => 
        (p as Property & { status?: string }).status === 'occupied'
      ).length;
      const totalProperties = properties.length;
      
      setStats({
        properties: totalProperties,
        tenants: tenants.length,
        activeLeases: activeLeases.length,
        maintenanceOpen: openMaintenance.length,
        totalRentCollected: activeLeases.reduce((sum: number, l: Lease) => sum + (l.monthly_rent || 0), 0),
        occupancyRate: totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0
      });

      // Build recent activity
      const activities: RecentActivity[] = [];
      
      activeLeases.slice(0, 3).forEach((lease: Lease) => {
        activities.push({
          id: lease.id,
          type: 'lease',
          message: `Lease created for ${lease.tenant?.first_name || 'Unknown'} ${lease.tenant?.last_name || ''}`,
          date: lease.created_at
        });
      });

      openMaintenance.slice(0, 3).forEach((req: MaintenanceRequest) => {
        activities.push({
          id: req.id,
          type: 'maintenance',
          message: `Maintenance request: ${req.title}`,
          date: req.created_at
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch {
      showNotification('Failed to load dashboard data', 'error');
    }

    setLoading(false);
  }, [showNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-1">Property Management</h1>
              <p className="mb-0 opacity-75">Welcome back, {user?.first_name}!</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-white text-dark">
                Role: <span className="fw-normal text-capitalize">{user?.role?.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="visually-hidden-focusable">
          Skip to main content
        </a>
        
        <div id="main-content">
          {/* Dashboard Stats */}
          <div className="row g-4 mb-5">
            {/* Properties Card */}
            <div className="col-md-6 col-lg-3">
              <div className="card stat-card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 bg-primary-custom text-white rounded p-3 me-3">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-muted mb-1">Properties</h6>
                      <h3 className="h4 mb-0">{stats.properties}</h3>
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
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-muted mb-1">Tenants</h6>
                      <h3 className="h4 mb-0">{stats.tenants}</h3>
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
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-muted mb-1">Active Leases</h6>
                      <h3 className="h4 mb-0">{stats.activeLeases}</h3>
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
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-muted mb-1">Open Requests</h6>
                      <h3 className="h4 mb-0">{stats.maintenanceOpen}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Monthly Rent Revenue</h5>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <h2 className="display-6 fw-bold text-success">
                    {formatCurrency(stats.totalRentCollected)}
                  </h2>
                  <p className="text-muted mb-0">From {stats.activeLeases} active leases</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Occupancy Rate</h5>
                    <span className={`badge ${stats.occupancyRate >= 80 ? 'bg-success' : stats.occupancyRate >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                      {stats.occupancyRate}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className={`progress-bar ${stats.occupancyRate >= 80 ? 'bg-success' : stats.occupancyRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                      role="progressbar" 
                      style={{ width: `${stats.occupancyRate}%` }}
                      aria-valuenow={stats.occupancyRate} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <p className="text-muted mt-2 mb-0">
                    {stats.occupancyRate}% of properties are occupied
                  </p>
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
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => navigate('/properties')}
                  >
                    Add Property
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-secondary w-100"
                    onClick={() => navigate('/tenants')}
                  >
                    Add Tenant
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => navigate('/leases')}
                  >
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
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No recent activity"
                  description="Start by adding your first property!"
                  action={{
                    label: 'Add Property',
                    onClick: () => navigate('/properties')
                  }}
                />
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge me-2 ${
                          activity.type === 'lease' ? 'bg-primary' : 
                          activity.type === 'maintenance' ? 'bg-warning' : 'bg-info'
                        }`}>
                          {activity.type}
                        </span>
                        {activity.message}
                      </div>
                      <small className="text-muted">
                        {new Date(activity.date).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
