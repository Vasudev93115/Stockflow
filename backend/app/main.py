from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import inspect
import os

from app.database.connection import engine, Base
from app.routers import products, customers, orders, dashboard, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        # Automatically reset schema if migrating from old database to multi-user version
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="StockFlow API",
    description="Inventory & Order Management System",
    version="1.0.0",
    lifespan=lifespan,
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])



@app.get("/")
def read_root():
    return {
        "message": "Welcome to StockFlow API",
        "documentation": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "StockFlow API"}

