from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, vendors, rfq, quotations, approvals, purchase_orders, invoices, activity_logs

from database import engine
import models

app = FastAPI(title="VendorBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
app.include_router(rfq.router, prefix="/rfq", tags=["RFQ"])
app.include_router(quotations.router, prefix="/quotations", tags=["Quotations"])
app.include_router(approvals.router, prefix="/approvals", tags=["Approvals"])
app.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["Purchase Orders"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
app.include_router(activity_logs.router, prefix="/activity-logs", tags=["Activity Logs"])

@app.get("/")
def root():
    return {"message": "VendorBridge API is running"}


models.Base.metadata.create_all(bind=engine)