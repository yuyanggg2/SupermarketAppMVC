const db = require('../db');

exports.viewPurchaseHistory = (req, res) => {
  const userId = req.session.user.id;

  const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) throw err;

    results.forEach(o => {
      o.total = parseFloat(o.total);
    });

    res.render('purchaseHistory', { orders: results });
  });
};

exports.viewOrderDetails = (req, res) => {
  const orderId = req.params.id;

  const sqlOrder = `SELECT * FROM orders WHERE id = ?`;
  const sqlItems = `SELECT * FROM order_items WHERE order_id = ?`;

  db.query(sqlOrder, [orderId], (err, orderResult) => {
    if (err) throw err;

    if (orderResult.length === 0) {
      return res.send("Order not found");
    }

    const order = orderResult[0];
    order.total = parseFloat(order.total);

    db.query(sqlItems, [orderId], (err, itemsResult) => {
      if (err) throw err;

      res.render('orderDetails', {
        orderId,
        order,
        items: itemsResult
      });
    });
  });
}