require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-homie-123';

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database opening error: ', err);
});

// Create tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    description TEXT,
    image TEXT,
    seller TEXT,
    is_surplus BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    owner_id INTEGER,
    image TEXT,
    category TEXT,
    rating REAL,
    time TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT,
    price REAL,
    description TEXT,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_price REAL,
    address TEXT,
    status TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    name TEXT,
    price REAL,
    quantity INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Helper for database queries
const query = (sql, params) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const runParam = (sql, params) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existing = await query('SELECT * FROM users WHERE email = ? OR phone = ?', [email || '', phone]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runParam('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', [name, email, phone, hashedPassword]);
    res.json({ message: 'User signed up successfully!', user: { id: result.lastID, name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const rows = await query('SELECT * FROM users WHERE phone = ?', [phone]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid phone number or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid phone number or password', invalid_password: true });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/otp-login', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
  if (otp !== '123456') return res.status(400).json({ error: 'Invalid OTP' });

  try {
    const rows = await query('SELECT * FROM users WHERE phone = ?', [phone]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'No user registered with this phone number' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'OTP Login successful', token, user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during OTP login' });
  }
});

app.get('/api/foods', async (req, res) => {
  try {
    const foods = await query('SELECT * FROM foods ORDER BY createdAt DESC', []);
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching foods' });
  }
});

app.post('/api/foods', async (req, res) => {
  const { name, price, description, image, seller, is_surplus } = req.body;
  try {
    const result = await runParam(
      'INSERT INTO foods (name, price, description, image, seller, is_surplus) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, description, image, seller, is_surplus ? 1 : 0]
    );
    res.json({ message: 'Food item created successfully', food: { id: result.lastID, name, price, description, image, seller, is_surplus: is_surplus ? 1 : 0 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating food item' });
  }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await query('SELECT * FROM restaurants ORDER BY createdAt DESC', []);
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching restaurants' });
  }
});

app.post('/api/restaurants', async (req, res) => {
  const { name, owner_id, image, category, rating, time } = req.body;
  try {
    const result = await runParam(
      'INSERT INTO restaurants (name, owner_id, image, category, rating, time) VALUES (?, ?, ?, ?, ?, ?)',
      [name, owner_id, image, category, rating, time]
    );
    res.json({ message: 'Restaurant created!', restaurant: { id: result.lastID, name, owner_id, image, category, rating, time } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating restaurant' });
  }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const menus = await query('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY createdAt DESC', [req.params.id]);
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching menus' });
  }
});

app.post('/api/restaurants/:id/menu', async (req, res) => {
  const { name, price, description, image } = req.body;
  try {
    const result = await runParam(
      'INSERT INTO menu_items (restaurant_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, name, price, description, image]
    );
    res.json({ message: 'Menu item created!', item: { id: result.lastID, restaurant_id: req.params.id, name, price, description, image } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating menu item' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { user_id, total_price, address, items } = req.body;
  try {
    const orderResult = await runParam(
      'INSERT INTO orders (user_id, total_price, address, status) VALUES (?, ?, ?, ?)',
      [user_id, total_price, address, 'Pending']
    );
    const orderId = orderResult.lastID;

    for (const item of items) {
      await runParam(
        'INSERT INTO order_items (order_id, name, price, quantity) VALUES (?, ?, ?, ?)',
        [orderId, item.name, item.price, item.quantity]
      );
    }

    res.json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error placing order' });
  }
});

app.get('/api/orders', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id query parameter is required' });
  try {
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY createdAt DESC', [user_id]);
    const ordersWithItems = [];
    for (const order of orders) {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      ordersWithItems.push({
        ...order,
        items
      });
    }
    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
