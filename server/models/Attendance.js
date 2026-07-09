const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String }, // Denormalized for easy searching
  department: { type: String },   // Denormalized for easy filtering
  date: { type: Date, required: true }, // Normalized date (e.g., YYYY-MM-DD 00:00:00)
  
  punchIn: {
    time: { type: Date },
    photo: { type: String }, // Kept for backward compatibility
    originalSelfie: { type: String },
    attendanceImage: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      mapUrl: { type: String },
      address: { type: String }
    },
    device: {
      browser: { type: String },
      os: { type: String },
      ip: { type: String }
    }
  },
  
  punchOut: {
    time: { type: Date },
    photo: { type: String }, // Kept for backward compatibility
    originalSelfie: { type: String },
    attendanceImage: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      mapUrl: { type: String },
      address: { type: String }
    },
    device: {
      browser: { type: String },
      os: { type: String },
      ip: { type: String }
    }
  },
  
  calculations: {
    workingHours: { type: Number, default: 0 }, // in minutes
    lateMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 }
  },
  
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half Day', 'Holiday', 'Leave', 'Casual Leave', 'Weekend'], 
    default: 'Absent' 
  },
  
  // Manual Entry Flags
  isManualEntry: { type: Boolean, default: false },
  manualEntryReason: { type: String },
  manualEnteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Offline Sync Flag
  isOfflineRecorded: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
