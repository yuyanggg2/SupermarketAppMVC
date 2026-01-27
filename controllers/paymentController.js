// controllers/paymentController.js
const QRCode = require("qrcode");
const db = require("../db"); 

// 
exports.showNetsQR = async (req, res) => {
  const { orderId } = req.params;

 
  const [rows] = await db.query("SELECT * FROM orders WHERE order_id = ?", [orderId]);
  if (rows.length === 0) return res.status(404).send("Order not found");

  const order = rows[0];


  const payload = `NETSQR|orderId=${orderId}|amount=${order.total_amount}|currency=SGD|merchant=SupermarketAppMVC`;


  const qrDataUrl = await QRCode.toDataURL(payload, { width: 260, margin: 1 });

  res.render("netsPay", {
    order,
    qrDataUrl,
    payload, 
  });
};


exports.confirmPaid = async (req, res) => {
  const { orderId } = req.params;

  await db.query("UPDATE orders SET status = 'PAID' WHERE order_id = ?", [orderId]);


  if (req.session) req.session.cart = [];

  res.redirect(`/orders/success/${orderId}`);
};


exports.getPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const [rows] = await db.query("SELECT status FROM orders WHERE order_id = ?", [orderId]);
  if (rows.length === 0) return res.status(404).json({ ok: false });

  res.json({ ok: true, status: rows[0].status });
};
