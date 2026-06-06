import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/Card';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/invoices');
        setInvoices(res.data.items || res.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch Invoices');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Invoice Number', accessor: (row: any) => <span className="font-semibold">{row.invoiceNumber}</span> },
    { header: 'PO Number', accessor: (row: any) => row.poId?.poNumber || '—' },
    { header: 'Issue Date', accessor: (row: any) => formatDate(row.issueDate) },
    { header: 'Due Date', accessor: (row: any) => <span className={new Date(row.dueDate) < new Date() && row.status !== 'PAID' ? 'text-danger font-medium' : ''}>{formatDate(row.dueDate)}</span> },
    { header: 'Amount', accessor: (row: any) => <span className="font-medium text-primary-color">{formatCurrency(row.totalAmount)}</span> },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const variants: Record<string, any> = {
          DRAFT: 'neutral',
          SUBMITTED: 'info',
          APPROVED: 'primary',
          PAID: 'success',
          REJECTED: 'danger'
        };
        return <Badge variant={variants[row.status] || 'neutral'} dot>{row.status}</Badge>;
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/invoices/${row._id}`)}><FileText size={14} className="mr-1" /> View</Button>
          {user?.role === 'MANAGER' && row.status === 'SUBMITTED' && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/invoices/${row._id}`)}>Review</Button>
          )}
        </div>
      ) 
    },
  ];

  return (
    <div>
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1>Invoices</h1>
          <p>Manage supplier invoices and payments</p>
        </div>
        {user?.role === 'VENDOR' && (
          <Button onClick={() => navigate('/purchase-orders')}>
            <Plus size={16} /> Submit Invoice
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
                placeholder="Search invoices by number..." 
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
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <div className="table-wrap" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 0 }}>
          <Table 
            columns={columns} 
            data={filteredInvoices} 
            isLoading={isLoading} 
            emptyMessage="No Invoices found."
            emptyDescription="Try adjusting your search criteria."
          />
        </div>
      </Card>
    </div>
  );
};
