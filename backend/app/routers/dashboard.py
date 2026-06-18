from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.models import Product, Customer, Order
from app.schemas.schemas import DashboardStats, ProductResponse

router = APIRouter()

LOW_STOCK_THRESHOLD = 10


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()

    low_stock = db.query(Product).filter(
        Product.quantity <= LOW_STOCK_THRESHOLD
    ).order_by(Product.quantity.asc()).limit(10).all()

    return DashboardStats(
        total_products=total_products or 0,
        total_customers=total_customers or 0,
        total_orders=total_orders or 0,
        total_revenue=float(total_revenue or 0),
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock],
    )
