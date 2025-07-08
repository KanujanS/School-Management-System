const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  status: { type: String, enum: ['Present', 'Absent', 'Late'] }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
