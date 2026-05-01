const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getAdminStats, getStudentDashboard, getPublicStats } = require('../controllers/dashboard.controller');

router.get('/public', getPublicStats);
router.get('/admin', protect, authorize('admin', 'librarian'), getAdminStats);
router.get('/student', protect, getStudentDashboard);

module.exports = router;
