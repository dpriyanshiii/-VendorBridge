"""
VendorBridge ERP — schemas.py
Pydantic schemas defining the shape of data going IN and OUT of the API.
Follows the pattern: <Model>Create  →  what the client sends
                     <Model>Response →  what the API returns
All Response schemas include `model_config = ConfigDict(from_attributes=True)`
so SQLAlchemy ORM objects can be serialised directly.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str                          # raw password — hashed in the route
    role: str                              # 'admin' | 'procurement_officer' | 'manager' | 'vendor'


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─────────────────────────────────────────────────────────────────────────────
# VENDORS
# ─────────────────────────────────────────────────────────────────────────────
class VendorCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    gst_number: str
    category: Optional[str] = None
    status: str = "active"                 # 'active' | 'inactive' | 'blacklisted'


class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[float] = None


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    gst_number: str
    category: Optional[str]
    status: str
    rating: Optional[float]
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# RFQ ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class RFQItemCreate(BaseModel):
    item_name: str
    description: Optional[str] = None
    quantity: Decimal
    unit: Optional[str] = None


class RFQItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rfq_id: int
    item_name: str
    description: Optional[str]
    quantity: Decimal
    unit: Optional[str]
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# RFQ ATTACHMENTS
# ─────────────────────────────────────────────────────────────────────────────
class RFQAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rfq_id: int
    file_name: str
    file_path: str
    file_type: Optional[str]
    uploaded_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# RFQ VENDORS (invitation junction)
# ─────────────────────────────────────────────────────────────────────────────
class RFQVendorCreate(BaseModel):
    vendor_id: int


class RFQVendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rfq_id: int
    vendor_id: int
    invitation_status: str
    invited_at: datetime
    responded_at: Optional[datetime]


# ─────────────────────────────────────────────────────────────────────────────
# RFQ
# ─────────────────────────────────────────────────────────────────────────────
class RFQCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    items: List[RFQItemCreate] = []
    vendor_ids: List[int] = []             # vendors to invite immediately


class RFQUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None           # 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled'
    deadline: Optional[date] = None


class RFQResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rfq_number: str
    title: str
    description: Optional[str]
    status: str
    deadline: Optional[date]
    created_by: int
    created_at: datetime
    updated_at: datetime
    items: List[RFQItemResponse] = []
    attachments: List[RFQAttachmentResponse] = []
    rfq_vendors: List[RFQVendorResponse] = []


# ─────────────────────────────────────────────────────────────────────────────
# QUOTATION ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class QuotationItemCreate(BaseModel):
    rfq_item_id: int
    unit_price: Decimal
    quantity: Decimal
    total_price: Decimal


class QuotationItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quotation_id: int
    rfq_item_id: int
    unit_price: Decimal
    quantity: Decimal
    total_price: Decimal
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# QUOTATIONS
# ─────────────────────────────────────────────────────────────────────────────
class QuotationCreate(BaseModel):
    rfq_id: int
    total_amount: Decimal
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    items: List[QuotationItemCreate] = []


class QuotationUpdate(BaseModel):
    total_amount: Optional[Decimal] = None
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None           # 'submitted' | 'under_review' | 'accepted' | 'rejected'


class QuotationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quotation_number: str
    rfq_id: int
    vendor_id: int
    total_amount: Decimal
    delivery_days: Optional[int]
    notes: Optional[str]
    status: str
    submitted_at: datetime
    updated_at: datetime
    items: List[QuotationItemResponse] = []
    vendor: Optional[VendorResponse] = None


# ─────────────────────────────────────────────────────────────────────────────
# APPROVALS
# ─────────────────────────────────────────────────────────────────────────────
class ApprovalCreate(BaseModel):
    quotation_id: int
    approval_level: int = 1


class ApprovalAction(BaseModel):
    status: str                            # 'approved' | 'rejected'
    remarks: Optional[str] = None


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quotation_id: int
    approver_id: int
    status: str
    remarks: Optional[str]
    approval_level: int
    actioned_at: Optional[datetime]
    created_at: datetime
    approver: Optional[UserResponse] = None


# ─────────────────────────────────────────────────────────────────────────────
# PO ITEMS
# ─────────────────────────────────────────────────────────────────────────────
class POItemCreate(BaseModel):
    item_name: str
    quantity: Decimal
    unit: Optional[str] = None
    unit_price: Decimal
    total_price: Decimal


class POItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    po_id: int
    item_name: str
    quantity: Decimal
    unit: Optional[str]
    unit_price: Decimal
    total_price: Decimal
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# PURCHASE ORDERS
# ─────────────────────────────────────────────────────────────────────────────
class PurchaseOrderCreate(BaseModel):
    quotation_id: int
    expected_delivery: Optional[date] = None
    items: List[POItemCreate] = []


class PurchaseOrderUpdate(BaseModel):
    status: Optional[str] = None           # 'created' | 'sent' | 'acknowledged' | 'fulfilled' | 'cancelled'
    expected_delivery: Optional[date] = None


class POResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    po_number: str
    quotation_id: int
    vendor_id: int
    created_by: int
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    status: str
    expected_delivery: Optional[date]
    created_at: datetime
    updated_at: datetime
    items: List[POItemResponse] = []
    vendor: Optional[VendorResponse] = None


# ─────────────────────────────────────────────────────────────────────────────
# INVOICES
# ─────────────────────────────────────────────────────────────────────────────
class InvoiceCreate(BaseModel):
    po_id: int
    tax_percent: Decimal = Decimal("0.00")
    due_date: Optional[date] = None


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None           # 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    due_date: Optional[date] = None


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    po_id: int
    vendor_id: int
    subtotal: Decimal
    tax_percent: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    status: str
    due_date: Optional[date]
    issued_at: Optional[datetime]
    created_at: datetime
    vendor: Optional[VendorResponse] = None


# ─────────────────────────────────────────────────────────────────────────────
# INVOICE EMAILS
# ─────────────────────────────────────────────────────────────────────────────
class InvoiceEmailSend(BaseModel):
    sent_to: EmailStr                      # override recipient; defaults to vendor email in route


class InvoiceEmailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_id: int
    sent_to: str
    sent_by: str
    delivery_status: str
    sent_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# ACTIVITY LOGS
# ─────────────────────────────────────────────────────────────────────────────
class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    entity_type: Optional[str]
    entity_id: Optional[int]
    action: str
    description: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    user: Optional[UserResponse] = None


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    is_read: bool
    created_at: datetime


class NotificationMarkRead(BaseModel):
    ids: List[int]                         # list of notification IDs to mark as read


# ─────────────────────────────────────────────────────────────────────────────
# QUOTATION COMPARISON  (helper schema — not a DB table)
# ─────────────────────────────────────────────────────────────────────────────
class QuotationComparisonRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    quotation_id: int
    quotation_number: str
    vendor_id: int
    vendor_name: str
    vendor_rating: Optional[float]
    total_amount: Decimal
    delivery_days: Optional[int]
    status: str
    is_lowest_price: bool = False


class QuotationComparisonResponse(BaseModel):
    rfq_id: int
    rfq_number: str
    rfq_title: str
    quotations: List[QuotationComparisonRow]


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD SUMMARY  (helper schema — not a DB table)
# ─────────────────────────────────────────────────────────────────────────────
class DashboardSummary(BaseModel):
    pending_approvals: int
    active_rfqs: int
    recent_purchase_orders: List[POResponse]
    recent_invoices: List[InvoiceResponse]
