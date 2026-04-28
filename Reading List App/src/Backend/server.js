const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

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

  // Validate input
  if (!username || !newPassword) {
    return res.status(400).json({ success: false, message: 'Username and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  let query = 'UPDATE demographics SET password = ? WHERE firstName = ?';
  let params = [newPassword, username];

  if (lastName) {
    query = 'UPDATE demographics SET password = ? WHERE firstName = ? AND lastName = ?';
    params = [newPassword, username, lastName];
  }

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  });
});

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});