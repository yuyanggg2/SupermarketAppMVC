const db = require('../db');

// -------------------------------
// VIEW ALL USERS (ADMIN ONLY)
// -------------------------------
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.render('viewusers', { 
     users: results, 
     currentUserId: req.session.user.id 
});

  });
};

// -------------------------------
// LOGIN USER
// -------------------------------
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

  connection.query(sql, [email, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      req.session.user = results[0];

      if (results[0].role === 'admin') {
        return res.redirect('/');    // Admin → homepage
      } else {
        return res.redirect('/shopping');  // User → shopping page
      }
    }

    res.send('Invalid login');
  });
};

// -------------------------------
// LOGOUT
// -------------------------------
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// -------------------------------
// UPDATE USER ROLE (ADMIN ACTION)
// -------------------------------
exports.updateRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  const sql = `UPDATE users SET role = ? WHERE id = ?`;

  connection.query(sql, [role, userId], (err, result) => {
    if (err) throw err;

    res.redirect('/viewusers');
  });
};

// -------------------------------
// DELETE USER (ADMIN ONLY)
// -------------------------------
exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const sql = `DELETE FROM users WHERE id = ?`;

  connection.query(sql, [userId], (err) => {
    if (err) throw err;
    res.redirect('/view-users');
  });
};
