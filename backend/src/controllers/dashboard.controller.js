const Book = require('../models/Book.model');
const Issue = require('../models/Issue.model');
const User = require('../models/User.model');
const Notice = require('../models/Notice.model');

// @GET /api/dashboard/stats  (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalBooks,
      totalUsers,
      activeIssues,
      overdueIssues,
      todayIssues,
      totalFinesPending,
      recentBooks,
      recentIssues,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Issue.countDocuments({ status: { $in: ['issued', 'overdue'] } }),
      Issue.countDocuments({ status: { $in: ['issued', 'overdue'] }, dueDate: { $lt: new Date() } }),
      Issue.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: { $in: ['issued', 'overdue'] },
      }),
      Issue.aggregate([
        { $match: { fineAmount: { $gt: 0 }, finePaid: false } },
        { $group: { _id: null, total: { $sum: '$fineAmount' } } },
      ]),
      Book.find().sort('-createdAt').limit(5),
      Issue.find({ status: { $in: ['issued', 'overdue'] } })
        .populate('book', 'title author')
        .populate('user', 'name regNo')
        .sort('-createdAt')
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks,
          totalUsers,
          activeIssues,
          overdueIssues,
          todayIssues,
          pendingFines: totalFinesPending[0]?.total || 0,
        },
        recentBooks,
        recentIssues,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/dashboard/student  (Student dashboard)
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [activeIssues, readingHistory, pendingFines, notices, recentBooks] = await Promise.all([
      Issue.find({ user: userId, status: { $in: ['issued', 'overdue'] } })
        .populate('book', 'title author isbn coverImage')
        .sort('dueDate'),
      Issue.find({ user: userId, status: 'returned' })
        .populate('book', 'title author isbn coverImage')
        .sort('-returnDate')
        .limit(5),
      Issue.find({ user: userId, fineAmount: { $gt: 0 }, finePaid: false }),
      Notice.find({ isActive: true }).sort('-createdAt').limit(4),
      Book.find().sort('-createdAt').limit(5),
    ]);

    const totalPendingFine = pendingFines.reduce((sum, i) => sum + i.calculateFine(), 0);

    res.json({
      success: true,
      data: {
        activeIssues,
        readingHistory,
        totalPendingFine,
        notices,
        recentBooks,
        stats: {
          booksIssued: activeIssues.length,
          booksRead: readingHistory.length,
          pendingFine: totalPendingFine,
          issueLimit: parseInt(process.env.ISSUE_LIMIT) || 4,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/dashboard/public  (Public stats for homepage)
exports.getPublicStats = async (req, res) => {
  try {
    const [totalBooks, totalUsers, notices, recentBooks] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Notice.find({ isActive: true }).sort('-createdAt').limit(4),
      Book.find().sort('-createdAt').limit(5),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: totalBooks || 120000,
          eJournals: 5400,
          registeredUsers: totalUsers || 28000,
          dailyIssues: 350,
        },
        notices,
        recentBooks,
        libraryTimings: {
          weekdays: '8:00 AM – 10:00 PM',
          saturday: '9:00 AM – 6:00 PM',
          issueLimit: `${process.env.ISSUE_LIMIT || 4} books per student (${process.env.ISSUE_DAYS || 14} days)`,
          fine: `₹${process.env.FINE_PER_DAY || 2} per day per book after due date`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
