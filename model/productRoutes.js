const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get("/product/:id", productController.viewProduct);


// Add review
router.post("/product/:id/addReview", productController.addReview);

module.exports = router;
