import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import Loading from '../components/Loading';
import { useNotification } from '../components/Notification';
import { propertiesApi, tenantsApi, leasesApi, maintenanceApi, paymentsApi, Property, Lease, MaintenanceRequest, Payment } from '../services/api';

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const exportToCsv = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void => {
  if (data.length === 0) return;

  const headers = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  }));

  const csvRows: string[] = [];
  csvRows.push(headers.map(h => `"${h.header}"`).join(','));
  
  data.forEach(item => {
    const values = headers.map(h => {
      const value = item[h.key];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface ReportStats {
  properties: {
    total: number;
    byType: Record<string, number>;
    occupancyRate: number;
  };
  tenants: {
    total: number;
    withActiveLeases: number;
  };
  leases: {
    total: number;
    active: number;
    expiringSoon: number;
    monthlyRevenue: number;
  };
  maintenance: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    totalCost: number;
  };
  payments: {
    total: number;
    collected: number;
    pending: number;
    overdue: number;
  };
}

type ReportType = 'overview' | 'properties' | 'leases' | 'maintenance' | 'payments';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { showNotification } = useNotification();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propsRes, tenantsRes, leasesRes, maintRes, payRes] = await Promise.all([
        propertiesApi.getAll(),
        tenantsApi.getAll(),
        leasesApi.getAll(),
        maintenanceApi.getAll(),
        paymentsApi.getAll(),
      ]);

      const props = propsRes.data?.properties || [];
      const tenants = tenantsRes.data?.tenants || [];
      const leaseData = leasesRes.data?.leases || [];
      const maintData = maintRes.data?.requests || [];
      const payData = payRes.data?.payments || [];

      setProperties(props);
      setLeases(leaseData);
      setMaintenance(maintData);
      setPayments(payData);

      // Calculate stats
      const activeLeases = leaseData.filter((l: Lease) => l.status === 'active');
      const expiringSoon = activeLeases.filter((l: Lease) => {
        const endDate = new Date(l.end_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return endDate <= thirtyDaysFromNow;
      });

      const propsByType: Record<string, number> = {};
      props.forEach((p: Property) => {
        propsByType[p.property_type] = (propsByType[p.property_type] || 0) + 1;
      });

      setStats({
        properties: {
          total: props.length,
          byType: propsByType,
          occupancyRate: props.length > 0 
            ? Math.round((activeLeases.length / props.length) * 100) 
            : 0,
        },
        tenants: {
          total: tenants.length,
          withActiveLeases: activeLeases.length,
        },
        leases: {
          total: leaseData.length,
          active: activeLeases.length,
          expiringSoon: expiringSoon.length,
          monthlyRevenue: activeLeases.reduce((sum: number, l: Lease) => sum + (l.monthly_rent || 0), 0),
        },
        maintenance: {
          total: maintData.length,
          open: maintData.filter((m: MaintenanceRequest) => m.status === 'open' || m.status === 'pending').length,
          inProgress: maintData.filter((m: MaintenanceRequest) => m.status === 'in_progress').length,
          completed: maintData.filter((m: MaintenanceRequest) => m.status === 'completed').length,
          totalCost: maintData.reduce((sum: number, m: MaintenanceRequest) => sum + (m.actual_cost || m.estimated_cost || 0), 0),
        },
        payments: {
          total: payData.length,
          collected: payData.filter((p: Payment) => p.payment_status === 'completed').reduce((sum: number, p: Payment) => sum + p.amount, 0),
          pending: payData.filter((p: Payment) => p.payment_status === 'pending').reduce((sum: number, p: Payment) => sum + p.amount, 0),
          overdue: payData.filter((p: Payment) => p.payment_status === 'overdue').reduce((sum: number, p: Payment) => sum + p.amount, 0),
        },
      });
    } catch {
      showNotification('Failed to load report data', 'error');
    }
    setLoading(false);
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dateRange]);

  const handleExport = (type: 'properties' | 'leases' | 'maintenance' | 'payments') => {
    let data: Record<string, unknown>[] = [];
    let filename = '';
    let columns: { key: string; header: string }[] = [];

    switch (type) {
      case 'properties':
        data = properties.map(p => ({
          name: p.name,
          address: p.address,
          city: p.city,
          property_type: p.property_type,
          total_units: p.total_units,
          square_footage: p.square_footage,
        }));
        filename = 'properties_report';
        columns = [
          { key: 'name', header: 'Name' },
          { key: 'address', header: 'Address' },
          { key: 'city', header: 'City' },
          { key: 'property_type', header: 'Type' },
          { key: 'total_units', header: 'Units' },
          { key: 'square_footage', header: 'Sq Ft' },
        ];
        break;
      case 'leases':
        data = leases.map(l => ({
          lease_number: l.lease_number,
          tenant: `${l.tenant?.first_name} ${l.tenant?.last_name}`,
          property: l.property?.name,
          start_date: l.start_date,
          end_date: l.end_date,
          monthly_rent: l.monthly_rent,
          status: l.status,
        }));
        filename = 'leases_report';
        columns = [
          { key: 'lease_number', header: 'Lease #' },
          { key: 'tenant', header: 'Tenant' },
          { key: 'property', header: 'Property' },
          { key: 'start_date', header: 'Start Date' },
          { key: 'end_date', header: 'End Date' },
          { key: 'monthly_rent', header: 'Monthly Rent' },
          { key: 'status', header: 'Status' },
        ];
        break;
      case 'maintenance':
        data = maintenance.map(m => ({
          title: m.title,
          property: m.property?.name,
          category: m.category,
          priority: m.priority,
          status: m.status,
          estimated_cost: m.estimated_cost,
          actual_cost: m.actual_cost,
          created_at: m.created_at,
        }));
        filename = 'maintenance_report';
        columns = [
          { key: 'title', header: 'Title' },
          { key: 'property', header: 'Property' },
          { key: 'category', header: 'Category' },
          { key: 'priority', header: 'Priority' },
          { key: 'status', header: 'Status' },
          { key: 'estimated_cost', header: 'Est. Cost' },
          { key: 'actual_cost', header: 'Actual Cost' },
          { key: 'created_at', header: 'Created' },
        ];
        break;
      case 'payments':
        data = payments.map(p => ({
          date: p.payment_date,
          tenant: `${p.tenant?.first_name} ${p.tenant?.last_name}`,
          property: p.property?.name,
          amount: p.amount,
          method: p.payment_method,
          status: p.payment_status,
        }));
        filename = 'payments_report';
        columns = [
          { key: 'date', header: 'Date' },
          { key: 'tenant', header: 'Tenant' },
          { key: 'property', header: 'Property' },
          { key: 'amount', header: 'Amount' },
          { key: 'method', header: 'Method' },
          { key: 'status', header: 'Status' },
        ];
        break;
    }

    exportToCsv(data, filename, columns as { key: keyof typeof data[0]; header: string }[]);
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`, 'success');
  };

  if (loading || !stats) {
    return <Loading fullScreen text="Generating reports..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Reports & Analytics</h1>
            <p className="text-muted mb-0">View and export property management data</p>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              aria-label="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Report Type Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          {(['overview', 'properties', 'leases', 'maintenance', 'payments'] as ReportType[]).map((type) => (
            <li className="nav-item" key={type}>
              <button
                className={`nav-link ${activeReport === type ? 'active' : ''}`}
                onClick={() => setActiveReport(type)}
                role="tab"
                aria-selected={activeReport === type}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {/* Overview Report */}
        {activeReport === 'overview' && (
          <div className="row g-4">
            {/* Key Metrics */}
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-primary">{stats.properties.total}</div>
                  <div className="text-muted">Total Properties</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-success">{formatCurrency(stats.leases.monthlyRevenue)}</div>
                  <div className="text-muted">Monthly Revenue</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-warning">{stats.leases.expiringSoon}</div>
                  <div className="text-muted">Leases Expiring Soon</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-danger">{stats.maintenance.open}</div>
                  <div className="text-muted">Open Maintenance</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Properties Overview</h5>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleExport('properties')}
                  >
                    Export CSV
                  </button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Occupancy Rate</span>
                      <span className="fw-bold">{stats.properties.occupancyRate}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${stats.properties.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                  <h6 className="text-muted">By Type</h6>
                  <ul className="list-group list-group-flush">
                    {Object.entries(stats.properties.byType).map(([type, count]) => (
                      <li key={type} className="list-group-item d-flex justify-content-between">
                        <span>{type}</span>
                        <span className="badge bg-secondary">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Financial Summary</h5>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleExport('payments')}
                  >
                    Export CSV
                  </button>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="h4 text-success mb-0">{formatCurrency(stats.payments.collected)}</div>
                        <small className="text-muted">Collected</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="h4 text-warning mb-0">{formatCurrency(stats.payments.pending)}</div>
                        <small className="text-muted">Pending</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="h4 text-danger mb-0">{formatCurrency(stats.payments.overdue)}</div>
                        <small className="text-muted">Overdue</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="h4 text-info mb-0">{formatCurrency(stats.maintenance.totalCost)}</div>
                        <small className="text-muted">Maintenance Costs</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Report */}
        {activeReport === 'properties' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Properties Report</h5>
              <button
                className="btn btn-primary"
                onClick={() => handleExport('properties')}
              >
                Export CSV
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Type</th>
                      <th>Units</th>
                      <th>Sq Ft</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.address}, {p.city}</td>
                        <td><span className="badge bg-secondary">{p.property_type}</span></td>
                        <td>{p.total_units}</td>
                        <td>{p.square_footage?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leases Report */}
        {activeReport === 'leases' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Leases Report</h5>
              <button
                className="btn btn-primary"
                onClick={() => handleExport('leases')}
              >
                Export CSV
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Lease #</th>
                      <th>Tenant</th>
                      <th>Property</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Monthly Rent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leases.map((l) => (
                      <tr key={l.id}>
                        <td>{l.lease_number}</td>
                        <td>{l.tenant?.first_name} {l.tenant?.last_name}</td>
                        <td>{l.property?.name}</td>
                        <td>{new Date(l.start_date).toLocaleDateString()}</td>
                        <td>{new Date(l.end_date).toLocaleDateString()}</td>
                        <td>{formatCurrency(l.monthly_rent)}</td>
                        <td>
                          <span className={`badge ${
                            l.status === 'active' ? 'bg-success' :
                            l.status === 'expired' ? 'bg-secondary' :
                            'bg-warning'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Report */}
        {activeReport === 'maintenance' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Maintenance Report</h5>
              <button
                className="btn btn-primary"
                onClick={() => handleExport('maintenance')}
              >
                Export CSV
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Property</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Est. Cost</th>
                      <th>Actual Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m.id}>
                        <td>{m.title}</td>
                        <td>{m.property?.name}</td>
                        <td>{m.category}</td>
                        <td>
                          <span className={`badge ${
                            m.priority === 'emergency' ? 'bg-danger' :
                            m.priority === 'high' ? 'bg-warning' :
                            'bg-info'
                          }`}>
                            {m.priority}
                          </span>
                        </td>
                        <td>{m.estimated_cost ? formatCurrency(m.estimated_cost) : '-'}</td>
                        <td>{m.actual_cost ? formatCurrency(m.actual_cost) : '-'}</td>
                        <td>
                          <span className={`badge ${
                            m.status === 'completed' ? 'bg-success' :
                            m.status === 'in_progress' ? 'bg-primary' :
                            'bg-warning'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Report */}
        {activeReport === 'payments' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Payments Report</h5>
              <button
                className="btn btn-primary"
                onClick={() => handleExport('payments')}
              >
                Export CSV
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Tenant</th>
                      <th>Property</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td>{p.tenant?.first_name} {p.tenant?.last_name}</td>
                        <td>{p.property?.name}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{p.payment_method}</td>
                        <td>
                          <span className={`badge ${
                            p.payment_status === 'completed' ? 'bg-success' :
                            p.payment_status === 'pending' ? 'bg-warning' :
                            'bg-danger'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;
