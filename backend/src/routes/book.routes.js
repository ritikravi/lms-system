const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllBooks, getBook, createBook, updateBook,
  deleteBook, searchBooks, getRecentBooks
} = require('../controllers/book.controller');

router.get('/search', searchBooks);
router.get('/recent', getRecentBooks);
router.get('/', getAllBooks);
router.get('/:id', getBook);
router.post('/', protect, authorize('admin', 'librarian'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
