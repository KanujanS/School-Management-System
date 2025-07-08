const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  marks: Number,
  grade: String
});

module.exports = mongoose.model('Mark', markSchema);
