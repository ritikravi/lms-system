const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/notice.controller');

router.get('/', getNotices);
router.post('/', protect, authorize('admin', 'librarian'), createNotice);
router.put('/:id', protect, authorize('admin', 'librarian'), updateNotice);
router.delete('/:id', protect, authorize('admin'), deleteNotice);

module.exports = router;
