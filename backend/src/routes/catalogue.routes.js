const express = require('express');
const router = express.Router();
const Book = require('../models/Book.model');

// Public catalogue with filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, department, status, sort = '-createdAt', search } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [books, total] = await Promise.all([
      Book.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Book.countDocuments(query),
    ]);

    // Get unique departments for filter
    const departments = await Book.distinct('department');

    res.json({
      success: true,
      data: books,
      departments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
