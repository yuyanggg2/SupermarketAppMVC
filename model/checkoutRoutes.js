const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkoutController");

// GET checkout (Render page)
router.get("/checkout", (req, res) => {
  res.render("checkout", { cart: req.session.cart || [] });
});

// POST checkout (Process order)
router.post("/checkout", checkoutController.processCheckout);
// ✔ Checkout success page
router.get("/checkoutSuccess", (req, res) => {
  res.render("checkoutSuccess", {
    order: req.session.lastOrder,
    user: req.session.user   
  });
});



module.exports = router;

