const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const EResource = require('../models/EResource.model');

router.get('/', async (req, res) => {
  try {
    const { type, department } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (department) query.department = department;
    const resources = await EResource.find(query).sort('-createdAt');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const resource = await EResource.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await EResource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
