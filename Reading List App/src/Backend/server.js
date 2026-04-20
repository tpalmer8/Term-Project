const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/demographics.db');
// Create the demographics table if it doesn't exist
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
bookReview TEXT )
`);

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/demographics', (req, res) => {
    const { firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview } = req.body;
    const query = ` INSERT INTO demographics (firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview) VALUES (?, ?, ?, ?, ?, ?, ?, ?) `;
    db.run(query, [firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ id: this.lastID });
    });
});

app.get('/api/demographics', (req, res) => {
    db.all('SELECT * FROM demographics', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/demographics/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview } = req.body;
    const query = `
    UPDATE demographics SET firstName = ?, lastName = ?, password = ?, bookTitle = ?, ISBN = ?, rating = ?, bookCategory = ?, bookReview = ?
    WHERE id = ?
    `;
    db.run(query, [firstName, lastName, password, bookTitle, ISBN, rating, bookCategory, bookReview], function (err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Record updated successfully' });
    });
});

app.delete('/api/demographics/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM demographics WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Record deleted successfully' });
    });
});