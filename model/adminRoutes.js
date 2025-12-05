// ============================
// adminRoutes.js  — FINAL WORKING VERSION
// ============================

const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

// ============================
// 📌 Multer image upload config
// ============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


// ============================
// ⭐ PRODUCT MANAGEMENT
// ============================

// ✔ Inventory list (ADMIN PRODUCT DASHBOARD)
router.get('/inventory', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) throw err;
    res.render('inventory', { products: results, user: req.session.user });
  });
});


// ✔ Add product (GET)
router.get('/addProduct', (req, res) => {
  res.render('addProduct', { user: req.session.user });
});


// ✔ Add product (POST)
router.post('/addProduct', upload.single('image'), (req, res) => {
  const { name, quantity, price } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO products (productName, quantity, price, image)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, quantity, price, image], err => {
    if (err) throw err;
    res.redirect('/inventory');
  });
});


// ✔ Update product (GET)
router.get('/updateProduct/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;

    if (!results.length) {
      return res.status(404).send("Product not found");
    }

    res.render('updateProduct', { product: results[0], user: req.session.user });
  });
});


// ✔ Update product (POST)
router.post('/updateProduct/:id', upload.single('image'), (req, res) => {
  const { name, quantity, price, currentImage } = req.body;
  let image = currentImage;

  if (req.file) {
    image = req.file.filename;
  }

  const sql = `
    UPDATE products 
    SET productName = ?, quantity = ?, price = ?, image = ?
    WHERE id = ?
  `;

  db.query(sql, [name, quantity, price, image, req.params.id], err => {
    if (err) throw err;
    res.redirect('/inventory');
  });
});


// ✔ Delete product
router.get('/deleteProduct/:id', (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], err => {
    if (err) throw err;
    res.redirect('/inventory');
  });
});


// ============================
// ⭐ USER MANAGEMENT
// ============================

// ✔ View all users  (LOCK ADMIN OWN ROW)
router.get('/viewUsers', (req, res) => {
  db.query('SELECT id, username, email, role FROM users ORDER BY id', (err, results) => {
    if (err) throw err;

    res.render('viewUsers', {
      users: results,
      currentUserId: req.session.user ? req.session.user.id : null,
      user: req.session.user
    });
  });
});


// ✔ Update role (NOT ALLOWED ON SELF)
router.post('/editRole/:id', (req, res) => {
  if (req.session.user.id == req.params.id) {
    return res.redirect('/viewUsers'); // prevent modifying self
  }

  db.query('UPDATE users SET role = ? WHERE id = ?', [req.body.role, req.params.id], err => {
    if (err) throw err;
    res.redirect('/viewUsers');
  });
});


// ✔ Delete user (NOT ALLOWED ON SELF)
router.post('/deleteUser/:id', (req, res) => {
  if (req.session.user.id == req.params.id) {
    return res.redirect('/viewUsers'); // prevent deleting self
  }

  db.query('DELETE FROM users WHERE id = ?', [req.params.id], err => {
    if (err) throw err;
    res.redirect('/viewUsers');
  });
});


// ============================
// ⭐ FEEDBACK
// ============================

router.get('/viewFeedback', (req, res) => {
  db.query('SELECT * FROM feedback ORDER BY created_at DESC', (err, results) => {
    if (err) throw err;

    res.render('adminFeedbackList', {
      feedback: results,
      user: req.session.user
    });
  });
});


// ============================
// EXPORT ROUTER
// ============================

module.exports = router;
