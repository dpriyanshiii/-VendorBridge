import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/reports/overview');
      setReportData(res.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch reports data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = () => {
    toast.success('Report export started. You will receive an email shortly.');
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Loading reports...
      </div>
    );
  }

  // Use the fetched metrics or fallback to the exact numbers from the wireframe for fidelity
  const metrics = reportData?.metrics || {
    totalSpend: 1240000,
    activeVendors: 28,
    poFulfillmentRate: 94,
    overdueInvoicesCount: 3
  };

  const chartData = [
    { name: 'Dec', spend: 20 },
    { name: 'Jan', spend: 35 },
    { name: 'Feb', spend: 25 },
    { name: 'Mar', spend: 60 },
    { name: 'Apr', spend: 45 },
    { name: 'May', spend: 85 }
  ];

  const categories = [
    { name: 'IT Hardware', value: '₹4.8L', percent: 80, color: '#1a56db' },
    { name: 'Furniture', value: '₹3.2L', percent: 60, color: '#10b981' },
    { name: 'Stationery', value: '₹2.1L', percent: 40, color: '#f59e0b' },
    { name: 'Logistics', value: '₹2.3L', percent: 45, color: '#ef4444' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reports & analytics</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Procurement Insights - may 2025
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              padding: '0.5rem 1rem', 
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option>May 2025</option>
            <option>April 2025</option>
            <option>March 2025</option>
          </select>
          <button 
            onClick={handleExport}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              padding: '0.5rem 1.5rem', 
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#4A90E2', marginBottom: '0.5rem' }}>12.4 L</div>
          <div style={{ fontSize: '0.875rem', color: '#4A90E2' }}>total spend</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>{metrics.activeVendors}</div>
          <div style={{ fontSize: '0.875rem', color: '#10b981' }}>Active vendors</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>{metrics.poFulfillmentRate}%</div>
          <div style={{ fontSize: '0.875rem', color: '#f59e0b' }}>PO Fulfillment</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>{metrics.overdueInvoicesCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>overdue invoices</div>
        </div>
      </div>

      {/* Main Content White Container */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', border: '1px solid var(--border)' }}>
        
        {/* Left Col: SPEND BY CATEGORY */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>
            SPEND BY CATEGORY
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {categories.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.value}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percent}%`, height: '100%', background: cat.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Vendors & Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Top Vendors Table */}
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              TOP VENDORS BY SPEND
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Vendor</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Spend (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>POs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>TechCore Ltd</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>4,20,000</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>6</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>Infra Supplies</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>3,10,000</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>4</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>FastLog</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>1,90,000</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              MONTHLY TREND
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="spend" fill="#a0c4f2" radius={[4, 4, 0, 0]} activeBar={{ fill: '#1a56db' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
