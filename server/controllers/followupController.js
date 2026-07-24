const Followup = require('../models/Followup');

// @desc    Create a new follow-up
// @route   POST /api/followups
// @access  Private
const createFollowup = async (req, res) => {
  try {
    const { leadId, date, description } = req.body;

    if (!leadId || !date || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const followup = await Followup.create({
      leadId,
      date,
      description
    });

    res.status(201).json(followup);
  } catch (error) {
    console.error('CREATE FOLLOWUP ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all follow-ups (Admin)
// @route   GET /api/followups
// @access  Private/Admin
const getAllFollowups = async (req, res) => {
  try {
    const followups = await Followup.find({})
      .populate('leadId', 'name company email phone status source priority')
      .sort({ date: 1 }); // Sort by upcoming
    res.json(followups);
  } catch (error) {
    console.error('GET ALL FOLLOWUPS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get follow-ups for a specific lead
// @route   GET /api/followups/lead/:leadId
// @access  Private
const getFollowupsByLead = async (req, res) => {
  try {
    const followups = await Followup.find({ leadId: req.params.leadId })
      .sort({ date: 1 });
    res.json(followups);
  } catch (error) {
    console.error('GET LEAD FOLLOWUPS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update follow-up status
// @route   PUT /api/followups/:id/status
// @access  Private
const updateFollowupStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    followup.status = status;
    const updatedFollowup = await followup.save();
    res.json(updatedFollowup);
  } catch (error) {
    console.error('UPDATE FOLLOWUP STATUS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFollowup,
  getAllFollowups,
  getFollowupsByLead,
  updateFollowupStatus
};
