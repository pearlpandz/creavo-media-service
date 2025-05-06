const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `uploads`); // Save files to 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); // Unique timestamp
    const ext = path.extname(file.originalname); // Keep original extension
    const filename = `${timestamp}${ext}`; // Create unique filename
    cb(null, filename); // Unique filename
  },
});

const upload = multer({ storage }); // For processing multipart/form-data

// POST method to store frame in DB
router.post("/", upload.single("media"), async (req, res) => {
  try {
    const filepath = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    res.status(201).json({ url: filepath });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

module.exports = router;
