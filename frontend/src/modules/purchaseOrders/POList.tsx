import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/Card';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export const POList: React.FC = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuthStore();

  const fetchPOs = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/purchase-orders');
      setPos(res.data.items || res.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch Purchase Orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handlePOAction = async (poId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      setIsLoading(true);
      await apiClient.patch(`/purchase-orders/${poId}/status`, { status });
      toast.success(`Purchase Order ${status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully!`);
      await fetchPOs();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || `Failed to update Purchase Order`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPOs = pos.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (po.vendorSnapshot?.name && po.vendorSnapshot.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? po.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'PO Number', accessor: (row: any) => <span className="font-semibold">{row.poNumber}</span> },
    { header: 'Vendor', accessor: (row: any) => row.vendorSnapshot?.name || 'Unknown' },
    { header: 'Issue Date', accessor: (row: any) => formatDate(row.issueDate) },
    { header: 'Delivery Date', accessor: (row: any) => formatDate(row.expectedDeliveryDate) },
    { header: 'Amount', accessor: (row: any) => <span className="font-medium text-primary-color">{formatCurrency(row.grandTotal)}</span> },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const variants: Record<string, any> = {
          DRAFT: 'neutral',
          SENT: 'info',
          ACCEPTED: 'success',
          REJECTED: 'danger',
          CLOSED: 'warning',
          CANCELLED: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'} dot>{row.status}</Badge>;
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {user?.role === 'VENDOR' && row.status === 'SENT' && (
            <>
              <Button size="sm" variant="outline" className="text-success border-success-light hover:bg-success-light" onClick={() => handlePOAction(row._id, 'ACCEPTED')}>
                <CheckCircle size={14} className="mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="text-danger border-danger-light hover:bg-danger-light" onClick={() => handlePOAction(row._id, 'REJECTED')}>
                <XCircle size={14} className="mr-1" /> Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => navigate(`/purchase-orders/${row._id}`)}>View</Button>
        </div>
      ) 
    },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1>Purchase Orders</h1>
          <p>Track and manage your procurement orders</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_OFFICER') && (
          <Button onClick={() => navigate('/approvals')}>
            <Plus size={16} /> Create PO
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
                placeholder="Search POs by number or vendor..." 
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
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <div className="table-wrap" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 0 }}>
          <Table 
            columns={columns} 
            data={filteredPOs} 
            isLoading={isLoading} 
            emptyMessage="No Purchase Orders found."
            emptyDescription="Try adjusting your search criteria."
          />
        </div>
      </Card>
    </div>
  );
};
