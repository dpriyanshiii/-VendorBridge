import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'PROCUREMENT_OFFICER',
    country: '',
    password: '',
    confirmPassword: '',
    additionalInfo: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        metadata: {
          country: formData.country,
          additionalInfo: formData.additionalInfo
        }
      };

      const res: any = await apiClient.post('/auth/signup', payload);
      setAuth(res.data.data.user, res.data.data.accessToken);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.details || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="auth-card" style={{ maxWidth: '600px', width: '100%' }}>
        
        {/* Photo Placeholder matching wireframe */}
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

        <h1 className="auth-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create an Account</h1>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="form-select"
                required
              >
                <option value="PROCUREMENT_OFFICER">Officer</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <textarea
              className="form-textarea"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <Button type="submit" isLoading={isLoading} style={{ marginTop: '0.5rem', width: '100%' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
            <Link to="/auth/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
