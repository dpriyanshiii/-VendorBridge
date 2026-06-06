"""
VendorBridge ERP — models.py
SQLAlchemy ORM models for all 15 database tables.
Each class maps 1-to-1 with the MySQL schema and includes
relationship() declarations for easy navigation across tables.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DECIMAL, Date, TIMESTAMP, Enum, ForeignKey,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


# ─────────────────────────────────────────────────────────────────────────────
# 1. USERS
# ─────────────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(
        Enum("admin", "procurement_officer", "manager", "vendor"),
        nullable=False,
    )
    is_active     = Column(Boolean, default=True, nullable=False)
    created_at    = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at    = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    vendors_created  = relationship("Vendor",        back_populates="created_by_user",  foreign_keys="Vendor.created_by")
    rfqs_created     = relationship("RFQ",           back_populates="created_by_user",  foreign_keys="RFQ.created_by")
    approvals        = relationship("Approval",      back_populates="approver",         foreign_keys="Approval.approver_id")
    purchase_orders  = relationship("PurchaseOrder", back_populates="created_by_user",  foreign_keys="PurchaseOrder.created_by")
    activity_logs    = relationship("ActivityLog",   back_populates="user",             foreign_keys="ActivityLog.user_id")
    notifications    = relationship("Notification",  back_populates="user",             foreign_keys="Notification.user_id", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────────────────────
# 2. VENDORS
# ─────────────────────────────────────────────────────────────────────────────
class Vendor(Base):
    __tablename__ = "vendors"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    company_name   = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=False)
    email          = Column(String(150), unique=True, nullable=False)
    phone          = Column(String(20))
    address        = Column(Text)
    gst_number     = Column(String(20), unique=True, nullable=False)
    category       = Column(String(100))
    status         = Column(
        Enum("active", "inactive", "blacklisted"),
        default="active", nullable=False,
    )
    rating         = Column(Float, default=0.0)
    created_by     = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at     = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at     = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    created_by_user = relationship("User",           back_populates="vendors_created", foreign_keys=[created_by])
    rfq_vendors     = relationship("RFQVendor",      back_populates="vendor",          cascade="all, delete-orphan")
    quotations      = relationship("Quotation",      back_populates="vendor")
    purchase_orders = relationship("PurchaseOrder",  back_populates="vendor")
    invoices        = relationship("Invoice",        back_populates="vendor")


# ─────────────────────────────────────────────────────────────────────────────
# 3. RFQ  (Request for Quotation — header)
# ─────────────────────────────────────────────────────────────────────────────
class RFQ(Base):
    __tablename__ = "rfq"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    rfq_number  = Column(String(50), unique=True, nullable=False)
    title       = Column(String(200), nullable=False)
    description = Column(Text)
    status      = Column(
        Enum("draft", "open", "closed", "awarded", "cancelled"),
        default="draft", nullable=False,
    )
    deadline    = Column(Date)
    created_by  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at  = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    created_by_user = relationship("User",           back_populates="rfqs_created", foreign_keys=[created_by])
    items           = relationship("RFQItem",        back_populates="rfq",          cascade="all, delete-orphan")
    rfq_vendors     = relationship("RFQVendor",      back_populates="rfq",          cascade="all, delete-orphan")
    attachments     = relationship("RFQAttachment",  back_populates="rfq",          cascade="all, delete-orphan")
    quotations      = relationship("Quotation",      back_populates="rfq")


# ─────────────────────────────────────────────────────────────────────────────
# 4. RFQ_ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class RFQItem(Base):
    __tablename__ = "rfq_items"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    rfq_id      = Column(Integer, ForeignKey("rfq.id", ondelete="CASCADE"), nullable=False)
    item_name   = Column(String(200), nullable=False)
    description = Column(Text)
    quantity    = Column(DECIMAL(10, 2), nullable=False)
    unit        = Column(String(50))
    created_at  = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    rfq               = relationship("RFQ",             back_populates="items")
    quotation_items   = relationship("QuotationItem",   back_populates="rfq_item")


# ─────────────────────────────────────────────────────────────────────────────
# 5. RFQ_VENDORS  (junction — vendors invited to an RFQ)
# ─────────────────────────────────────────────────────────────────────────────
class RFQVendor(Base):
    __tablename__ = "rfq_vendors"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    rfq_id            = Column(Integer, ForeignKey("rfq.id",     ondelete="CASCADE"), nullable=False)
    vendor_id         = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    invitation_status = Column(
        Enum("invited", "accepted", "declined", "responded"),
        default="invited", nullable=False,
    )
    invited_at        = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    responded_at      = Column(TIMESTAMP, nullable=True)

    # Relationships
    rfq    = relationship("RFQ",    back_populates="rfq_vendors")
    vendor = relationship("Vendor", back_populates="rfq_vendors")


# ─────────────────────────────────────────────────────────────────────────────
# 6. RFQ_ATTACHMENTS
# ─────────────────────────────────────────────────────────────────────────────
class RFQAttachment(Base):
    __tablename__ = "rfq_attachments"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    rfq_id      = Column(Integer, ForeignKey("rfq.id", ondelete="CASCADE"), nullable=False)
    file_name   = Column(String(255), nullable=False)
    file_path   = Column(String(500), nullable=False)
    file_type   = Column(String(50))
    uploaded_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    rfq = relationship("RFQ", back_populates="attachments")


# ─────────────────────────────────────────────────────────────────────────────
# 7. QUOTATIONS
# ─────────────────────────────────────────────────────────────────────────────
class Quotation(Base):
    __tablename__ = "quotations"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    quotation_number  = Column(String(50), unique=True, nullable=False)
    rfq_id            = Column(Integer, ForeignKey("rfq.id"),     nullable=False)
    vendor_id         = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    total_amount      = Column(DECIMAL(12, 2), nullable=False)
    delivery_days     = Column(Integer)
    notes             = Column(Text)
    status            = Column(
        Enum("submitted", "under_review", "accepted", "rejected"),
        default="submitted", nullable=False,
    )
    submitted_at      = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at        = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    rfq             = relationship("RFQ",           back_populates="quotations")
    vendor          = relationship("Vendor",        back_populates="quotations")
    items           = relationship("QuotationItem", back_populates="quotation",       cascade="all, delete-orphan")
    approvals       = relationship("Approval",      back_populates="quotation",       cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="quotation")


# ─────────────────────────────────────────────────────────────────────────────
# 8. QUOTATION_ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    quotation_id  = Column(Integer, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    rfq_item_id   = Column(Integer, ForeignKey("rfq_items.id"),                     nullable=False)
    unit_price    = Column(DECIMAL(10, 2), nullable=False)
    quantity      = Column(DECIMAL(10, 2), nullable=False)
    total_price   = Column(DECIMAL(12, 2), nullable=False)
    created_at    = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    quotation = relationship("Quotation", back_populates="items")
    rfq_item  = relationship("RFQItem",   back_populates="quotation_items")


# ─────────────────────────────────────────────────────────────────────────────
# 9. APPROVALS
# ─────────────────────────────────────────────────────────────────────────────
class Approval(Base):
    __tablename__ = "approvals"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    quotation_id   = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    approver_id    = Column(Integer, ForeignKey("users.id"),      nullable=False)
    status         = Column(
        Enum("pending", "approved", "rejected"),
        default="pending", nullable=False,
    )
    remarks        = Column(Text)
    approval_level = Column(Integer, default=1, nullable=False)
    actioned_at    = Column(TIMESTAMP, nullable=True)
    created_at     = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    quotation = relationship("Quotation", back_populates="approvals")
    approver  = relationship("User",      back_populates="approvals", foreign_keys=[approver_id])


# ─────────────────────────────────────────────────────────────────────────────
# 10. PURCHASE_ORDERS
# ─────────────────────────────────────────────────────────────────────────────
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    po_number         = Column(String(50), unique=True, nullable=False)
    quotation_id      = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    vendor_id         = Column(Integer, ForeignKey("vendors.id"),    nullable=False)
    created_by        = Column(Integer, ForeignKey("users.id"),      nullable=False)
    subtotal          = Column(DECIMAL(12, 2), nullable=False)
    tax_amount        = Column(DECIMAL(12, 2), nullable=False, default=0.0)
    total_amount      = Column(DECIMAL(12, 2), nullable=False)
    status            = Column(
        Enum("created", "sent", "acknowledged", "fulfilled", "cancelled"),
        default="created", nullable=False,
    )
    expected_delivery = Column(Date, nullable=True)
    created_at        = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at        = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    quotation       = relationship("Quotation", back_populates="purchase_orders")
    vendor          = relationship("Vendor",    back_populates="purchase_orders")
    created_by_user = relationship("User",      back_populates="purchase_orders", foreign_keys=[created_by])
    items           = relationship("POItem",    back_populates="purchase_order",  cascade="all, delete-orphan")
    invoices        = relationship("Invoice",   back_populates="purchase_order")


# ─────────────────────────────────────────────────────────────────────────────
# 11. PO_ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class POItem(Base):
    __tablename__ = "po_items"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    po_id          = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    item_name      = Column(String(200), nullable=False)
    quantity       = Column(DECIMAL(10, 2), nullable=False)
    unit           = Column(String(50))
    unit_price     = Column(DECIMAL(10, 2), nullable=False)
    total_price    = Column(DECIMAL(12, 2), nullable=False)
    created_at     = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")


# ─────────────────────────────────────────────────────────────────────────────
# 12. INVOICES
# ─────────────────────────────────────────────────────────────────────────────
class Invoice(Base):
    __tablename__ = "invoices"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    po_id          = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    vendor_id      = Column(Integer, ForeignKey("vendors.id"),         nullable=False)
    subtotal       = Column(DECIMAL(12, 2), nullable=False)
    tax_percent    = Column(DECIMAL(5, 2), default=0.0, nullable=False)
    tax_amount     = Column(DECIMAL(12, 2), default=0.0, nullable=False)
    total_amount   = Column(DECIMAL(12, 2), nullable=False)
    status         = Column(
        Enum("draft", "issued", "sent", "paid", "overdue", "cancelled"),
        default="draft", nullable=False,
    )
    due_date       = Column(Date, nullable=True)
    issued_at      = Column(TIMESTAMP, nullable=True)
    created_at     = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="invoices")
    vendor         = relationship("Vendor",        back_populates="invoices")
    email_logs     = relationship("InvoiceEmail",  back_populates="invoice", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────────────────────
# 13. INVOICE_EMAILS
# ─────────────────────────────────────────────────────────────────────────────
class InvoiceEmail(Base):
    __tablename__ = "invoice_emails"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    invoice_id      = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    sent_to         = Column(String(150), nullable=False)
    sent_by         = Column(String(150), nullable=False)
    delivery_status = Column(
        Enum("pending", "sent", "delivered", "failed"),
        default="pending", nullable=False,
    )
    sent_at         = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="email_logs")


# ─────────────────────────────────────────────────────────────────────────────
# 14. ACTIVITY_LOGS
# ─────────────────────────────────────────────────────────────────────────────
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    entity_type = Column(String(50))
    entity_id   = Column(Integer)
    action      = Column(String(100), nullable=False)
    description = Column(Text)
    ip_address  = Column(String(45))
    created_at  = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="activity_logs")


# ─────────────────────────────────────────────────────────────────────────────
# 15. NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String(200), nullable=False)
    message     = Column(Text, nullable=False)
    entity_type = Column(String(50))
    entity_id   = Column(Integer)
    is_read     = Column(Boolean, default=False, nullable=False)
    created_at  = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
