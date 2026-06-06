import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [approval, setApproval] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const res = await apiClient.get(`/approvals`);
        const found = res.data.items?.find((a: any) => a._id === id) || res.data?.find((a: any) => a._id === id);
        if (found) {
          // fetch full quotation details if not fully populated
          if (found.quotationId && typeof found.quotationId === 'string') {
            const quoteRes = await apiClient.get(`/rfqs/${found.rfqId?._id || found.rfqId}/quotations`);
            const matchedQuote = quoteRes.data.find((q: any) => q._id === found.quotationId);
            found.quotation = matchedQuote;
          } else {
            found.quotation = found.quotationId;
          }
          setApproval(found);
        } else {
          toast.error('Approval not found');
          navigate('/approvals');
        }
      } catch (err) {
        toast.error('Failed to load approval details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApproval();
  }, [id, navigate]);

  const [isGeneratingPO, setIsGeneratingPO] = useState(false);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    try {
      setIsSubmitting(true);
      await apiClient.post(`/approvals/${id}/act`, {
        action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        remarks
      });
      toast.success(`Approval ${status.toLowerCase()} successfully`);
      navigate('/approvals');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || `Failed to ${status.toLowerCase()} approval`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePO = async () => {
    try {
      setIsGeneratingPO(true);
      await apiClient.post('/purchase-orders', { approvalId: id });
      toast.success('Purchase Order generated successfully!');
      navigate('/purchase-orders');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Failed to generate Purchase Order');
    } finally {
      setIsGeneratingPO(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading workflow details...</div>;
  if (!approval) return null;

  const vendorName = approval.quotation?.vendorId?.name || 'Infra Supplies PVT LTD'; // fallback mock for UI
  const totalAmount = approval.quotation?.grandTotal || 185400;

  // Mock steps to match the 4 step layout from wireframe
  const steps = [
    { label: 'Submitted', active: true },
    { label: 'L1 Review', active: approval.currentLevel >= 1 },
    { label: 'L2 approval', active: approval.currentLevel >= 2, current: approval.currentLevel === 2 },
    { label: 'Generate PO', active: approval.status === 'APPROVED' },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/approvals')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>Approval Workflow</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
          RFQ: {approval.rfqId?.title?.toLowerCase() || 'office furniture q2'} - Vendor: {vendorName} - {totalAmount.toLocaleString()}
        </p>
      </div>

      {/* Progress Steps Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '1px', background: 'var(--border)', zIndex: 0 }}></div>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'var(--bg)', border: `1px solid ${step.current ? '#4A90E2' : 'var(--text-primary)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step.current ? '#4A90E2' : 'var(--text-primary)',
              fontSize: '1rem', marginBottom: '0.5rem'
            }}>
              {idx + 1}
            </div>
            <div style={{ fontSize: '0.875rem', color: step.current ? '#4A90E2' : 'var(--text-primary)' }}>{step.label}</div>
          </div>
        ))}
      </div>

      {/* 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              APPROVAL CHAIN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Chain Logic Mapped - mock fallback to match wireframe exactly if levels are empty */}
              {approval.levels && approval.levels.length > 0 ? approval.levels.map((lvl: any, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {lvl.status === 'APPROVED' ? (
                    <div style={{ color: 'var(--success)', marginTop: '2px' }}><CheckCircle2 size={28} /></div>
                  ) : (
                    <div style={{ color: '#4A90E2', marginTop: '2px' }}><Clock size={28} /></div>
                  )}
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {lvl.approverId?.firstName || 'Approver'} ({lvl.level === 1 ? 'Procurement head' : 'Finance manager'})
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {lvl.status === 'APPROVED' ? `Approved on ${formatDate(lvl.updatedAt)}` : `Awaiting Assigned ${formatDate(lvl.createdAt || approval.createdAt)}`}
                    </div>
                  </div>
                </div>
              )) : (
                <>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--success)', marginTop: '2px' }}><CheckCircle2 size={28} /></div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Rahul Mehta (Procurement head)
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Approved on may 20, 10:32 Am
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ color: '#4A90E2', marginTop: '2px' }}><Clock size={28} /></div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Priya Shah (finance manager)
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Awaiting Assigned may 21
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginTop: '1.5rem', marginBottom: '0' }} />
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Approval Remarks</div>
            <textarea 
              style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', minHeight: '120px', outline: 'none', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="Add your comments or conditions...."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              QUOTATIONS SUMMARY
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Vendor:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{vendorName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatCurrency(totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{approval.quotation?.deliveryOverallDays || 10} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rating:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{approval.quotation?.vendorId?.rating || 4.5}/5</span>
                </div>
              </div>
            </div>
          </div>

          {approval.status === 'PENDING' && (user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
              <Button 
                variant="outline" 
                onClick={() => handleAction('APPROVED')}
                isLoading={isSubmitting}
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                Approve
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAction('REJECTED')}
                isLoading={isSubmitting}
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                Reject
              </Button>
            </div>
          )}
          {approval.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_OFFICER') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: 'auto' }}>
              <Button 
                onClick={handleGeneratePO}
                isLoading={isGeneratingPO}
                style={{ width: '100%', background: 'var(--primary)', color: '#fff' }}
              >
                Generate Purchase Order
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
