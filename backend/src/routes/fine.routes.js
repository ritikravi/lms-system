const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getMyFines, payFine, getAllFines } = require('../controllers/fine.controller');

router.get('/my', protect, getMyFines);
router.get('/', protect, authorize('admin', 'librarian'), getAllFines);
router.put('/:issueId/pay', protect, authorize('admin', 'librarian'), payFine);

module.exports = router;
