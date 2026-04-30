const Order = require('../models/Order');
const axios = require('axios');

exports.createOrder = async (req, res) => {
    try {
        const { items, shipping_address, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Items tidak boleh kosong' });
        }

        let total_price = 0;
        const orderItems = [];

        for (const item of items) {
            try {
                const { data: product } = await axios.get(
                    `${process.env.PRODUCT_SERVICE_URL}/products/${item.product_id}`
                );

                if (!product.is_active) {
                    return res.status(400).json({ message: `Produk ${product.name} tidak aktif` });
                }

                if (product.stock < item.quantity) {
                    return res.status(422).json({ message: `Stok ${product.name} tidak cukup` });
                }

                const subtotal = product.price * item.quantity;
                total_price += subtotal;

                orderItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    subtotal
                });

                // Kurangi stok
                await axios.post(
                    `${process.env.PRODUCT_SERVICE_URL}/products/${item.product_id}/reduce-stock`,
                    { quantity: item.quantity }
                );

            } catch (err) {
                if (err.response && err.response.status === 404) {
                    return res.status(404).json({ message: `Produk ID ${item.product_id} tidak ditemukan` });
                }
                throw err;
            }
        }

        const order = await Order.create({
            user_id: req.user.id,
            items: orderItems,
            total_price,
            shipping_address,
            notes
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const total = await Order.countDocuments({ user_id: req.user.id });
        const orders = await Order.find({ user_id: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page);

        res.json({
            data: orders,
            page,
            per_page,
            total,
            total_pages: Math.ceil(total / per_page)
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatus = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page);

        res.json({ data: orders, page, per_page, total, total_pages: Math.ceil(total / per_page) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};