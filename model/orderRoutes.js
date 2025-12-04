const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/purchaseHistory', orderController.viewPurchaseHistory);
router.get('/orderDetails/:id', orderController.viewOrderDetails);

module.exports = router;
