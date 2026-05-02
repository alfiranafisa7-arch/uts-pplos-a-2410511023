# Laporan UTS - Sistem Pemesanan UMKM

## Identitas
- Nama  : Nafisa Intan Alfira
- NIM   : 2410511023
- Kelas : A

## Justifikasi Pemisahan Service

### Mengapa dipisah menjadi microservice?

**Auth Service** dipisah karena autentikasi adalah domain tersendiri
yang bisa digunakan oleh semua service lain tanpa duplikasi kode.

**Product Service** dipisah karena manajemen produk memiliki logika
bisnis tersendiri (stok, kategori, harga) yang independen dari pesanan.

**Order Service** dipisah karena proses pemesanan memiliki lifecycle
tersendiri (pending, confirmed, shipped, delivered, cancelled).

### Keuntungan vs Monolitik
- Setiap service bisa di-deploy dan di-scale secara independen
- Kegagalan satu service tidak mempengaruhi service lain
- Tim berbeda bisa mengerjakan service berbeda secara paralel

## Peta Routing API Gateway

| Path | Service Tujuan | Port |
|------|---------------|------|
| /api/auth/* | Auth Service | 3001 |
| /api/products/* | Product Service | 3002 |
| /api/categories/* | Product Service | 3002 |
| /api/orders/* | Order Service | 3003 |