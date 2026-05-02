# Arsitektur Sistem UMKM

## Service
- Auth Service (port 3001) - JWT + GitHub OAuth
- Product Service (port 3002) - Laravel CRUD
- Order Service (port 3003) - Node.js + MongoDB
- API Gateway (port 8000) - Single entry point

## Database
- auth_db (MySQL) - users, refresh_tokens
- product_db (MySQL) - products, categories
- order_db (MongoDB) - orders

## Komunikasi Antar Service
- Client → API Gateway (port 8000)
- API Gateway → Auth Service (port 3001)
- API Gateway → Product Service (port 3002)
- API Gateway → Order Service (port 3003)
- Order Service → Product Service (cek stok)