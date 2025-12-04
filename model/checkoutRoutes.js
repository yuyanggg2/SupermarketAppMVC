const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Checkout flow
router.get('/checkout', checkoutController.showCheckoutPage);
router.post('/checkout', checkoutController.processCheckout);

// User views own orders
router.get('/my-orders', checkoutController.myOrders);

// Admin views all orders
router.get('/admin/orders', checkoutController.adminOrders);

module.exports = router;
