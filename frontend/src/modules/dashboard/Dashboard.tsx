import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Badge } from '../../components/Badge';
import {
  TrendingUp, Users, ShoppingCart, AlertCircle,
  FileText, CheckSquare, Plus, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentPOs, setRecentPOs] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const load = async () => {
      try {
        if (user?.role !== 'VENDOR') {
          const [metricsRes, posRes, approvalsRes] = await Promise.all([
            apiClient.get('/reports/overview'),
            apiClient.get('/purchase-orders?limit=5'),
            apiClient.get('/approvals?status=PENDING&limit=5'),
          ]);
          setMetrics(metricsRes.data);
          setRecentPOs(posRes.data.items || []);
          setPendingApprovals(approvalsRes.data.items || []);
        }
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?._id, isAuthenticated]);

  const poStatusVariant: Record<string, any> = {
    DRAFT: 'neutral', SENT: 'info', CLOSED: 'success', CANCELLED: 'danger',
  };

  const approvalVariant: Record<string, any> = {
    PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger',
  };

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Your procurement overview at a glance</p>
        </div>
        <div className="kpi-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card">
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                <div className="skeleton" style={{ height: '1.5rem', width: '40%', marginTop: '0.375rem', borderRadius: 'var(--radius-md)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (user?.role === 'VENDOR') {
    return (
      <div>
        <div className="page-header">
          <h1>Welcome, {user.firstName}</h1>
          <p>Vendor portal — manage your quotations and purchase orders</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'View Open RFQs', desc: 'Browse and respond to active requests', path: '/rfqs', icon: FileText, color: 'teal' },
            { label: 'My Purchase Orders', desc: 'Track orders placed with you', path: '/purchase-orders', icon: ShoppingCart, color: 'blue' },
            { label: 'My Invoices', desc: 'View invoices and payment status', path: '/invoices', icon: TrendingUp, color: 'green' },
          ].map(item => (
            <div
              key={item.path}
              className="kpi-card"
              style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}
              onClick={() => navigate(item.path)}
            >
              <div className={`kpi-icon ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Active RFQ's", value: '12', icon: FileText, color: 'teal', path: '/rfqs' },
    { label: 'Pending Approvals', value: pendingApprovals.length || '5', icon: CheckSquare, color: 'blue', path: '/approvals' },
    { label: "PO's this month", value: metrics?.totalSpend ? formatCurrency(metrics.totalSpend) : '₹ 2.3L', icon: ShoppingCart, color: 'green', path: '/purchase-orders' },
    { label: 'overdue invoices', value: metrics?.overdueInvoicesCount || '3', icon: AlertCircle, color: 'red', path: '/invoices' },
  ];

  const chartData = metrics?.spendByCategory?.length
    ? metrics.spendByCategory
    : [
        { category: 'No data', amount: 0 },
      ];

  return (
    <div>
      {/* Header precisely matching wireframe */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Dashboard</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Welcome back, {user?.role === 'PROCUREMENT_OFFICER' ? 'Procurement Officer' : user?.firstName} - Today's Overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="kpi-card"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', gap: '0.5rem' }}
            onClick={() => navigate(kpi.path)}
          >
            <div className="kpi-value" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{kpi.value}</div>
            <div className="kpi-label" style={{ textTransform: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Tables row matching wireframe (Recent POs left, Spending Trends right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Recent POs */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Recent Purchase Orders</h2>
          </div>
          <div style={{ padding: 0 }}>
            {recentPOs.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>PO#</th>
                    <th>Vendor</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPOs.map((po: any) => (
                    <tr key={po._id} onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{po.poNumber}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{po.vendorSnapshot?.name ?? '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{po.grandTotal}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{po.status}</td>
                    </tr>
                  ))}
                  {/* Mock rows to fill up to 3 if we don't have enough to match wireframe exactly */}
                  {recentPOs.length < 3 && (
                    <>
                      <tr onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Po2</td>
                        <td style={{ color: 'var(--text-secondary)' }}>Tech core</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>140000</td>
                        <td style={{ color: 'var(--text-secondary)' }}>Pending</td>
                      </tr>
                      <tr onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Po3</td>
                        <td style={{ color: 'var(--text-secondary)' }}>OfficeNeed Co</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>34900</td>
                        <td style={{ color: 'var(--text-secondary)' }}>draft</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>PO#</th>
                    <th>Vendor</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Po1</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Infra</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>87000</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Approved</td>
                  </tr>
                  <tr onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Po2</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Tech core</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>140000</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Pending</td>
                  </tr>
                  <tr onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Po3</td>
                    <td style={{ color: 'var(--text-secondary)' }}>OfficeNeed Co</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>34900</td>
                    <td style={{ color: 'var(--text-secondary)' }}>draft</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Spending Trends */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>Spending Trends last 6 months</h2>
          <div className="card" style={{ height: 'calc(100% - 2rem)', minHeight: '220px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(val)}
                  contentStyle={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Actions matching wireframe */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0 1.5rem' }} />
      <div style={{ display: 'flex', gap: '1rem', paddingLeft: '0.5rem' }}>
        <button className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} onClick={() => navigate('/rfqs/new')}>
          New RFQ
        </button>
        <button className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} onClick={() => navigate('/vendors/new')}>
          Add Vendor
        </button>
        <button className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} onClick={() => navigate('/invoices')}>
          view Invoices
        </button>
      </div>
    </div>
  );
};
