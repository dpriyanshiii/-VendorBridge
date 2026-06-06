import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { Vendor } from '../../types';

export const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await apiClient.get(`/vendors`);
        const found = res.data.items?.find((v: Vendor) => v._id === id) || res.data?.find((v: Vendor) => v._id === id);
        if (found) {
          setVendor(found);
        } else {
          toast.error('Vendor not found');
          navigate('/vendors');
        }
      } catch (err: any) {
        toast.error('Failed to load vendor details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  const updateStatus = async (status: 'ACTIVE' | 'BLOCKED') => {
    try {
      await apiClient.patch(`/vendors/${id}`, { status });
      setVendor(prev => prev ? { ...prev, status } : null);
      toast.success(`Vendor marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vendor status');
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading vendor profile...</div>;
  if (!vendor) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/vendors')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {vendor.name}
            <Badge variant={vendor.status === 'ACTIVE' ? 'success' : vendor.status === 'PENDING_VERIFICATION' ? 'warning' : 'danger'}>
              {vendor.status}
            </Badge>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Category: {vendor.category} | Registered: {formatDate(vendor.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {vendor.status !== 'ACTIVE' && (
            <Button variant="outline" onClick={() => updateStatus('ACTIVE')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', borderColor: 'var(--success)' }}>
              <CheckCircle size={16} /> Approve Vendor
            </Button>
          )}
          {vendor.status !== 'BLOCKED' && (
            <Button variant="outline" onClick={() => updateStatus('BLOCKED')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              <XCircle size={16} /> Block Vendor
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Company Details</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>GST Number</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.gstNumber || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Payment Terms</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.paymentTerms} Days Net</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Rating</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.rating ? `${vendor.rating} / 5.0` : 'Not rated yet'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Address</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                  {typeof vendor.address === 'object'
                    ? `${vendor.address.line1 || ''}, ${vendor.address.city || ''}, ${vendor.address.state || ''} - ${vendor.address.pin || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || '—'
                    : vendor.address || '—'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Primary Contact</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Name</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.primaryContact?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.primaryContact?.email || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Phone</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{vendor.primaryContact?.phone || '—'}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
