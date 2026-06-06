import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import type { Vendor } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';

export const VendorList: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/vendors');
        setVendors(res.data.items || res.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch vendors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || !statusFilter ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: vendors.length,
    active: vendors.filter(v => v.status === 'ACTIVE').length,
    pending: vendors.filter(v => v.status === 'PENDING_VERIFICATION').length,
    blocked: vendors.filter(v => v.status === 'BLOCKED').length
  };

  const columns = [
    { header: 'Vendor Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'GST no.', accessor: 'gstNumber' },
    { 
      header: 'contact no.', 
      accessor: (row: Vendor) => row.primaryContact.phone || '—'
    },
    { 
      header: 'Status', 
      accessor: (row: Vendor) => {
        const variants: Record<string, any> = {
          ACTIVE: 'success',
          PENDING_VERIFICATION: 'warning',
          BLOCKED: 'danger'
        };
        const labels: Record<string, string> = {
          ACTIVE: 'Active',
          PENDING_VERIFICATION: 'Pending',
          BLOCKED: 'Blocked'
        };
        return <Badge variant={variants[row.status] || 'neutral'} dot>{labels[row.status] || row.status}</Badge>;
      } 
    },
    { 
      header: 'Action', 
      accessor: (row: Vendor) => (
        <Button variant="outline" size="sm" onClick={() => navigate('/vendors/' + row._id)}>View</Button>
      ) 
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ marginBottom: 0 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Vendors</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage supplier profiles and registrations
          </p>
        </div>
        <Button onClick={() => navigate('/vendors/new')}>
          <Plus size={16} /> Add Vendor
        </Button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrap" style={{ maxWidth: '100%' }}>
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search bar ...... search by name, gst number, category..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'All', label: 'All', count: counts.all },
          { id: 'ACTIVE', label: 'active', count: counts.active },
          { id: 'PENDING_VERIFICATION', label: 'Pending', count: counts.pending },
          { id: 'BLOCKED', label: 'Blocked', count: counts.blocked }
        ].map(tab => {
          const isActive = (statusFilter === '' && tab.id === 'All') || statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id === 'All' ? '' : tab.id)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isActive ? 'var(--primary-muted)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      <div className="table-wrap">
        <Table 
          columns={columns as any} 
          data={filteredVendors} 
          isLoading={isLoading} 
          emptyMessage="No vendors found."
          emptyDescription="Try adjusting your search or filters."
        />
      </div>
    </div>
  );
};
