import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const QuotationSubmit: React.FC = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchRfq = async () => {
      try {
        const res = await apiClient.get(`/rfqs/${rfqId}`);
        setRfq(res.data);
        const mappedItems = res.data.lineItems.map((li: any) => ({
          rfqItemId: li._id,
          description: li.description,
          quantity: li.quantity,
          unit: li.unit,
          unitPrice: 0,
          deliveryDays: 7
        }));
        setItems(mappedItems);
      } catch (err) {
        toast.error('Failed to load RFQ details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRfq();
  }, [rfqId]);

  const handleItemChange = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxAmount = subtotal * (taxPercent / 100);
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'SUBMITTED') => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const totals = calculateTotals();
      const payload = {
        rfqId,
        status,
        items: items.map(i => ({
          rfqItemId: i.rfqItemId,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          deliveryDays: i.deliveryDays
        })),
        taxPercent,
        ...totals,
        deliveryOverallDays: Math.max(...items.map(i => i.deliveryDays), 7),
        notes
      };

      await apiClient.post(`/rfqs/${rfqId}/quotations`, payload);
      toast.success(status === 'SUBMITTED' ? 'Quotation submitted successfully!' : 'Draft saved.');
      navigate('/rfqs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading RFQ data...</div>;

  const { subtotal, taxAmount, grandTotal } = calculateTotals();
  
  // Format the summary text
  const summaryText = rfq?.lineItems?.map((li: any) => `${li.description} * ${li.quantity}`).join(', ') + ` - category ${rfq?.category?.toLowerCase() || 'unspecified'}`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Back button logic just to keep usability high */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate('/rfqs')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Submit Quotations</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          RFQ: {rfq?.title?.toLowerCase()} - deadline {rfq ? formatDate(rfq.deadline) : '—'}
        </p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>RFQ Summary</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {summaryText}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Your Quotation</div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead style={{ borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid var(--border)', width: '30%' }}>Item</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid var(--border)', width: '15%' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid var(--border)', width: '20%' }}>Unit price</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid var(--border)', width: '15%' }}>Total</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-primary)', width: '20%' }}>Delivery ( days)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.rfqItemId} style={{ borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}>{item.description}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border)' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}>
                    <input 
                      type="number"
                      style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                      value={item.unitPrice || ''}
                      onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                    {item.unitPrice * item.quantity || 0}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <input 
                      type="number"
                      style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                      value={item.deliveryDays || ''}
                      onChange={e => handleItemChange(index, 'deliveryDays', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        
        {/* Left Side: Inputs and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>tax / GST %</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', maxWidth: '200px' }}>
              <input 
                type="number"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                value={taxPercent}
                onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Note / terms</div>
            <textarea 
              style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', minHeight: '100px', outline: 'none', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="Payment terms: 20 days net..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'SUBMITTED')}
              isLoading={isSubmitting}
              style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Submit Quotation
            </Button>
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              isLoading={isSubmitting}
              style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Save Draft
            </Button>
          </div>
        </div>

        {/* Right Side: Totals Box */}
        <div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>Subtotal</span>
              <span style={{ color: 'var(--text-primary)' }}>{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>GST ({taxPercent}%)</span>
              <span style={{ color: 'var(--text-primary)' }}>{taxAmount.toLocaleString()}</span>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 500 }}>
              <span style={{ color: 'var(--text-primary)' }}>Grand total</span>
              <span style={{ color: 'var(--text-primary)' }}>{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
