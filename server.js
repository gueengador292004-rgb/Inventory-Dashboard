const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    price REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validate(body) {
  const name = String(body.name || '').trim();
  const category = String(body.category || 'General').trim() || 'General';
  const price = Number(body.price);
  const quantity = parseInt(body.quantity, 10);
  if (!name) return { error: 'Name is required' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Price must be 0 or more' };
  if (!Number.isInteger(quantity) || quantity < 0) return { error: 'Quantity must be 0 or more' };
  return { name, category, price, quantity };
}

// READ all (with optional search)
app.get('/api/products', (req, res) => {
  const q = `%${(req.query.q || '').trim()}%`;
  const rows = db
    .prepare('SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY id DESC')
    .all(q, q);
  res.json(rows);
});

// READ one
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// CREATE
app.post('/api/products', (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const info = db
    .prepare('INSERT INTO products (name, category, price, quantity) VALUES (?, ?, ?, ?)')
    .run(v.name, v.category, v.price, v.quantity);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
});

// UPDATE
app.put('/api/products/:id', (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const info = db
    .prepare('UPDATE products SET name = ?, category = ?, price = ?, quantity = ? WHERE id = ?')
    .run(v.name, v.category, v.price, v.quantity, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE
app.delete('/api/products/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// DASHBOARD stats
app.get('/api/stats', (req, res) => {
  const totals = db.prepare(`
    SELECT COUNT(*) AS totalProducts,
           COALESCE(SUM(quantity), 0) AS totalUnits,
           COALESCE(SUM(price * quantity), 0) AS totalValue,
           COALESCE(SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END), 0) AS lowStock
    FROM products`).get();
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY count DESC`).all();
  res.json({ ...totals, byCategory });
});

app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));
