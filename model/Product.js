
const db = require('../db');  


module.exports = {
  getAll: (callback) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) throw err;
      callback(results);
    });
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
      if (err) throw err;
      callback(results[0]);
    });
  },

  add: (product, callback) => {
    db.query('INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)',
      [product.name, product.price, product.quantity],
      (err, result) => {
        if (err) throw err;
        callback(result);
      }
    );
  },

  update: (id, product, callback) => {
    db.query('UPDATE products SET name=?, price=?, quantity=? WHERE id=?',
      [product.name, product.price, product.quantity, id],
      (err, result) => {
        if (err) throw err;
        callback(result);
      }
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM products WHERE id=?', [id], (err, result) => {
      if (err) throw err;
      callback(result);
    });
  }
};