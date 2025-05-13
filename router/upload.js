const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");

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

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// POST method to store frame in DB
router.post("/media", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalImage = req.file;

    // Add a unique identifier to the original file name
    const originalPath = path.join(
      __dirname,
      "..",
      "uploads/media",
      `original_${originalImage.filename}`
    );
    const url = `${req.protocol}://${req.get("host")}/uploads/media/original_${
      originalImage.filename
    }`;

    // Update the thumbnail path accordingly
    const thumbnailPath = path.join(
      __dirname,
      "..",
      "uploads/media",
      `thumb_${originalImage.filename}`
    );

    // Ensure the destination directory exists before moving the file
    const destinationDir = path.dirname(originalPath);

    try {
      ensureDirectoryExists(destinationDir);
    } catch (err) {
      return res.status(500).json({
        message: "Failed to ensure destination directory",
        error: err.message,
      });
    }

    // Attempt to move the file
    try {
      fs.renameSync(req.file.path, originalPath);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to save original image", error: err.message });
    }

    await sharp(originalPath).resize(150).toFile(thumbnailPath);

    const thumbnailUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/media/thumb_${originalImage.filename}`;

    // Clean up the original temporary file (if it's still there)
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      url,
      thumbnailUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

// Modify delete logic to handle both original and thumbnail images
router.delete("/delete/media/:filename", (req, res) => {
  const filename = req.params.filename;
  const folderPath = path.join(__dirname, "..", "uploads/media");

  // Extract the unique part of the filename
  const uniquePart = filename.split("_")[1];
  const originalFilePath = path.join(folderPath, filename);
  const thumbFilePath = path.join(folderPath, `thumb_${uniquePart}`);

  let deletedFiles = [];

  // Delete original file if it exists
  if (fs.existsSync(originalFilePath)) {
    fs.unlinkSync(originalFilePath);
    deletedFiles.push(filename);
  } else {
    console.log("Original file not found:", originalFilePath);
  }

  // Delete thumbnail file if it exists
  if (fs.existsSync(thumbFilePath)) {
    fs.unlinkSync(thumbFilePath);
    deletedFiles.push(`thumb_${uniquePart}`);
  } else {
    console.log("Thumbnail file not found:", thumbFilePath);
  }

  if (deletedFiles.length > 0) {
    return res
      .status(200)
      .json({ message: "Deleted successfully", deletedFiles });
  } else {
    return res.status(404).json({ error: "Files not found" });
  }
});

router.post("/frame", upload.single("frame"), async (req, res) => {
  try {
    console.log("api calling...");
    console.log("req.file", req.file);
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    console.log("path", path);
    const urlPath = path.replace(/\\/g, "/");
    console.log("urlPath", urlPath);
    const url = `${req.protocol}://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/frame/:filename", (req, res) => {
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
