const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  issueBook, returnBook, renewBook,
  getMyIssues, getAllIssues, getOverdueIssues
} = require('../controllers/issue.controller');

router.get('/my', protect, getMyIssues);
router.get('/overdue', protect, authorize('admin', 'librarian'), getOverdueIssues);
router.get('/', protect, authorize('admin', 'librarian'), getAllIssues);
router.post('/', protect, authorize('admin', 'librarian'), issueBook);
router.put('/:id/return', protect, authorize('admin', 'librarian'), returnBook);
router.put('/:id/renew', protect, renewBook);

module.exports = router;
