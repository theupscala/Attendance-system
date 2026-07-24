const Quote = require('../models/Quote');
const Followup = require('../models/Followup');

// @desc    Create a new quote
// @route   POST /api/quotes
// @access  Private
const createQuote = async (req, res) => {
  try {
    const { leadId, product, model, mrp, discountedPrice } = req.body;

    if (!leadId || !product || !model || !mrp || !discountedPrice) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const quote = await Quote.create({
      leadId,
      product,
      model,
      mrp,
      discountedPrice
    });

    // Automatically generate a followup for this quote
    await Followup.create({
      leadId,
      date: new Date(),
      description: `Generated Quote for ${product} (${model}) - MRP: ₹${mrp}, Discounted: ₹${discountedPrice}`,
      status: 'DONE' // It's a logged activity, so we can consider it "DONE" immediately
    });

    res.status(201).json(quote);
  } catch (error) {
    console.error('CREATE QUOTE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quotes for a specific lead
// @route   GET /api/quotes/lead/:leadId
// @access  Private
const getQuotesByLead = async (req, res) => {
  try {
    const quotes = await Quote.find({ leadId: req.params.leadId })
      .sort({ date: -1 }); // Newest first
    res.json(quotes);
  } catch (error) {
    console.error('GET LEAD QUOTES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuote,
  getQuotesByLead
};
