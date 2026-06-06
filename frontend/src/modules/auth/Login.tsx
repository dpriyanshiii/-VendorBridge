import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      officer: { email: 'rahul.officer@acme.com', password: 'VendorBridge@123' },
      manager: { email: 'priya.manager@acme.com', password: 'VendorBridge@123' },
      admin: { email: 'admin@acme.com', password: 'VendorBridge@123' },
      vendor: { email: 'sanjay@infrasupplies.com', password: 'VendorBridge@123' },
    };
    if (demos[role]) { setEmail(demos[role].email); setPassword(demos[role].password); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo / Photo matching wireframe */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--neutral-50)',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            Photo
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Username"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button type="submit" isLoading={isLoading} style={{ marginTop: '0.5rem', width: '100%' }}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
            <Link to="/auth/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              Create account
            </Link>
          </div>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: '1.75rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '0.625rem' }}>
            Demo accounts (click to fill)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Procurement Officer', role: 'officer' },
              { label: 'Manager', role: 'manager' },
              { label: 'Admin', role: 'admin' },
              { label: 'Vendor', role: 'vendor' },
            ].map(d => (
              <button
                key={d.role}
                type="button"
                onClick={() => fillDemo(d.role)}
                style={{
                  fontSize: '0.75rem', padding: '0.5rem 0.625rem',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-family)',
                  textAlign: 'left', transition: 'all 120ms',
                  fontWeight: 500,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--primary)'; (e.target as HTMLElement).style.color = 'var(--primary)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
