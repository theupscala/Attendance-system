const CustomerEntry = require('../models/CustomerEntry');

// @desc    Create a new lead/entry
// @route   POST /api/customer-entries
// @access  Private
const createEntry = async (req, res) => {
  try {
    const { name, company, email, phone, status, source, priority, serviceInterest, budget } = req.body;
    
    const existingEntryByPhone = await CustomerEntry.findOne({ phone });
    if (existingEntryByPhone) {
      return res.status(409).json({ message: 'User with this phone number already exists', existingLead: existingEntryByPhone });
    }

    // Check for exact name match (case-insensitive)
    const existingEntryByName = await CustomerEntry.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingEntryByName) {
      const isClient = existingEntryByName.status === 'QUALIFIED' || existingEntryByName.status === 'QUALIFIED LEAD';
      const location = isClient ? 'Clients' : 'Leads';
      return res.status(409).json({ message: `Name already exists in ${location}` });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const entry = await CustomerEntry.create({
      employeeId: req.user._id,
      name,
      company: company || '-',
      email: email || '-',
      phone,
      status: status || 'NEW LEAD',
      source: source || 'WEBSITE',
      serviceInterest: serviceInterest || '-',
      budget: budget || '-',
      priority: priority || 'WARM',
      photo
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('CREATE LEAD ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leads for logged in user
// @route   GET /api/customer-entries
// @access  Private
const getEmployeeEntries = async (req, res) => {
  try {
    const entries = await CustomerEntry.find({ employeeId: req.user._id })
      .populate('employeeId', 'name employeeId department')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('GET EMPLOYEE LEADS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leads (Admin)
// @route   GET /api/customer-entries/all
// @access  Private/Admin
const getAllEntries = async (req, res) => {
  try {
    const entries = await CustomerEntry.find({})
      .populate('employeeId', 'name employeeId department')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('GET ALL LEADS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lead status
// @route   PUT /api/customer-entries/:id/status
// @access  Private
const updateEntryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const entry = await CustomerEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    entry.status = status;
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('UPDATE LEAD STATUS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead/entry
// @route   DELETE /api/customer-entries/:id
// @access  Private
const deleteEntry = async (req, res) => {
  try {
    const entry = await CustomerEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await entry.deleteOne();
    res.json({ message: 'Lead removed' });
  } catch (error) {
    console.error('DELETE LEAD ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lead photo
// @route   PUT /api/customer-entries/:id/photo
// @access  Private
const updateEntryPhoto = async (req, res) => {
  try {
    const entry = await CustomerEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    entry.photo = `/uploads/${req.file.filename}`;
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('UPDATE LEAD PHOTO ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload bill for a lead
// @route   PUT /api/customer-entries/:id/bills
// @access  Private
const uploadEntryBill = async (req, res) => {
  try {
    const entry = await CustomerEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newBill = {
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname
    };

    entry.bills.push(newBill);
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('UPLOAD BILL ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEntry,
  getEmployeeEntries,
  getAllEntries,
  updateEntryStatus,
  deleteEntry,
  updateEntryPhoto,
  uploadEntryBill
};
