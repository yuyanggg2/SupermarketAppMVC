const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const Product = require('../model/Product');

// ---------------------------
// CUSTOMER CART ROUTES
// ---------------------------

// Add to cart
router.post('/add-to-cart/:id', productController.addToCart);

// Update quantity
router.post('/cart/update/:id', productController.updateCartItem);

// Delete cart item
router.post('/cart/delete/:id', productController.deleteCartItem);

// Search products
router.post('/search', (req, res) => {
  const keyword = req.body.keyword.toLowerCase();

  Product.getAll(products => {
    const filtered = products.filter(p =>
      p.productName.toLowerCase().includes(keyword)
    );
    res.render('shopping', { products: filtered });
  });
});

// ---------------------------
// ADMIN ROUTES
// ---------------------------

// View all users
router.get('/view-users', userController.getAllUsers);

// Update user role
router.post('/editrole/:id', userController.updateRole);

// Delete user
router.post('/deleteuser/:id', userController.deleteUser);



router.post('/cart/actions', productController.cartActions);

// Show product details + reviews
router.get('/product/:id', productController.viewProduct);

// Add rating + review
router.post('/product/:id/addReview', productController.addReview);
module.exports = router;