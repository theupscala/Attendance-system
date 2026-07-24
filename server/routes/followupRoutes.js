const express = require('express');
const router = express.Router();
const { 
  createFollowup, 
  getAllFollowups, 
  getFollowupsByLead, 
  updateFollowupStatus 
} = require('../controllers/followupController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createFollowup)
  .get(protect, admin, getAllFollowups);

router.get('/lead/:leadId', protect, getFollowupsByLead);
router.put('/:id/status', protect, updateFollowupStatus);

module.exports = router;
