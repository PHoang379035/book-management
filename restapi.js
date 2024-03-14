const express = require('express');
const connection = require('./db');

const app = express();

app.use(express.json());

// Get all books
app.get('/books', (req, res) => {
  connection.query('SELECT * FROM books', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get a book by ID
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  connection.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(results[0]);
  });
});

// Create a new book
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  connection.query('INSERT INTO books (title, author) VALUES (?, ?)', [title, author], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId });
  });
});

// Update a book
app.put('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author } = req.body;
  connection.query('UPDATE books SET title = ?, author = ? WHERE id = ?', [title, author, bookId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: 'Book updated successfully' });
  });
});

// Delete a book
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  connection.query('DELETE FROM books WHERE id = ?', [bookId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`REST API server running at http://localhost:${port}`);
});