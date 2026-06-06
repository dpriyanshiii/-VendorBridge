import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';

export const RFQCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    deadline: '',
    description: '',
  });

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit: 'NOS' }
  ]);

  const [assignedVendors, setAssignedVendors] = useState<any[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await apiClient.get('/vendors');
        setAvailableVendors(res.data.items.filter((v: any) => v.status === 'ACTIVE'));
      } catch (error) {
        toast.error('Failed to load vendors');
      }
    };
    fetchVendors();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit: 'NOS' }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleAddVendor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value;
    if (!vendorId) return;
    
    const vendor = availableVendors.find(v => v._id === vendorId);
    if (vendor && !assignedVendors.find(v => v._id === vendorId)) {
      setAssignedVendors([...assignedVendors, vendor]);
    }
    // reset select
    e.target.value = '';
  };

  const handleRemoveVendor = (vendorId: string) => {
    setAssignedVendors(assignedVendors.filter(v => v._id !== vendorId));
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    if (assignedVendors.length === 0) {
      toast.error('Please assign at least one vendor');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        lineItems,
        assignedVendors: assignedVendors.map(v => v._id)
      };
      await apiClient.post('/rfqs', payload);
      toast.success(publish ? 'RFQ Published successfully!' : 'RFQ Draft saved!');
      navigate('/rfqs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create RFQ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/rfqs')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ marginBottom: 0 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Create RFQ's</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            new request for quotation
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 600 }}>1</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)', margin: '0 1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border)', color: 'var(--text-tertiary)', fontWeight: 600 }}>2</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)', margin: '0 1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border)', color: 'var(--text-tertiary)', fontWeight: 600 }}>3</div>
      </div>

      <form>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Left Column: RFQ Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input 
              label="RFQ's title*" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                <option value="IT Hardware">IT Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Logistics">Logistics</option>
                <option value="Software Services">Software Services</option>
              </select>
            </div>
            <Input 
              label="Deadline*" 
              type="datetime-local" 
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
              required
            />
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea"
                style={{ minHeight: '120px' }}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Right Column: Line items and Vendors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Line Items */}
            <div>
              <div className="form-label" style={{ marginBottom: '0.75rem' }}>Line items</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                  <thead style={{ borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>item</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', width: '80px' }}>qty</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', width: '100px' }}>Unit</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={index} style={{ borderBottom: index < lineItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <input 
                            className="form-input" 
                            style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'transparent' }}
                            value={item.description}
                            onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <input 
                            type="number"
                            className="form-input" 
                            style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'transparent' }}
                            value={item.quantity}
                            onChange={e => handleLineItemChange(index, 'quantity', parseInt(e.target.value))}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <input 
                            className="form-input" 
                            style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'transparent' }}
                            value={item.unit}
                            onChange={e => handleLineItemChange(index, 'unit', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button type="button" onClick={() => handleRemoveLineItem(index)} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem}>
                + add line item
              </Button>
            </div>

            {/* ASSIGN VENDORS */}
            <div>
              <div className="form-label" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>ASSIGN VENDORS</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                  {assignedVendors.map(vendor => (
                    <div key={vendor._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{vendor.name}</span>
                      <button type="button" onClick={() => handleRemoveVendor(vendor._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <div style={{ padding: '0.5rem', marginTop: assignedVendors.length ? '0.5rem' : 0 }}>
                    <select 
                      className="form-select" 
                      style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer' }}
                      onChange={handleAddVendor}
                      value=""
                    >
                      <option value="" disabled>+ add vendor</option>
                      {availableVendors.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Area: Buttons and Attachments */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'flex-start' }}>
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              isLoading={isLoading}
              style={{ width: 'fit-content' }}
            >
              Save & Send to Vendors
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleSubmit(e, false)}
              isLoading={isLoading}
              style={{ width: 'fit-content' }}
            >
              Save as Draft
            </Button>
          </div>

          {/* Attachments */}
          <div>
            <div className="form-label" style={{ marginBottom: '0.75rem' }}>Attchements</div>
            <div style={{ 
              border: '1px dashed var(--border-strong)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '3rem 1rem', 
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              background: 'var(--bg-surface)'
            }}>
              Drag & drop files or click to upload
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
