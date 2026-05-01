const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true,
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true,
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true,
  },
  subject: {
    type: String,
    trim: true,
    index: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  edition: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'issued', 'reserved', 'lost'],
    default: 'available',
  },
  coverImage: {
    type: String,
    default: '',
  },
  location: {
    rack: String,
    shelf: String,
  },
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Text index for search
bookSchema.index({ title: 'text', author: 'text', subject: 'text', isbn: 'text' });

// Update status based on available copies
bookSchema.pre('save', function () {
  if (this.availableCopies === 0) {
    this.status = 'issued';
  } else {
    this.status = 'available';
  }
});

module.exports = mongoose.model('Book', bookSchema);
