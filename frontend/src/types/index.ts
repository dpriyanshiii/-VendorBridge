export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'MANAGER' | 'VENDOR';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  vendorId?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED';
}

export interface Vendor {
  _id: string;
  name: string;
  category: string;
  gstNumber: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED';
  rating: number;
  createdAt?: string;
  paymentTerms?: number;
  address?: {
    line1: string;
    city: string;
    state: string;
    pin: string;
  };
}

export interface RFQ {
  _id: string;
  title: string;
  category: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
  deadline: string;
  assignedVendors: string[];
}

export interface Approval {
  _id: string;
  rfqId?: {
    _id: string;
    title: string;
  };
  quotationId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  currentLevel: number;
  levels: {
    level: number;
    approverId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    actedAt?: string;
    remarks?: string;
  }[];
  createdAt: string;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorSnapshot?: {
    name: string;
    address: string;
    gstin: string;
    contact: string;
  };
  status: 'DRAFT' | 'SENT' | 'CANCELLED' | 'CLOSED';
  poDate: string;
  grandTotal: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  poId?: {
    _id: string;
    poNumber: string;
  };
  vendorId: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  invoiceDate: string;
  dueDate: string;
  grandTotal: number;
}
