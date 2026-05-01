const Issue = require('../models/Issue.model');

// Run daily to update overdue status and fine amounts
exports.calculateDailyFines = async () => {
  try {
    const overdueIssues = await Issue.find({
      status: 'issued',
      dueDate: { $lt: new Date() },
    });

    for (const issue of overdueIssues) {
      issue.status = 'overdue';
      issue.fineAmount = issue.calculateFine();
      await issue.save();
    }

    console.log(`✅ Updated ${overdueIssues.length} overdue issues`);
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
  }
};
