import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/Card';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export const ApprovalList: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuthStore();

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/approvals');
      setApprovals(res.data.items || res.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch Approvals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setIsLoading(true);
      await apiClient.post(`/approvals/${approvalId}/act`, {
        action,
        remarks: 'Fast-approved from list view'
      });
      toast.success(`Approval ${action.toLowerCase()}d successfully`);
      await fetchApprovals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Failed to act on approval');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApprovals = approvals.filter(a => {
    const matchesSearch = a.rfqId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'RFQ Title', accessor: (row: any) => <span className="font-semibold">{row.rfqId?.title || 'Unknown RFQ'}</span> },
    { header: 'Level', accessor: (row: any) => `Level ${row.currentLevel}` },
    { header: 'Created', accessor: (row: any) => formatDate(row.createdAt) },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const variants: Record<string, any> = {
          PENDING: 'warning',
          APPROVED: 'success',
          REJECTED: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'} dot>{row.status}</Badge>;
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {user?.role === 'MANAGER' && row.status === 'PENDING' && (
            <>
              <Button size="sm" variant="outline" className="text-success border-success-light hover:bg-success-light" onClick={() => handleAction(row._id, 'APPROVE')}>
                <CheckCircle size={14} className="mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-danger border-danger-light hover:bg-danger-light" onClick={() => handleAction(row._id, 'REJECT')}>
                <XCircle size={14} className="mr-1" /> Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => navigate(`/approvals/${row._id}`)}>Details</Button>
        </div>
      ) 
    },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1>Approvals</h1>
          <p>Review and act on pending procurement requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="toolbar w-full">
            <div className="search-input-wrap">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by RFQ title..." 
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <div className="table-wrap" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 0 }}>
          <Table 
            columns={columns} 
            data={filteredApprovals} 
            isLoading={isLoading} 
            emptyMessage="No Approvals found."
            emptyDescription="You're all caught up!"
          />
        </div>
      </Card>
    </div>
  );
};
