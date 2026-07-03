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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
