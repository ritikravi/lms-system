const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
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
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue', 'lost'],
    default: 'issued',
  },
  renewCount: {
    type: Number,
    default: 0,
    max: 2, // max 2 renewals
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  finePaid: {
    type: Boolean,
    default: false,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // librarian/admin who issued
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // librarian/admin who accepted return
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Calculate fine based on overdue days
issueSchema.methods.calculateFine = function () {
  const finePerDay = parseInt(process.env.FINE_PER_DAY) || 2;
  if (this.status === 'returned' && this.returnDate) {
    const overdueDays = Math.max(
      0,
      Math.floor((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24))
    );
    return overdueDays * finePerDay;
  }
  if (this.status !== 'returned') {
    const today = new Date();
    const overdueDays = Math.max(
      0,
      Math.floor((today - this.dueDate) / (1000 * 60 * 60 * 24))
    );
    return overdueDays * finePerDay;
  }
  return 0;
};

module.exports = mongoose.model('Issue', issueSchema);
