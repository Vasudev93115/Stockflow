# StockFlow — Inventory & Order Management System

A production-ready full-stack inventory and order management system built with FastAPI, React, and PostgreSQL — fully containerized with Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, vanilla CSS (no UI framework) |
| **Backend** | Python 3.12 + FastAPI + SQLAlchemy |
| **Database** | PostgreSQL 16 |
| **Containerization** | Docker + Docker Compose |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway / Render |

---

## Features

- **Products** — Full CRUD with SKU uniqueness enforcement, price & stock tracking
- **Customers** — Add/view/delete with unique email validation
- **Orders** — Create multi-item orders with automatic stock deduction; cancel with stock restoration
- **Dashboard** — Live stats: total products, customers, orders, revenue, and low-stock alerts
- **Business Rules** — Insufficient stock blocks order creation; total calculated server-side
- **Docker** — Three-service Compose setup: frontend, backend, PostgreSQL with named volumes

---

## Quick Start (Docker)

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/stockflow.git
cd stockflow
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set a secure `POSTGRES_PASSWORD`.

### 3. Run with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (Redoc) | http://localhost:8000/redoc |

### 4. Stop

```bash
docker compose down
# To also remove database volume:
docker compose down -v
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL="postgresql://stockflow:password@localhost:5432/stockflow_db"

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set API URL
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products/` | Create product |
| `GET` | `/products/` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/customers/` | Create customer |
| `GET` | `/customers/` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders/` | Create order (reduces stock) |
| `GET` | `/orders/` | List all orders |
| `GET` | `/orders/{id}` | Get order with items |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Summary stats + low stock items |

### Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |

---

## Deployment Guide

### Backend — Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend` folder (or set root directory to `backend/`)
4. Add a PostgreSQL plugin in Railway
5. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
6. Railway auto-detects the Dockerfile and deploys

### Backend — Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo, set root to `backend/`
3. Runtime: Docker
4. Add a PostgreSQL database in Render
5. Set `DATABASE_URL` from the Render Postgres connection string
6. Deploy

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
7. Deploy

---

## Docker Hub

```bash
# Build and push backend image
docker build -t YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest

# Build and push frontend image
docker build \
  --build-arg VITE_API_URL=https://your-backend-url \
  -t YOUR_DOCKERHUB_USERNAME/stockflow-frontend:latest \
  ./frontend
docker push YOUR_DOCKERHUB_USERNAME/stockflow-frontend:latest
```

---

## Business Rules Implemented

| Rule | Implementation |
|---|---|
| Unique SKU | Database unique constraint + 400 error on duplicate |
| Unique customer email | Database unique constraint + 400 error on duplicate |
| Non-negative quantity | Pydantic validator + database constraint |
| Stock check before order | Row-level lock (`FOR UPDATE`) before deducting |
| Auto stock reduction | Atomic transaction in `POST /orders/` |
| Auto total calculation | Server computes `unit_price × qty` per item |
| Stock restoration on cancel | `DELETE /orders/{id}` restores all item quantities |

---

## Project Structure

```
stockflow/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS + lifespan
│   │   ├── database/
│   │   │   └── connection.py    # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── models.py        # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Shell + routing
│   │   ├── App.css              # Full design system
│   │   ├── lib/api.js           # Typed API client
│   │   ├── hooks/useToast.js
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header
│   │   │   └── ui/              # Modal, Toast, EmptyState
│   │   └── pages/               # Dashboard, Products, Customers, Orders
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Submission Checklist

- [ ] GitHub repository link
- [ ] Docker Hub image link (`YOUR_USERNAME/stockflow-backend:latest`)
- [ ] Live frontend URL (Vercel)
- [ ] Live backend API URL (Railway/Render)
