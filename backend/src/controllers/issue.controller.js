const Issue = require('../models/Issue.model');
const Book = require('../models/Book.model');
const User = require('../models/User.model');
const { sendEmail } = require('../utils/email');

const ISSUE_LIMIT = parseInt(process.env.ISSUE_LIMIT) || 4;
const ISSUE_DAYS = parseInt(process.env.ISSUE_DAYS) || 14;

// @POST /api/issues  (Admin/Librarian issues a book)
exports.issueBook = async (req, res) => {
  try {
    const { bookId, userId } = req.body;

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId),
    ]);

    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Check user issue limit
    const activeIssues = await Issue.countDocuments({ user: userId, status: { $in: ['issued', 'overdue'] } });
    if (activeIssues >= ISSUE_LIMIT) {
      return res.status(400).json({ success: false, message: `Issue limit of ${ISSUE_LIMIT} books reached` });
    }

    // Check unpaid fines
    const unpaidFines = await Issue.find({ user: userId, fineAmount: { $gt: 0 }, finePaid: false });
    if (unpaidFines.length > 0) {
      return res.status(400).json({ success: false, message: 'Please clear pending fines before issuing new books' });
    }

    const dueDate = new Date(Date.now() + ISSUE_DAYS * 24 * 60 * 60 * 1000);

    const issue = await Issue.create({
      book: bookId,
      user: userId,
      dueDate,
      issuedBy: req.user._id,
    });

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    await issue.populate(['book', 'user']);

    // Send email notification
    try {
      await sendEmail({
        to: user.email,
        subject: 'Book Issued - LMS',
        html: `
          <h2>Book Issued Successfully</h2>
          <p>Hi ${user.name},</p>
          <p><strong>Book:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          <p>Please return the book by the due date to avoid fines (₹${process.env.FINE_PER_DAY || 2}/day).</p>
        `,
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Book issued successfully', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/issues/:id/return  (Return a book)
exports.returnBook = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('book user');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found' });
    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    issue.returnDate = new Date();
    issue.status = 'returned';
    issue.returnedTo = req.user._id;
    issue.fineAmount = issue.calculateFine();
    await issue.save();

    // Increase available copies
    await Book.findByIdAndUpdate(issue.book._id, { $inc: { availableCopies: 1 } });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: issue,
      fine: issue.fineAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/issues/:id/renew
exports.renewBook = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found' });
    if (issue.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Only active issues can be renewed' });
    }
    if (issue.renewCount >= 2) {
      return res.status(400).json({ success: false, message: 'Maximum renewal limit (2) reached' });
    }
    if (issue.fineAmount > 0 && !issue.finePaid) {
      return res.status(400).json({ success: false, message: 'Clear pending fines before renewal' });
    }

    issue.dueDate = new Date(issue.dueDate.getTime() + ISSUE_DAYS * 24 * 60 * 60 * 1000);
    issue.renewCount += 1;
    await issue.save();

    res.json({ success: true, message: 'Book renewed successfully', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/issues/my  (Student's own issues)
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .populate('book', 'title author isbn coverImage')
      .sort('-createdAt');

    // Update fine amounts for active issues
    const updated = issues.map(issue => {
      const obj = issue.toObject();
      if (issue.status !== 'returned') {
        obj.currentFine = issue.calculateFine();
      }
      return obj;
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/issues  (Admin - all issues)
exports.getAllIssues = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('book', 'title author isbn')
        .populate('user', 'name regNo email department')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Issue.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/issues/overdue
exports.getOverdueIssues = async (req, res) => {
  try {
    const overdueIssues = await Issue.find({
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: new Date() },
    })
      .populate('book', 'title author isbn')
      .populate('user', 'name regNo email phone');

    res.json({ success: true, data: overdueIssues, count: overdueIssues.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
