import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { Login } from '../modules/auth/Login';
import { Register } from '../modules/auth/Register';
import { Dashboard } from '../modules/dashboard/Dashboard';

import { VendorList } from '../modules/vendors/VendorList';
import { RFQList } from '../modules/rfqs/RFQList';
import { RFQCreate } from '../modules/rfqs/RFQCreate';
import { QuotationSubmit } from '../modules/rfqs/QuotationSubmit';
import { QuotationComparison } from '../modules/rfqs/QuotationComparison';
import { ApprovalList } from '../modules/approvals/ApprovalList';
import { ApprovalDetail } from '../modules/approvals/ApprovalDetail';
import { POList } from '../modules/purchaseOrders/POList';
import { InvoiceList } from '../modules/invoices/InvoiceList';
import { InvoiceDetail } from '../modules/invoices/InvoiceDetail';
import { ActivityLog } from '../modules/activity/ActivityLog';
import { Reports } from '../modules/reports/Reports';

import { Settings } from '../modules/settings/Settings';
import { VendorCreate } from '../modules/vendors/VendorCreate';
import { VendorDetail } from '../modules/vendors/VendorDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'vendors', element: <VendorList /> },
      { path: 'rfqs', element: <RFQList /> },
      { path: 'rfqs/new', element: <RFQCreate /> },
      { path: 'rfqs/:rfqId/quote', element: <QuotationSubmit /> },
      { path: 'rfqs/:rfqId/compare', element: <QuotationComparison /> },
      { path: 'approvals', element: <ApprovalList /> },
      { path: 'approvals/:id', element: <ApprovalDetail /> },
      { path: 'purchase-orders', element: <POList /> },
      { path: 'purchase-orders/:id', element: <InvoiceDetail /> },
      { path: 'invoices', element: <InvoiceList /> },
      { path: 'invoices/:id', element: <InvoiceDetail /> },
      { path: 'activity', element: <ActivityLog /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
      { path: 'vendors/new', element: <VendorCreate /> },
      { path: 'vendors/:id', element: <VendorDetail /> },
    ]
  }
]);
