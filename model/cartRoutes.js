const express = require('express');
const router = express.Router();


// ==========================
// UPDATE QUANTITY
// ==========================
router.post('/cart/update', (req, res) => {
  const { productName, quantity } = req.body;

  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.map(item => {
    if (item.productName === productName) {
      item.quantity = parseInt(quantity, 10);
    }
    return item;
  });

  return res.redirect('/cart');  // 
});


// ==========================
// DELETE ITEM
// ==========================
router.post('/cart/delete', (req, res) => {
  const { productName } = req.body;

  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.filter(item => item.productName !== productName);

  return res.redirect('/cart');  // 
});


module.exports = router;
