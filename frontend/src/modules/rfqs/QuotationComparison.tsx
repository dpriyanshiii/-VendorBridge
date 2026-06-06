import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export const QuotationComparison: React.FC = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [rfqTitle, setRfqTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const fetchComparisonAndRfq = async () => {
      try {
        setIsLoading(true);
        // Fetch RFQ title simultaneously
        const rfqRes = await apiClient.get(`/rfqs/${rfqId}`);
        setRfqTitle(rfqRes.data?.title || 'office furniture procurement q2');
        
        const res = await apiClient.get(`/rfqs/${rfqId}/comparisons/latest`);
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // generate snapshot if not exists
          try {
            const generateRes = await apiClient.post(`/rfqs/${rfqId}/comparisons`, {
              criteria: ["grandTotal", "gstPercent", "deliveryDays", "vendorRating", "paymentTerms"]
            });
            setData(generateRes.data.data);
          } catch (e) {
            toast.error('Failed to generate comparison');
          }
        } else {
          toast.error('Failed to fetch comparison');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchComparisonAndRfq();
  }, [rfqId]);

  const handleSelectVendor = async (vendorId: string, quotationId: string) => {
    try {
      setIsApproving(true);
      await apiClient.post(`/approvals`, {
        rfqId,
        quotationId,
        levels: [
          { level: 1, approverId: 'auto-select' } // Simplified for MVP
        ]
      });
      toast.success('Approval workflow initiated!');
      navigate('/approvals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start approval');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading comparison matrix...</div>;
  if (!data || !data.vendors || data.vendors.length === 0) return (
    <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '3rem 0' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Quotations Yet</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Awaiting vendor responses for this RFQ.</p>
      <Button onClick={() => navigate('/rfqs')}>Back to RFQs</Button>
    </div>
  );

  // Default criteria map to clean labels
  const criteriaLabels: Record<string, string> = {
    grandTotal: 'Grand Total',
    gstPercent: 'GST %',
    deliveryDays: 'Delivery (days)',
    vendorRating: 'Vendor rating',
    paymentTerms: 'Payment terms'
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Back button logic */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate('/rfqs')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Quotation Comparison</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          RFQ: {rfqTitle.toLowerCase()} - {data.vendors.length} quotations received
        </p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '1.5rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', width: '20%' }}>
                Criteria
              </th>
              {data.vendors.map((v: any, index: number) => {
                const isLowest = v.isLowestPrice;
                return (
                  <th key={index} style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center', 
                    fontWeight: 500, 
                    color: isLowest ? '#fff' : 'var(--text-primary)', 
                    borderBottom: '1px solid var(--border)', 
                    borderRight: index < data.vendors.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isLowest ? 'var(--success)' : 'transparent',
                    width: `${80 / data.vendors.length}%`
                  }}>
                    {v.vendorId?.name || 'Vendor'} {isLowest && '(Lowest)'}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.criteria.map((criterion: string, i: number) => (
              <tr key={i}>
                <td style={{ padding: '1.25rem', textAlign: 'center', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  {criteriaLabels[criterion] || criterion.replace(/([A-Z])/g, ' $1').trim()}
                </td>
                {data.vendors.map((v: any, index: number) => {
                  const isLowest = v.isLowestPrice;
                  
                  // Format value
                  let val = v.values[criterion];
                  if (criterion === 'grandTotal') val = val; // The wireframe just shows "185000", not formatted currency.
                  if (criterion === 'vendorRating') val = `${val}/5`;
                  if (criterion === 'paymentTerms') val = val ? `${val} days` : '30 days'; // mock if missing
                  
                  return (
                    <td key={index} style={{ 
                      padding: '1.25rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid var(--border)', 
                      borderRight: index < data.vendors.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isLowest ? 'var(--success)' : 'transparent',
                      color: isLowest ? '#fff' : 'var(--text-primary)'
                    }}>
                      {val || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {/* Action Row */}
            <tr>
              <td style={{ padding: '1.25rem', borderRight: '1px solid var(--border)' }}></td>
              {data.vendors.map((v: any, index: number) => {
                const isLowest = v.isLowestPrice;
                return (
                  <td key={index} style={{ 
                    padding: '1.25rem', 
                    textAlign: 'center',
                    borderRight: index < data.vendors.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isLowest ? 'var(--success)' : 'transparent',
                  }}>
                    <Button 
                      onClick={() => handleSelectVendor(v.vendorId._id, v.quotationId)}
                      isLoading={isApproving}
                      style={{ 
                        background: isLowest ? 'transparent' : 'transparent',
                        border: isLowest ? '1px solid #fff' : '1px solid var(--border)',
                        color: isLowest ? '#fff' : 'var(--text-primary)',
                        width: '100%'
                      }}
                    >
                      {isLowest ? 'Select & Approve' : 'Select'}
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '0.875rem', color: '#ff6b6b' }}>
        Green = lowest price, selecting vendor initiates the approval workflow.
      </div>
    </div>
  );
};
