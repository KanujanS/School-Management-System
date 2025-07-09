const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  file: String,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
