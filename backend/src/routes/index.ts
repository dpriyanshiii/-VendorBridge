import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { VendorController } from '../controllers/VendorController';
import { RFQController } from '../controllers/RFQController';
import { QuotationController } from '../controllers/QuotationController';
import { ComparisonController } from '../controllers/ComparisonController';
import { ApprovalController } from '../controllers/ApprovalController';
import { POController } from '../controllers/POController';
import { InvoiceController } from '../controllers/InvoiceController';
import { NotificationController } from '../controllers/NotificationController';
import { ReportsController } from '../controllers/ReportsController';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { auditLogger } from '../middleware/auditLogger';


const router = Router();

// --- Auth ---
router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.me);

// --- Vendors ---
router.post('/vendors', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('VENDOR', 'VENDOR_CREATED'), VendorController.create);
router.get('/vendors', authMiddleware, VendorController.getAll);
router.get('/vendors/:id', authMiddleware, VendorController.getById);
router.patch('/vendors/:id', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('VENDOR', 'VENDOR_UPDATED'), VendorController.update);

// --- RFQs ---
router.post('/rfqs', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('RFQ', 'RFQ_CREATED'), RFQController.create);
router.post('/rfqs/:id/publish', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('RFQ', 'RFQ_PUBLISHED'), RFQController.publish);
router.get('/rfqs', authMiddleware, RFQController.getAll);
router.get('/rfqs/:id', authMiddleware, RFQController.getById);

// --- Quotations ---
router.post('/rfqs/:rfqId/quotations', authMiddleware, requireRole('VENDOR'), auditLogger('QUOTATION', 'QUOTATION_SUBMITTED'), QuotationController.submit);
router.get('/rfqs/:rfqId/quotations', authMiddleware, QuotationController.getByRFQ);

// --- Comparisons ---
router.post('/rfqs/:rfqId/comparisons', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('COMPARISON', 'COMPARISON_CREATED'), ComparisonController.create);
router.get('/rfqs/:rfqId/comparisons/latest', authMiddleware, ComparisonController.getLatest);

// --- Approvals ---
router.post('/approvals', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('APPROVAL', 'APPROVAL_CREATED'), ApprovalController.create);
router.post('/approvals/:id/act', authMiddleware, requireRole('MANAGER', 'ADMIN'), auditLogger('APPROVAL', 'APPROVAL_ACTED'), ApprovalController.act);
router.get('/approvals', authMiddleware, ApprovalController.getAll);
router.get('/approvals/:id', authMiddleware, ApprovalController.getById);

// --- Purchase Orders ---
router.post('/purchase-orders', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER'), auditLogger('PO', 'PO_CREATED'), POController.create);
router.patch('/purchase-orders/:id/status', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'), auditLogger('PO', 'PO_STATUS_UPDATED'), POController.updateStatus);
router.get('/purchase-orders', authMiddleware, POController.getAll);
router.get('/purchase-orders/:id', authMiddleware, POController.getById);

// --- Invoices ---
router.post('/invoices', authMiddleware, requireRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'), auditLogger('INVOICE', 'INVOICE_CREATED'), InvoiceController.create);
router.patch('/invoices/:id/status', authMiddleware, requireRole('ADMIN', 'MANAGER'), auditLogger('INVOICE', 'INVOICE_STATUS_UPDATED'), InvoiceController.updateStatus);
router.get('/invoices', authMiddleware, InvoiceController.getAll);
router.get('/invoices/:id', authMiddleware, InvoiceController.getById);

// --- Notifications ---
router.get('/notifications', authMiddleware, NotificationController.getAll);
router.patch('/notifications/:id/read', authMiddleware, NotificationController.markAsRead);
router.patch('/notifications/mark-all-read', authMiddleware, NotificationController.markAllAsRead);

// --- Reports ---
router.get('/reports/overview', authMiddleware, requireRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), ReportsController.getOverview);

// --- Audit Logs ---
router.get('/audit-logs', authMiddleware, requireRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), AuditController.getAll);

export default router;
