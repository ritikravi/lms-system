const mongoose = require('mongoose');

const eResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['journal', 'ebook', 'database', 'research_paper', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  accessLevel: {
    type: String,
    enum: ['all', 'student', 'faculty'],
    default: 'all',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('EResource', eResourceSchema);
