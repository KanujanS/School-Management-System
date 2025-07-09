const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Mark = require('../models/Mark');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  for (let row of data) {
    const student = await User.findOne({ email: row.Email });
    if (student) {
      await Mark.create({
        studentId: student._id,
        subject: row.Subject,
        marks: row.Marks,
        grade: row.Grade
      });
    }
  }

  res.send("Marks uploaded successfully.");
});

module.exports = router;
