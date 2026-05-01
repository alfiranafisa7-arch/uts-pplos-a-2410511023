const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Rate limiting — 60 request per menit per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: 'Terlalu banyak request, coba lagi nanti' }
});
app.use(limiter);

// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
};

// Health check gateway
app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway OK' });
});

// Auth routes — tidak perlu JWT
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' }
}));

// Product routes — public (GET) tidak perlu JWT, yang lain perlu
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') return next();
    verifyToken(req, res, next);
}, createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '/api/products' }
}));

app.use('/api/categories', (req, res, next) => {
    if (req.method === 'GET') return next();
    verifyToken(req, res, next);
}, createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/categories': '/api/categories' }
}));

// Order routes — semua perlu JWT
app.use('/api/orders', verifyToken, createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/api/orders' }
}));

app.listen(process.env.PORT, () => {
    console.log(`API Gateway running on http://localhost:${process.env.PORT}`);
});