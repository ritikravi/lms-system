const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['general', 'holiday', 'event', 'alert', 'policy'],
    default: 'general',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiryDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
