const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    items: [orderItemSchema],
    total_price: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shipping_address: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);