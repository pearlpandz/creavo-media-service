const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Folder name based on field name
    const fieldFolder = {
      media: "uploads/media",
      frame: "uploads/frames",
    };

    const folder = fieldFolder[file.fieldname] || "uploads/others";

    // Ensure the folder exists
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }); // For processing multipart/form-data

// POST method to store frame in DB
router.post("/media", upload.single("media"), async (req, res) => {
  try {
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    const urlPath = path.replace(/\\/g, "/");
    console.log(req.file.path);
    const url = `${req.protocol}://${req.get("host")}/${urlPath}`;
    console.log(url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.post("/frame", upload.single("frame"), async (req, res) => {
  try {
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    const urlPath = path.replace(/\\/g, "/");
    console.log(req.file.path);
    const url = `${req.protocol}://${req.get("host")}/${urlPath}`;
    console.log(url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/:folder/:filename", (req, res) => {
  const foldername = req.params.folder;
  const filename = req.params.filename;
  const filePath = path.join(
    __dirname,
    "..",
    `uploads/${foldername}`,
    filename
  );
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
