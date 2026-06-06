import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [invoice, setInvoice] = useState<any>(null);
  const [po, setPO] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const isPOView = window.location.pathname.includes('purchase-orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (isPOView) {
          // Fetch PO details
          const poRes = await apiClient.get(`/purchase-orders/${id}`);
          const poData = poRes.data.data || poRes.data;
          setPO(poData);
          
          // Try to find if there is an associated invoice
          try {
            const invsRes = await apiClient.get('/invoices');
            const invList = invsRes.data.items || invsRes.data || [];
            const matchedInv = invList.find((inv: any) => 
              (inv.poId?._id || inv.poId) === id
            );
            if (matchedInv) {
              matchedInv.po = poData;
              setInvoice(matchedInv);
            }
          } catch (e) {
            console.log('No associated invoice found or failed to fetch', e);
          }
        } else {
          // Fetch Invoice directly
          const res = await apiClient.get(`/invoices`);
          const found = res.data.items?.find((i: any) => i._id === id) || res.data?.find((i: any) => i._id === id);
          if (found) {
            if (found.poId && typeof found.poId === 'string') {
               const poRes = await apiClient.get(`/purchase-orders/${found.poId}`);
               found.po = poRes.data.data || poRes.data;
            } else if (found.poId) {
               found.po = found.poId;
            }
            setInvoice(found);
            if (found.po) {
              setPO(found.po);
            }
          } else {
            toast.error('Invoice not found');
            navigate('/invoices');
          }
        }
      } catch (err) {
        toast.error('Failed to load details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, isPOView]);

  const markAsPaid = async () => {
    try {
      setIsUpdating(true);
      const invoiceId = invoice?._id || id;
      await apiClient.patch(`/invoices/${invoiceId}/status`, { status: 'PAID' });
      setInvoice({ ...invoice, status: 'PAID' });
      toast.success('Invoice marked as Paid');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update invoice status');
    } finally {
      setIsUpdating(false);
    }
  };

  const submitInvoice = async () => {
    try {
      setIsSubmittingInvoice(true);
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 30); // 30 days net payment terms
      
      const res = await apiClient.post('/invoices', {
        poId: po._id,
        dueDate: futureDueDate
      });
      toast.success('Invoice generated & submitted successfully!');
      
      // Update state with newly created invoice
      const invData = res.data.data || res.data;
      invData.po = po;
      setInvoice(invData);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Failed to submit invoice');
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading details...</div>;
  if (!po && !invoice) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-danger)' }}>Document not found.</div>;

  // Resolve Vendor details safely
  const vendor = po?.vendorSnapshot || invoice?.po?.vendorSnapshot || po?.vendorId || invoice?.vendorId || {
    name: 'Infra supplies pvt ltd',
    address: '456, industrial estate, surat',
    gstNumber: '343434DB4523'
  };

  const vendorName = vendor.name || 'Vendor';
  const vendorAddress = typeof vendor.address === 'object'
    ? `${vendor.address.line1 || ''}, ${vendor.address.city || ''}, ${vendor.address.state || ''} - ${vendor.address.pin || ''}`.replace(/^,\s*|,\s*$/g, '').trim()
    : vendor.address || 'Address not provided';
  const vendorGstin = vendor.gstNumber || vendor.gstin || 'GST not provided';

  // Resolve items safely
  const items = po?.items || invoice?.po?.items || invoice?.lineItems || [];

  const subtotal = items.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  const taxAmount = invoice?.taxBreakup ? ((invoice.taxBreakup.cgstAmount || 0) + (invoice.taxBreakup.sgstAmount || 0)) : (po?.taxBreakup ? ((po.taxBreakup.cgstAmount || 0) + (po.taxBreakup.sgstAmount || 0)) : (subtotal * 0.18));
  const grandTotal = invoice?.grandTotal || po?.grandTotal || (subtotal + taxAmount);
  
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;

  // Resolve status presentation details
  const statusLabel = invoice 
    ? (invoice.status === 'PAID' ? 'Paid' : 'Pending Payment')
    : `PO Status: ${po?.status || 'DRAFT'}`;
  const statusColor = invoice 
    ? (invoice.status === 'PAID' ? 'var(--success)' : '#e0a800')
    : (po?.status === 'ACCEPTED' ? 'var(--success)' : '#e0a800');
  const statusBg = invoice 
    ? (invoice.status === 'PAID' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)')
    : (po?.status === 'ACCEPTED' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '2rem' }} className="print-container">
      <div style={{ marginBottom: '1.5rem' }} className="no-print">
        <button onClick={() => navigate(isPOView ? '/purchase-orders' : '/invoices')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {isPOView ? 'Purchase Order Details' : 'Purchase Order & Invoice'}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            {po?.poNumber || invoice?.po?.poNumber || 'PO-Number'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
          <Button variant="outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Download size={16} /> Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', overflow: 'hidden' }}>
        {/* Bill Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1.5rem', borderBottom: '1px solid var(--border)', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Bill to:</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.25rem' }}>Acme Corp (Your Organization)</div>
              <div style={{ marginBottom: '0.25rem' }}>123 Acme St, Business Park</div>
              <div>GSTIN: 27ACME0001A1Z5</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Vendor</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.25rem', textTransform: 'capitalize' }}>{vendorName}</div>
              <div style={{ marginBottom: '0.25rem' }}>{vendorAddress}</div>
              <div>GSTIN: {vendorGstin}</div>
            </div>
          </div>
        </div>

        {/* Dates & Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1.5rem', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', width: '120px' }}>PO Number:</span>
              <span style={{ color: 'var(--text-primary)' }}>{po?.poNumber || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)', width: '120px' }}>PO date:</span>
              <span style={{ color: 'var(--text-primary)' }}>{po ? formatDate(po.poDate || po.createdAt) : '—'}</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', width: '120px' }}>invoice date:</span>
              <span style={{ color: 'var(--text-primary)' }}>{invoice ? formatDate(invoice.invoiceDate || invoice.createdAt) : 'Pending submission'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)', width: '120px' }}>Due date:</span>
              <span style={{ color: 'var(--text-primary)' }}>{invoice ? formatDate(invoice.dueDate) : 'Pending submission'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', width: '40%' }}>Item</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', width: '20%' }}>Qty</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', width: '20%' }}>Unit price</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}>{item.description}</td>
                <td style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}>{item.quantity}</td>
                <td style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}>{item.unitPrice}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
              </tr>
            ))}
            
            {/* Summary Rows */}
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td colSpan={2} style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}></td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Subtotal</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td colSpan={2} style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}></td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-secondary)' }}>CGST(9%)</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{formatCurrency(cgst)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td colSpan={2} style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}></td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-secondary)' }}>SGST(9%)</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{formatCurrency(sgst)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}></td>
              <td style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}>Grand total</td>
              <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
          <span style={{ 
            background: statusBg, 
            color: statusColor, 
            padding: '0.25rem 0.75rem', 
            borderRadius: '4px',
            fontWeight: 500 
          }}>
            {statusLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
          {/* Submit Invoice action for Vendor if PO is accepted and no invoice exists yet */}
          {!invoice && po?.status === 'ACCEPTED' && user?.role === 'VENDOR' && (
            <Button 
              onClick={submitInvoice} 
              isLoading={isSubmittingInvoice}
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Submit Invoice
            </Button>
          )}

          {/* Mark as Paid action for Admin/Manager if Invoice exists and is not paid */}
          {invoice && invoice.status !== 'PAID' && user?.role !== 'VENDOR' && (
            <Button 
              onClick={markAsPaid}
              isLoading={isUpdating}
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
