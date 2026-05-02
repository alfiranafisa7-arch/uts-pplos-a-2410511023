const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

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
    pathRewrite: { '^/api/auth': '' },
    proxyTimeout: 5000,
    timeout: 5000,
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Auth service tidak dapat dijangkau' });
        }
    }
}));

// Product routes — public (GET) tidak perlu JWT, yang lain perlu
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') return next();
    verifyToken(req, res, next);
}, createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '/api/products' },
    proxyTimeout: 5000,
    timeout: 5000,
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Product service tidak dapat dijangkau' });
        }
    }
}));

app.use('/api/categories', (req, res, next) => {
    if (req.method === 'GET') return next();
    verifyToken(req, res, next);
}, createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/categories': '/api/categories' },
    proxyTimeout: 5000,
    timeout: 5000,
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Product service tidak dapat dijangkau' });
        }
    }
}));

// Order routes — semua perlu JWT
app.use('/api/orders', verifyToken, createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/api/orders' },
    proxyTimeout: 5000,
    timeout: 5000,
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Order service tidak dapat dijangkau' });
        }
    }
}));

app.listen(process.env.PORT, () => {
    console.log(`API Gateway running on http://localhost:${process.env.PORT}`);
});