# UTS PPLOS A - 2410511023
# Sistem Pemesanan UMKM (Mini E-Commerce)

## Identitas
- **Nama:** Nafisa Intan Alfira
- **NIM:** 2410511023
- **Kelas:** A

## Cara Menjalankan

### 1. Auth Service (Port 3001)
```bash
cd services/auth-service
npm install
node src/index.js
```

### 2. Product Service (Port 3002)
```bash
cd services/product-service
php artisan serve --port=3002
```

### 3. Order Service (Port 3003)
```bash
cd services/order-service
node src/index.js
```

### 4. API Gateway (Port 3000)
```bash
cd gateway
node index.js
```

## Peta Endpoint

### Auth Service (`/api/auth`)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/profile | Profil user |
| GET | /api/auth/github | Login GitHub OAuth |

### Product Service (`/api/products`)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | /api/products | List produk |
| POST | /api/products | Tambah produk |
| GET | /api/products/{id} | Detail produk |
| PUT | /api/products/{id} | Update produk |
| DELETE | /api/products/{id} | Hapus produk |
| GET | /api/categories | List kategori |
| POST | /api/categories | Tambah kategori |

### Order Service (`/api/orders`)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /api/orders | Buat pesanan |
| GET | /api/orders | List pesanan saya |
| GET | /api/orders/{id} | Detail pesanan |
| PATCH | /api/orders/{id}/status | Update status |

## Arsitektur
Client → API Gateway (3000)
├── /api/auth    → Auth Service (3001) - Node.js + MySQL
├── /api/products → Product Service (3002) - Laravel + MySQL
└── /api/orders  → Order Service (3003) - Node.js + MongoDB

## Demo Video
[Link YouTube](ISI_LINK_VIDEO)

## Stack Teknologi
- Auth Service: Node.js, Express, JWT, GitHub OAuth, MySQL
- Product Service: Laravel 12, MySQL
- Order Service: Node.js, Express, MongoDB
- API Gateway: Node.js, Express, http-proxy-middleware

## Arsitektur Sistem
Sistem terdiri dari 3 microservice independen dan 1 API Gateway.
Setiap service memiliki database terpisah untuk menjaga loose coupling.