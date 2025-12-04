
const mysql = require('mysql2'); 

// Create connection pool (recommended to avoid closed connections)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Republic_C207',        
  database: 'c372_supermarketdb', 
});

// Test connection
db.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ MySQL connected!');
    conn.release();
  }
});

// Export

module.exports = db
