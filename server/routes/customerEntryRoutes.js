const express = require('express');
const router = express.Router();
const { 
  createEntry, 
  getEmployeeEntries, 
  getAllEntries,
  updateEntryStatus,
  deleteEntry,
  updateEntryPhoto,
  uploadEntryBill
} = require('../controllers/customerEntryController');
const { protect, admin } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.route('/')
  .post(protect, upload.single('photo'), createEntry)
  .get(protect, getEmployeeEntries);

router.get('/all', protect, admin, getAllEntries);

router.put('/:id/status', protect, updateEntryStatus);
router.put('/:id/photo', protect, upload.single('photo'), updateEntryPhoto);
router.put('/:id/bills', protect, upload.single('bill'), uploadEntryBill);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
