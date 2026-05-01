const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reservationDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  },
  status: {
    type: String,
    enum: ['pending', 'ready', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending',
  },
  notified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
