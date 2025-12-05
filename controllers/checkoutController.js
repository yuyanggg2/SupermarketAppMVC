const db = require('../db');

exports.processCheckout = (req, res) => {

  // MUST BE LOGGED IN
  if (!req.session.user) {
    req.flash("error", "Please login to checkout");
    return res.redirect("/login");
  }

  const user_id = req.session.user.id;

  // ⭐ ALWAYS destructure body FIRST
  const { fullname, address, paymentMethod, deliveryMethod } = req.body;

  // Delivery fee logic
  let deliveryFee = (deliveryMethod === "delivery") ? 5 : 0;

  // Calculate total
  let total = 0;
  req.session.cart.forEach(item => {
    total += item.price * item.quantity;
  });
  total += deliveryFee;

  // =======================================
  // 1️⃣ INSERT INTO ORDERS TABLE
  // =======================================
  const sql = `
    INSERT INTO orders
    (user_id, fullname, address, payment_method, delivery_method, delivery_fee, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, "Unpaid")
  `;

  db.query(
    sql,
    [user_id, fullname, address, paymentMethod, deliveryMethod, deliveryFee, total],
    (err, result) => {
      if (err) throw err;

      const order_id = result.insertId;


      // =======================================
      // 2️⃣ INSERT EACH ORDER ITEM
      // =======================================
      const itemSql = `
        INSERT INTO order_items
        (order_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?)
      `;

      req.session.cart.forEach(item => {
        db.query(itemSql, [order_id, item.productName, item.quantity, item.price]);
      });


      // =======================================
      // 3️⃣ UPDATE PRODUCT STOCK (THE IMPORTANT PART)
      // =======================================
      const stockSql = `
        UPDATE products
        SET quantity = quantity - ?
        WHERE productName = ?
      `;

      req.session.cart.forEach(item => {
        db.query(stockSql, [item.quantity, item.productName], (err) => {
          if (err) console.error("Stock update error:", err);
        });
      });


      // =======================================
      // 4️⃣ SAVE SUMMARY FOR SUCCESS PAGE
      // =======================================
      req.session.lastOrder = {
        order_id,
        fullname,
        address,
        paymentMethod,
        deliveryMethod,
        deliveryFee,
        total,
        items: [...req.session.cart]   
      };


      // =======================================
      // 5️⃣ CLEAR CART
      // =======================================
      req.session.cart = [];


      // =======================================
      // 6️⃣ REDIRECT
      // =======================================
      res.redirect("/checkoutSuccess");
    }
  );
};
