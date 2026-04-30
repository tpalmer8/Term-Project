const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fetch = require("node-fetch");

const app = express();
const PORT = 5000;

// Database setup
const dbPath = path.join(__dirname, 'database', 'demographics.db');
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS demographics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  password TEXT,
  bookTitle TEXT,
  ISBN INTEGER,
  rating DECIMAL,
  bookCategory TEXT,
  bookReview TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS tbr (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT,
  author TEXT,
  coverId TEXT,
  openLibraryId TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS readBooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT,
  author TEXT,
  coverId TEXT,
  openLibraryId TEXT,
  rating INTEGER DEFAULT 0,
  readAt TEXT
)
`);

// Add rating column to readBooks if it doesn't exist (for existing databases)
db.run(`
ALTER TABLE readBooks ADD COLUMN rating INTEGER DEFAULT 0
`, (err) => {
  // Ignore error if column already exists
  if (err && !err.message.includes('duplicate column')) {
    console.log('Note: rating column may already exist');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = `
    SELECT id, firstName, lastName
    FROM demographics
    WHERE firstName = ? AND password = ?
  `;

  db.get(query, [username, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (row) {
      res.json({ success: true, message: 'Login successful', user: row });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  });
});

// Create record
app.post('/api/demographics', (req, res) => {
  const { firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview } = req.body;

  const query = `
    INSERT INTO demographics (firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get all records
app.get('/api/demographics', (req, res) => {
  db.all('SELECT * FROM demographics', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update record
app.put('/api/demographics/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview } = req.body;

  const query = `
    UPDATE demographics
    SET firstName = ?, lastName = ?, password = ?, bookTitle = ?, ISBN = ?, rating = ?, bookCategory = ?, bookReview = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Record updated successfully' });
    }
  );
});

// Delete record
app.delete('/api/demographics/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM demographics WHERE id = ?', id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Record deleted successfully' });
  });
});

// Reset password endpoint
app.post('/api/reset-password', (req, res) => {
  const { username, lastName, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Username and new password are required"
    });
  }

  // Step 1: Look up the user
  const findQuery = `
    SELECT id, lastName
    FROM demographics
    WHERE firstName = ?
  `;

  db.get(findQuery, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Optional: verify last name if provided
    if (lastName && lastName.trim() !== "" && lastName !== user.lastName) {
      return res.status(401).json({
        success: false,
        message: "Last name does not match our records"
      });
    }

    // Step 2: Update password
    const updateQuery = `
      UPDATE demographics
      SET password = ?
      WHERE id = ?
    `;

    db.run(updateQuery, [newPassword, user.id], function (err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      res.json({
        success: true,
        message: "Password updated successfully"
      });
    });
  });
});

//book database
app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`);
    const data = await response.json();

    const books = (data.docs || []).map(doc => ({
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : "Unknown",
      coverId: doc.cover_i || null,
      openLibraryId: doc.key
    }));

    res.json(books);
  } catch (err) {
    console.log("SEARCH ROUTE ERROR:", err);
    res.status(500).json({ error: "Open Library error" });
  }
});

app.post('/api/tbr', (req, res) => {
  const { userId, title, author, coverId, openLibraryId } = req.body;

  const query = `
    INSERT INTO tbr (userId, title, author, coverId, openLibraryId)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [userId, title, author, coverId, openLibraryId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/tbr/:userId', (req, res) => {
  db.all('SELECT * FROM tbr WHERE userId = ?', req.params.userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/tbr/:id', (req, res) => {
  db.run('DELETE FROM tbr WHERE id = ?', req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

//move a book from TBR to Read
app.post('/api/mark-read/:id', (req, res) => {
  const { id } = req.params;

  // Step 1: Get the book from TBR
  db.get('SELECT * FROM tbr WHERE id = ?', [id], (err, book) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!book) return res.status(404).json({ error: "Book not found" });

    // Step 2: Insert into readBooks
    const insertQuery = `
      INSERT INTO readBooks (userId, title, author, coverId, openLibraryId, readAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;

    db.run(
      insertQuery,
      [book.userId, book.title, book.author, book.coverId, book.openLibraryId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Step 3: Remove from TBR
        db.run('DELETE FROM tbr WHERE id = ?', [id], function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      }
    );
  });
});

app.get('/api/read/:userId', (req, res) => {
  db.all('SELECT * FROM readBooks WHERE userId = ?', req.params.userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//lets the frontend send a rating (1–5) for any read book.
app.post('/api/rate/:id', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  db.run(
    'UPDATE readBooks SET rating = ? WHERE id = ?',
    [rating, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json({ success: true, message: 'Rating updated' });
    }
  );
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler - catch-all for server errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});