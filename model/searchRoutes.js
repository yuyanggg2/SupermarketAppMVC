const express = require('express');
const router = express.Router();
const Product = require('../model/Product');

router.post('/search', (req, res) => {
  const keyword = req.body.keyword.toLowerCase();

  Product.getAll(products => {
    const filtered = products.filter(p =>
      p.productName.toLowerCase().includes(keyword)
    );
    res.render('shopping', { products: filtered });
  });
});

module.exports = router;
