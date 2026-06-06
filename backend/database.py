"""
VendorBridge ERP — database.py
Handles MySQL connection, engine creation, session factory, and declarative base.
Run `python database.py` to verify the connection before starting the app.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ── Connection string ─────────────────────────────────────────────────────────
# Format: mysql+pymysql://<user>:<password>@<host>:<port>/<database>
# Update credentials as needed (or load from environment variables in production)
DATABASE_URL = "mysql+pymysql://root:priya@localhost:3306/vendorbridge"

# ── Engine ────────────────────────────────────────────────────────────────────
# pool_pre_ping=True drops stale connections automatically
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,          # Set True to log all SQL to stdout during development
)

# ── Session factory ───────────────────────────────────────────────────────────
# autocommit / autoflush both off — we manage transactions manually per request
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# ── Declarative base ──────────────────────────────────────────────────────────
# All ORM models in models.py inherit from this class
Base = declarative_base()


# ── Dependency (FastAPI) ──────────────────────────────────────────────────────
def get_db():
    """
    Yields a database session for the duration of a single request.
    Automatically closes the session when the request is complete.

    Usage in a route:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Quick connection test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print("✅  Database connection successful — VendorBridge is ready.")
    except Exception as e:
        print(f"❌  Database connection failed:\n    {e}")
