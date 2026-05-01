const Issue = require('../models/Issue.model');
const User = require('../models/User.model');

// @GET /api/fines/my
exports.getMyFines = async (req, res) => {
  try {
    const issues = await Issue.find({
      user: req.user._id,
      $or: [{ fineAmount: { $gt: 0 } }, { status: { $in: ['issued', 'overdue'] } }],
    }).populate('book', 'title author isbn');

    const fines = issues.map(issue => ({
      issueId: issue._id,
      book: issue.book,
      issueDate: issue.issueDate,
      dueDate: issue.dueDate,
      returnDate: issue.returnDate,
      status: issue.status,
      fineAmount: issue.status !== 'returned' ? issue.calculateFine() : issue.fineAmount,
      finePaid: issue.finePaid,
    }));

    const totalUnpaid = fines.filter(f => !f.finePaid).reduce((sum, f) => sum + f.fineAmount, 0);

    res.json({ success: true, data: fines, totalUnpaid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/fines/:issueId/pay  (Admin marks fine as paid)
exports.payFine = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId).populate('user book');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    issue.finePaid = true;
    await issue.save();

    // Update user total fines paid
    await User.findByIdAndUpdate(issue.user._id, {
      $inc: { totalFinesPaid: issue.fineAmount },
    });

    res.json({ success: true, message: 'Fine marked as paid', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/fines  (Admin - all fines)
exports.getAllFines = async (req, res) => {
  try {
    const { paid } = req.query;
    const query = { fineAmount: { $gt: 0 } };
    if (paid !== undefined) query.finePaid = paid === 'true';

    const issues = await Issue.find(query)
      .populate('book', 'title author isbn')
      .populate('user', 'name regNo email department')
      .sort('-createdAt');

    const totalAmount = issues.reduce((sum, i) => sum + i.fineAmount, 0);
    const totalPaid = issues.filter(i => i.finePaid).reduce((sum, i) => sum + i.fineAmount, 0);

    res.json({
      success: true,
      data: issues,
      summary: { totalAmount, totalPaid, totalPending: totalAmount - totalPaid },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
