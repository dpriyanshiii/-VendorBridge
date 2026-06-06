import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/Card';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import type { RFQ } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const RFQList: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/rfqs');
        setRfqs(res.data.items || res.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch RFQs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRfqs();
  }, []);

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r as any).rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r._id.substring(r._id.length - 8).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'RFQ Number', accessor: (row: RFQ) => <span className="font-semibold">{(row as any).rfqNumber || `RFQ-${row._id.substring(row._id.length - 8).toUpperCase()}`}</span> },
    { header: 'Title', accessor: 'title' },
    { 
      header: 'Deadline', 
      accessor: (row: RFQ) => (
        <span className={new Date(row.deadline) < new Date() && row.status === 'PUBLISHED' ? 'text-danger font-medium' : ''}>
          {formatDate(row.deadline)}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (row: RFQ) => {
        const variants: Record<string, any> = {
          DRAFT: 'neutral',
          PUBLISHED: 'info',
          CLOSED: 'warning',
          AWARDED: 'success',
          CANCELLED: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'} dot>{row.status}</Badge>;
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: RFQ) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {user?.role === 'VENDOR' && row.status === 'PUBLISHED' && (
            <Button size="sm" onClick={() => navigate(`/rfqs/${row._id}/quote`)}>Submit Quote</Button>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_OFFICER') && row.status === 'CLOSED' && (
            <Button size="sm" variant="secondary" onClick={() => navigate(`/rfqs/${row._id}/compare`)}>Compare</Button>
          )}
        </div>
      ) 
    },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1>Requests for Quotation</h1>
          <p>Manage RFQs and vendor bids</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_OFFICER') && (
          <Button onClick={() => navigate('/rfqs/new')}>
            <Plus size={16} /> Create RFQ
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="toolbar w-full">
            <div className="search-input-wrap">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search RFQs by number or title..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: 'auto', minWidth: 160 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="AWARDED">Awarded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <div className="table-wrap" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 0 }}>
          <Table 
            columns={columns as any} 
            data={filteredRfqs} 
            isLoading={isLoading} 
            emptyMessage="No RFQs found."
            emptyDescription="Try adjusting your filters or create a new RFQ."
          />
        </div>
      </Card>
    </div>
  );
};
