import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export const VendorCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    gstNumber: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await apiClient.post('/vendors', {
        name: formData.name,
        category: formData.category,
        gstNumber: formData.gstNumber,
        primaryContact: {
          name: 'Primary Contact',
          email: formData.email,
          phone: formData.phone
        },
        address: {
          line1: formData.address || '',
          city: 'City',
          state: 'State',
          country: 'India',
          pin: '000000'
        },
        paymentTerms: 30
      });
      toast.success('Vendor added successfully!');
      navigate('/vendors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/vendors')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Add New Vendor</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Register a new supplier profile
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Vendor Information</h2>
          </CardHeader>
          <CardBody style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input 
              label="Company Name *" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category...</option>
                <option value="IT Hardware">IT Hardware</option>
                <option value="Software">Software</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Services">Services</option>
              </select>
            </div>
            <Input 
              label="GST Number *" 
              name="gstNumber" 
              value={formData.gstNumber} 
              onChange={handleChange} 
              placeholder="e.g. 29ABCDE1234F1Z5"
              required 
            />
          </CardBody>
        </Card>

        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Contact Details</h2>
          </CardHeader>
          <CardBody style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input 
              label="Email Address *" 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Phone Number *" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
            />
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Full Address</label>
              <textarea 
                className="form-textarea"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/vendors')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Vendor
          </Button>
        </div>
      </form>
    </div>
  );
};
