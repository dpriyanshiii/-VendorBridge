process.env.SKIP_IMMUTABILITY_PRE_HOOKS = 'true';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import { RFQ } from '../models/RFQ';
import { Quotation } from '../models/Quotation';
import { Approval } from '../models/Approval';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Invoice } from '../models/Invoice';
import { AuditLog } from '../models/AuditLog';

const seed = async () => {
  await connectDB();
  
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Vendor.deleteMany({});
  await RFQ.deleteMany({});
  await Quotation.deleteMany({});
  await Approval.deleteMany({});
  await PurchaseOrder.deleteMany({});
  await Invoice.deleteMany({});
  await AuditLog.deleteMany({});

  const defaultPassword = await bcrypt.hash('VendorBridge@123', 10);

  console.log('Creating users...');
  const admin = await User.create({
    firstName: 'Admin', lastName: 'User', email: 'admin@acme.com', passwordHash: defaultPassword, role: 'ADMIN'
  });
  const officer = await User.create({
    firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.officer@acme.com', passwordHash: defaultPassword, role: 'PROCUREMENT_OFFICER'
  });
  const manager = await User.create({
    firstName: 'Priya', lastName: 'Shah', email: 'priya.manager@acme.com', passwordHash: defaultPassword, role: 'MANAGER'
  });

  console.log('Creating vendors...');
  const v1 = await Vendor.create({
    name: 'Infra Supplies Pvt Ltd', category: 'Furniture', gstNumber: '27AABCS1234B2Z0',
    primaryContact: { name: 'Sanjay Patel', email: 'sanjay@infrasupplies.com', phone: '+91-9876543210' },
    status: 'ACTIVE', rating: 4.5, createdBy: admin._id
  });
  const v2 = await Vendor.create({
    name: 'TechCore Ltd', category: 'IT Hardware', gstNumber: '27AACCT5678L1Z2',
    primaryContact: { name: 'Neha Rao', email: 'neha@techcore.com', phone: '+91-9988776655' },
    status: 'ACTIVE', rating: 4.2, createdBy: admin._id
  });

  console.log('Creating vendor users...');
  await User.create({
    firstName: 'Sanjay', lastName: 'Patel', email: 'sanjay@infrasupplies.com', passwordHash: defaultPassword, role: 'VENDOR', vendorId: v1._id
  });
  await User.create({
    firstName: 'Neha', lastName: 'Rao', email: 'neha@techcore.com', passwordHash: defaultPassword, role: 'VENDOR', vendorId: v2._id
  });

  console.log('Creating RFQ...');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  const rfq = await RFQ.create({
    title: 'Office Furniture Procurement Q2', category: 'Furniture', description: 'Ergonomic chairs and standing desks',
    status: 'PUBLISHED', deadline: futureDate, createdBy: officer._id, assignedVendors: [v1._id, v2._id],
    lineItems: [
      { description: 'Ergonomic chair', quantity: 25, unit: 'NOS' },
      { description: 'Standing desk', quantity: 10, unit: 'NOS' }
    ]
  });

  console.log('Creating Quotation...');
  const q1 = await Quotation.create({
    rfqId: rfq._id, vendorId: v1._id, status: 'SUBMITTED', currency: 'INR',
    items: [
      { rfqItemId: rfq.lineItems[0]._id as any, description: 'Ergonomic chair', quantity: 25, unit: 'NOS', unitPrice: 3500, total: 87500, deliveryDays: 10 },
      { rfqItemId: rfq.lineItems[1]._id as any, description: 'Standing desk', quantity: 10, unit: 'NOS', unitPrice: 8200, total: 82000, deliveryDays: 10 }
    ],
    taxPercent: 18, subtotal: 169500, taxAmount: 30510, grandTotal: 200010, deliveryOverallDays: 10, notes: 'Payment terms: 20 days net'
  });

  console.log('Creating Approval...');
  const approval = await Approval.create({
    rfqId: rfq._id, quotationId: q1._id, status: 'APPROVED', currentLevel: 1, createdBy: officer._id,
    levels: [{ level: 1, approverId: manager._id, status: 'APPROVED', actedAt: new Date(), remarks: 'Looks good' }]
  });

  rfq.selectedQuotationId = q1._id as any;
  rfq.approvalId = approval._id as any;
  rfq.status = 'CLOSED';
  await rfq.save();

  console.log('Creating PO...');
  const po = await PurchaseOrder.create({
    poNumber: 'PO-2025-0001', rfqId: rfq._id, quotationId: q1._id, approvalId: approval._id, vendorId: v1._id,
    status: 'SENT', poDate: new Date(),
    organization: { name: 'Acme Corp', address: '123 Acme St', gstin: '27ACME0001A1Z5' },
    vendorSnapshot: { name: v1.name, address: 'Vendor Address', gstin: v1.gstNumber, contact: v1.primaryContact.email },
    items: [
      { description: 'Ergonomic chair', quantity: 25, unit: 'NOS', unitPrice: 3500, total: 87500 },
      { description: 'Standing desk', quantity: 10, unit: 'NOS', unitPrice: 8200, total: 82000 }
    ],
    subtotal: 169500,
    taxBreakup: { cgstPercent: 9, cgstAmount: 15255, sgstPercent: 9, sgstAmount: 15255, igstPercent: 0, igstAmount: 0 },
    grandTotal: 200010, paymentTerms: '20 days net', createdBy: officer._id
  });

  console.log('Creating Invoice...');
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 20);
  
  const invoice = await Invoice.create({
    invoiceNumber: 'INV-2025-0001', poId: po._id, vendorId: v1._id, status: 'DRAFT',
    invoiceDate: new Date(), dueDate,
    items: po.items, subtotal: po.subtotal, taxBreakup: po.taxBreakup, grandTotal: po.grandTotal, createdBy: officer._id
  });
  
  po.invoiceId = invoice._id as any;
  await po.save();

  console.log('Seed complete! Default users:');
  console.log('admin@acme.com / rahul.officer@acme.com / priya.manager@acme.com / sanjay@infrasupplies.com');
  console.log('Password: VendorBridge@123');
  process.exit(0);
};

seed().catch(console.error);
