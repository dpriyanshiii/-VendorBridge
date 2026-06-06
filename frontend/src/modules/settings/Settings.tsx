import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>System Settings</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Manage your account preferences and system configurations
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Profile Information</h2>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="form-label">First Name</label>
                <input className="form-input" defaultValue={user?.firstName} disabled />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input className="form-input" defaultValue={user?.lastName} disabled />
              </div>
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" defaultValue={user?.email} disabled />
            </div>
            <div>
              <label className="form-label">Role</label>
              <input className="form-input" defaultValue={user?.role} disabled style={{ backgroundColor: 'var(--bg-surface-hover)' }} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h2>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Email Alerts</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receive daily summary emails</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500 }}>RFQ Notifications</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Get notified when a new RFQ is created</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Approval Workflows</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alert me when I have pending approvals</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
