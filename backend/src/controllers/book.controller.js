const Book = require('../models/Book.model');

// @GET /api/books
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [books, total] = await Promise.all([
      Book.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate('addedBy', 'name'),
      Book.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: books,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/books/recent
exports.getRecentBooks = async (req, res) => {
  try {
    const books = await Book.find().sort('-createdAt').limit(10);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/books/:id
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/books
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Book added successfully', data: book });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book updated', data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/books/search
exports.searchBooks = async (req, res) => {
  try {
    const { q, field = 'all' } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    let query = {};
    if (field === 'all') {
      query.$text = { $search: q };
    } else if (field === 'title') {
      query.title = { $regex: q, $options: 'i' };
    } else if (field === 'author') {
      query.author = { $regex: q, $options: 'i' };
    } else if (field === 'isbn') {
      query.isbn = { $regex: q, $options: 'i' };
    } else if (field === 'subject') {
      query.subject = { $regex: q, $options: 'i' };
    }

    const books = await Book.find(query).limit(20);
    res.json({ success: true, data: books, count: books.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
