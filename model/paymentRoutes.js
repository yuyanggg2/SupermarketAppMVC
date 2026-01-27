const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");

router.get("/netsQR", async (req, res) => {
  const order = req.session.lastOrder;

  if (!order) {
    req.flash("error", "No order found. Please checkout again.");
    return res.redirect("/cart");
  }

  
  const payload = `NETS|ORDER:${order.order_id}|AMT:${Number(order.total).toFixed(2)}|TS:${Date.now()}`;


  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return res.render("netsQR", {
    order,
    qrDataUrl,  
    payload     
  });
});

// 显示 QR 页面
router.get("/netsQR", (req, res) => {
  const order = req.session.lastOrder;
  const qrDataUrl = req.session.qrDataUrl; // 或你生成的 qr

  res.render("netsQR", {
    order,
    qrDataUrl
  });
});

// success 
router.get("/netsTxnSuccessStatus", (req, res) => {
  const order = req.session.lastOrder;
  res.render("netsTxnSuccessStatus", { order });
});

// ❌fail
router.get("/netsTxnFailStatus", (req, res) => {
  const order = req.session.lastOrder;
  res.render("netsTxnFailStatus", { order });
});


module.exports = router;
