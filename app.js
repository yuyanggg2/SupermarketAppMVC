const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const app = express();

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } 
}));

// Make session user available in ALL EJS pages
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });
const db = require('./db');

// Set up view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

// enable form processing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(flash());

const userController = require('./controllers/userController');
const productController = require('./controllers/productController');

const productRoutes = require('./model/productRoutes');
app.use(productRoutes);

const searchRoutes = require('./model/searchRoutes');
app.use('/', searchRoutes);

const cartRoutes = require('./model/cartRoutes'); 
app.use(cartRoutes);

const checkoutRoutes = require('./model/checkoutRoutes');
app.use('/', checkoutRoutes);

const adminRoutes = require('./model/adminRoutes');
app.use('/', adminRoutes);


const orderRoutes = require('./model/orderRoutes');
app.use(orderRoutes);

// ⚠️ ALWAYS LAST
const customerFeedbackRoutes = require('./model/feedbackRoutes');
app.use(customerFeedbackRoutes);

// Middleware to check if user is logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error', 'Please log in to view this resource');
    return res.redirect('/login');
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    req.flash('error', 'Access denied');
    return res.redirect('/shopping');
};

// Make these accessible to route files
app.locals.checkAuthenticated = checkAuthenticated;
app.locals.checkAdmin = checkAdmin;

// Middleware for form validation
const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact, role } = req.body;

    if (!username || !email || !password || !address || !contact || !role) {
        return res.status(400).send('All fields are required.');
    }
    
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 characters');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

// Define routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/inventory', checkAuthenticated, checkAdmin, (req, res) => {
    db.query('SELECT * FROM products', (error, results) => {
        if (error) {
            console.error("DB ERROR /inventory:", error);
            return res.status(500).send("DB ERROR");
        }
        res.render('inventory', { products: results, user: req.session.user });
    });
});

app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});

app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    db.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            console.error("DB ERROR /register:", err);
            return res.status(500).send("DB ERROR");
        }
        req.flash('success', 'Registration successful!');
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("DB ERROR /login:", err);
            return res.status(500).send("DB ERROR");
        }

        if (results.length > 0) {
            req.session.user = results[0];
            req.flash('success', 'Login successful!');
            return (req.session.user.role === 'user')
                ? res.redirect('/shopping')
                : res.redirect('/inventory');
        } else {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
    });
});

app.get('/shopping', checkAuthenticated, (req, res) => {
    db.query('SELECT * FROM products', (error, results) => {
        if (error) {
            console.error("DB ERROR /shopping:", error);
            return res.status(500).send("DB ERROR");
        }
        res.render('shopping', { user: req.session.user, products: results });
    });
});

app.post('/add-to-cart/:id', checkAuthenticated, (req, res) => {
    const productId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity) || 1;

    db.query('SELECT * FROM products WHERE id = ?', [productId], (error, results) => {
        if (error) {
            console.error("DB ERROR /add-to-cart:", error);
            return res.status(500).send("DB ERROR");
        }

        if (results.length > 0) {
            const product = results[0];

            if (!req.session.cart) {
                req.session.cart = [];
            }

            const existingItem = req.session.cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                req.session.cart.push({
                    id: product.productId,
                    productName: product.productName,
                    price: product.price,
                    quantity: quantity,
                    image: product.image
                });
            }

            return res.redirect('/cart');
        } else {
            return res.status(404).send("Product not found");
        }
    });
});

app.get('/cart', checkAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart, user: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/product/:id', checkAuthenticated, (req, res) => {
    const productId = req.params.id;

    db.query('SELECT * FROM products WHERE id = ?', [productId], (error, results) => {
        if (error) {
            console.error("DB ERROR /product:", error);
            return res.status(500).send("DB ERROR");
        }

        if (results.length > 0) {
            return res.render('product', { product: results[0], user: req.session.user });
        } else {
            return res.status(404).send('Product not found');
        }
    });
});

// ---- LISTEN SERVER ----
const HOST = "127.0.0.1";
const PORT = 3000;

app.listen(PORT, HOST, () => {
  console.log(`✔ Server listening on http://${HOST}:${PORT}`);
});
