const db = require('../db');

// Show checkout page
exports.showCheckoutPage = (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }

  const total = req.session.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  res.render('checkout', { cart: req.session.cart, total });
};

// Process checkout
exports.processCheckout = (req, res) => {
  const { name, address, paymentMethod } = req.body;
  const cart = req.session.cart;
  const userId = req.session.user.id;

  if (!cart || cart.length === 0) {
    return res.redirect('/cart');
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Insert into orders table (corrected!)
  const sqlOrder = `
    INSERT INTO orders (user_id, fullname, address, total, payment_method, status)
    VALUES (?, ?, ?, ?, ?, 'Unpaid')
  `;

  db.query(sqlOrder, [userId, name, address, total, paymentMethod], (err, result) => {
    if (err) throw err;

    const orderId = result.insertId;

    // Insert order items
    const sqlItems = `
      INSERT INTO order_items (order_id, product_name, price, quantity)
      VALUES (?, ?, ?, ?)
    `;

    cart.forEach(item => {
  // 1) Insert order items
  db.query(sqlItems, [
    orderId,
    item.productName,
    item.price,
    item.quantity
  ]);

  // 2) Decrease inventory
  const sqlUpdateStock = `
    UPDATE products 
    SET quantity = quantity - ?
    WHERE productName = ?
  `;
  
  db.query(sqlUpdateStock, [
    item.quantity,
    item.productName
  ]);
});


    // Clear cart
    res.render('checkoutSuccess', {
  order: {
    id: orderId,
    name,
    address,
    paymentMethod,
    total,
    items: cart
  },
  user: req.session.user   
});

  });
};

//////////////////////////
// USER — view own orders
//////////////////////////
exports.myOrders = (req, res) => {
  const userId = req.session.user.id;

  const sql = `
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, orders) => {
    if (err) throw err;
    res.render('myOrders', { orders });
  });
};

//////////////////////////
// ADMIN — view all orders
//////////////////////////
exports.adminOrders = (req, res) => {
  const sql = `
    SELECT o.*, u.username
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render('adminOrders', { orders: results });
  });
};


exports.showCheckoutSelected = (req, res) => {
    const items = req.session.selectedCheckout || [];

    if (items.length === 0) return res.redirect('/cart');

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    res.render('checkout', { cart: items, total });
};
