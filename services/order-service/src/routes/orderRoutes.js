const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getMyOrders);
router.get('/all', auth, orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateStatus);

module.exports = router;