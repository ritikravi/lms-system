const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllUsers, getUser, updateProfile, updateUser,
  deleteUser, getUserHistory, changePassword
} = require('../controllers/user.controller');

router.get('/', protect, authorize('admin', 'librarian'), getAllUsers);
router.get('/:id', protect, getUser);
router.get('/:id/history', protect, getUserHistory);
router.put('/profile/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
