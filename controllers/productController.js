
const Product = require('../model/Product');

exports.listProducts = (req, res) => {
  Product.getAll(products => {
    res.render('product', { products });
  });
};

exports.showAddForm = (req, res) => {
  res.render('addProduct');
};

exports.addProduct = (req, res) => {
  const { name, price, quantity } = req.body;
  Product.add({ name, price, quantity }, () => {
    res.redirect('/products');
  });
};

exports.showEditForm = (req, res) => {
  Product.getById(req.params.id, product => {
    res.render('editProduct', { product });
  });
};

exports.updateProduct = (req, res) => {
  const { name, price, quantity } = req.body;
  Product.update(req.params.id, { name, price, quantity }, () => {
    res.redirect('/products');
  });
};

exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, () => {
    res.redirect('/products');
  });
};


// edits for cart functionality
exports.updateCartItem = (req, res) => {
  const name = req.params.id; 
  const newQty = parseInt(req.body.quantity);

  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => {
      if (item.productName === name) {
        item.quantity = newQty;
      }
      return item;
    });
  }

  res.redirect('/cart');
};

// delete cart item
exports.deleteCartItem = (req, res) => {
  const name = req.params.id;

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productName !== name);
  }

  res.redirect('/cart');
};

// addToCart function (use productName as identifier)
exports.addToCart = (req, res) => {
  const { productName, price, image } = req.body;

  if (!req.session.cart) req.session.cart = [];

  const existingItem = req.session.cart.find(item => item.productName === productName);

  if (existingItem) {
    existingItem.quantity += 1; 
  } else {
    const newItem = {
      productName,
      price: parseFloat(price),
      quantity: 1,
      image
    };
    req.session.cart.push(newItem);
  }

  res.redirect('/cart');
};

exports.cartActions = (req, res) => {
    const action = req.body.action;
    const selected = req.body.selectedItems;

    if (!selected) {
        return res.send("No items selected.");
    }

    let selectedItems = Array.isArray(selected) ? selected : [selected];

    // DELETE SELECTED
    if (action === "delete") {
        req.session.cart = req.session.cart.filter(item =>
            !selectedItems.includes(item.productName)
        );
        return res.redirect('/cart');
    }

    // CHECKOUT SELECTED
    if (action === "checkout") {
        req.session.selectedCheckout = req.session.cart.filter(item =>
            selectedItems.includes(item.productName)
        );
        return res.redirect('/checkout-selected');
    }
};

const db = require('../db');

exports.viewProduct = (req, res) => {
    const productId = req.params.id;

    const productSql = `SELECT * FROM products WHERE id = ?`;
    const reviewSql = `
        SELECT r.rating, r.review_text, r.created_at, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC`;

    const avgSql = `
        SELECT AVG(rating) AS avgRating, COUNT(*) AS totalReviews
        FROM reviews WHERE product_id = ?`;

    db.query(productSql, [productId], (err, productResult) => {
        if (err) throw err;

        db.query(reviewSql, [productId], (err, reviewResult) => {
            if (err) throw err;

            db.query(avgSql, [productId], (err, avgResult) => {
                if (err) throw err;

                res.render("productDetails", {
                    product: productResult[0],
                    reviews: reviewResult,
                    avgRating: avgResult[0].avgRating || 0,
                    reviewCount: avgResult[0].totalReviews || 0
                });
            });
        });
    });
};

exports.addReview = (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user.id;
    const { rating, review_text } = req.body;

    // Prevent duplicate reviews
    const checkSql = `SELECT * FROM reviews WHERE user_id = ? AND product_id = ?`;

    db.query(checkSql, [userId, productId], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            return res.send("⚠️ You already reviewed this product.");
        }

        const insertSql = `
            INSERT INTO reviews (product_id, user_id, rating, review_text)
            VALUES (?, ?, ?, ?)
        `;
        
        db.query(insertSql, [productId, userId, rating, review_text], err => {
            if (err) throw err;
            res.redirect("/product/" + productId);
        });
    });
};

