const express = require('express');
const router = express.Router();
const { 
  createQuote, 
  getQuotesByLead 
} = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createQuote);
router.get('/lead/:leadId', protect, getQuotesByLead);

module.exports = router;
