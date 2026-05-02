// Order Service - Node.js + MongoDB
// Port: 3003
// Database: order_db (MongoDB)

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'Order Service OK' });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.error('MongoDB error:', err));