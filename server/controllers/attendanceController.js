const Attendance = require('../models/Attendance');
const fs = require('fs');
const path = require('path');
const reverseGeocode = require('../utils/reverseGeocode');

// Helper to save base64 image to physical file
const saveBase64Image = (base64String, employeeId, type) => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String;
  
  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64String;

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const fileName = `${employeeId}_${type}_${Date.now()}.jpg`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, imageBuffer);
    
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return base64String; // fallback to base64 if save fails
  }
};

// Helper to normalize date to midnight
const getNormalizedDate = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Punch In
// @route   POST /api/attendance/punch-in
// @access  Private
const punchIn = async (req, res) => {
  const { photo, originalSelfie, location, device, isOfflineRecorded, offlineTimestamp } = req.body;
  const punchTime = isOfflineRecorded ? new Date(offlineTimestamp) : new Date();
  const date = getNormalizedDate(punchTime);

  let attendance = await Attendance.findOne({ employeeId: req.user._id, date });
  if (attendance && attendance.punchIn && attendance.punchIn.time) {
    return res.status(400).json({ message: 'Already punched in for today' });
  }

  if (!attendance) {
    attendance = new Attendance({ 
      employeeId: req.user._id, 
      employeeName: req.user.name,
      department: req.user.department,
      date 
    });
  }

  const finalStampedUrl = saveBase64Image(photo, req.user.employeeId, 'stamped_in');
  const finalOriginalUrl = saveBase64Image(originalSelfie, req.user.employeeId, 'original_in');

  // Reverse geocode the GPS coordinates into a readable address
  let address = 'Address Not Available';
  if (location && location.latitude && location.longitude) {
    address = await reverseGeocode(location.latitude, location.longitude);
  }

  attendance.punchIn = {
    time: punchTime,
    photo: finalStampedUrl, // fallback
    attendanceImage: finalStampedUrl,
    originalSelfie: finalOriginalUrl,
    location: {
      latitude: location?.latitude,
      longitude: location?.longitude,
      accuracy: location?.accuracy,
      mapUrl: location?.mapUrl,
      address: address,
    },
    device,
  };
  attendance.status = 'Present';
  attendance.isOfflineRecorded = isOfflineRecorded || false;
  
  await attendance.save();
  res.status(201).json(attendance);
};

// @desc    Punch Out
// @route   POST /api/attendance/punch-out
// @access  Private
const punchOut = async (req, res) => {
  const { photo, originalSelfie, location, device, isOfflineRecorded, offlineTimestamp } = req.body;
  const punchTime = isOfflineRecorded ? new Date(offlineTimestamp) : new Date();
  const date = getNormalizedDate(punchTime);

  const attendance = await Attendance.findOne({ employeeId: req.user._id, date });
  if (!attendance || !attendance.punchIn.time) {
    return res.status(400).json({ message: 'No punch-in record found for today' });
  }
  if (attendance.punchOut && attendance.punchOut.time) {
    return res.status(400).json({ message: 'Already punched out for today' });
  }

  const finalStampedUrl = saveBase64Image(photo, req.user.employeeId, 'stamped_out');
  const finalOriginalUrl = saveBase64Image(originalSelfie, req.user.employeeId, 'original_out');

  // Reverse geocode the GPS coordinates into a readable address
  let address = 'Address Not Available';
  if (location && location.latitude && location.longitude) {
    address = await reverseGeocode(location.latitude, location.longitude);
  }

  attendance.punchOut = {
    time: punchTime,
    photo: finalStampedUrl, // fallback
    attendanceImage: finalStampedUrl,
    originalSelfie: finalOriginalUrl,
    location: {
      latitude: location?.latitude,
      longitude: location?.longitude,
      accuracy: location?.accuracy,
      mapUrl: location?.mapUrl,
      address: address,
    },
    device,
  };
  
  // Calculate Working Hours
  const diffInMs = punchTime - new Date(attendance.punchIn.time);
  const diffInMinutes = Math.floor(diffInMs / 60000);
  
  // Example shift logic (9 AM start, 6 PM end)
  const shiftStartHour = 9;
  const shiftEndHour = 18;
  const expectedWorkingMinutes = (shiftEndHour - shiftStartHour) * 60; // 9 hours = 540 min
  
  // Calculate Late Coming
  const punchInDate = new Date(attendance.punchIn.time);
  let lateMinutes = 0;
  if (punchInDate.getHours() >= shiftStartHour && punchInDate.getMinutes() > 0) {
    lateMinutes = (punchInDate.getHours() - shiftStartHour) * 60 + punchInDate.getMinutes();
  } else if (punchInDate.getHours() > shiftStartHour) {
    lateMinutes = (punchInDate.getHours() - shiftStartHour) * 60 + punchInDate.getMinutes();
  }

  // Calculate Overtime
  let overtimeMinutes = 0;
  if (diffInMinutes > expectedWorkingMinutes) {
    overtimeMinutes = diffInMinutes - expectedWorkingMinutes;
  }

  attendance.calculations = {
    workingHours: diffInMinutes,
    lateMinutes: Math.max(0, lateMinutes),
    overtimeMinutes
  };
  
  await attendance.save();
  res.json(attendance);
};

// @desc    Get employee's attendance history
// @route   GET /api/attendance/me
// @access  Private
const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
  res.json(records);
};

module.exports = { punchIn, punchOut, getMyAttendance };
