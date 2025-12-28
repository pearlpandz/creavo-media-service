const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");

const UPLOAD_BASE_PATH =
  process.env.UPLOAD_BASE_PATH ||
  "/var/www/dev/backend/media-service/shared/uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Folder name based on field name
    const fieldFolder = {
      media: "media",
      event: "event",
      frame: "frames",
      frametype: "frametypes",
      userdetails: "userdetails",
      other: "other",
    };

    const folderName = fieldFolder[file.fieldname] || "other";
    console.log("UPLOAD_BASE_PATH:", UPLOAD_BASE_PATH);
    console.log("Uploading to folder:", folderName);
    const folder = path.join(UPLOAD_BASE_PATH, folderName);

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

const tryUnlink = async (filePath, retries = 3, delay = 300) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code === "EBUSY" && retries > 0) {
      setTimeout(() => tryUnlink(filePath, retries - 1, delay), delay);
    } else if (err.code !== "ENOENT") {
      console.error("Failed to unlink file:", err.message);
    }
  }
};

// POST method to store frame in DB
router.post("/media", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalImage = req.file;

    // ---- CONFIG (important separation) ----
    const UPLOAD_PUBLIC_PATH = "/uploads";

    const protocol = "https";
    const host = req.get("host");

    // ---------------------------------------

    const baseFileName = path.parse(originalImage.filename).name;

    // ---- DISK PATHS (filesystem only) ----
    const originalDiskPath = path.join(
      UPLOAD_BASE_PATH,
      "media",
      `original_${baseFileName}.webp`
    );

    const thumbnailDiskPath = path.join(
      UPLOAD_BASE_PATH,
      "media",
      `thumb_${baseFileName}.webp`
    );

    // ---- PUBLIC URL PATHS (URL only) ----
    const originalPublicPath = `${UPLOAD_PUBLIC_PATH}/media/original_${baseFileName}.webp`;
    const thumbnailPublicPath = `${UPLOAD_PUBLIC_PATH}/media/thumb_${baseFileName}.webp`;

    const originalUrl = `${protocol}://${host}${originalPublicPath}`;
    const thumbnailUrl = `${protocol}://${host}${thumbnailPublicPath}`;

    // Ensure destination directory exists
    const destinationDir = path.dirname(originalDiskPath);
    ensureDirectoryExists(destinationDir);

    // Save original image
    await sharp(originalImage.path)
      .webp({ quality: 100 })
      .toFile(originalDiskPath);

    // Create thumbnail
    await sharp(originalDiskPath)
      .resize(150)
      .webp({ quality: 70 })
      .toFile(thumbnailDiskPath);

    // Remove temp file
    await tryUnlink(originalImage.path);

    return res.status(200).json({
      url: originalUrl,
      thumbnailUrl: thumbnailUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error uploading!",
      error: error.message,
    });
  }
});


// Modify delete logic to handle both original and thumbnail images
router.delete("/delete/media/:filename", (req, res) => {
  const filename = req.params.filename;
  const folderPath = path.join(UPLOAD_BASE_PATH, "media");

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

router.post("/event", upload.single("event"), async (req, res) => {
  try {
    console.log("api calling...");
    console.log("req.file", req.file);
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    console.log("path", path);
    const urlPath = path.replace(/\\/g, "/");
    console.log("urlPath", urlPath);
    const url = `https://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/event/:filename", (req, res) => {
  const foldername = "event";
  const filename = req.params.filename;
  console.log("delete event file calling", { filename });
  const filePath = path.join(UPLOAD_BASE_PATH, foldername, filename);
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    console.log("File deleted successfully");
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
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
    const url = `https://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/frames/:filename", (req, res) => {
  const foldername = "frames";
  const filename = req.params.filename;
  console.log("delete frame file calling", { filename });
  const filePath = path.join(UPLOAD_BASE_PATH, foldername, filename);
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    console.log("File deleted successfully");
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

router.post("/frametype", upload.single("frametype"), async (req, res) => {
  try {
    console.log("api calling...");
    console.log("req.file", req.file);
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    console.log("path", path);
    const urlPath = path.replace(/\\/g, "/");
    console.log("urlPath", urlPath);
    const url = `https://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/frametype/:filename", (req, res) => {
  const foldername = "frametypes";
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_BASE_PATH, foldername, filename);
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

router.post("/userdetails", upload.single("userdetails"), async (req, res) => {
  try {
    console.log("api calling...");
    console.log("req.file", req.file);
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    console.log("path", path);
    const urlPath = path.replace(/\\/g, "/");
    console.log("urlPath", urlPath);
    const url = `https://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/userdetails/:filename", (req, res) => {
  const foldername = "userdetails";
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_BASE_PATH, foldername, filename);
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

router.post("/other", upload.single("other"), async (req, res) => {
  try {
    console.log("api calling...");
    console.log("req.file", req.file);
    const path = req.file ? req.file.path : "uploads/placeholder-image.jpg";
    console.log("path", path);
    const urlPath = path.replace(/\\/g, "/");
    console.log("urlPath", urlPath);
    const url = `https://${req.get("host")}/${urlPath}`;
    console.log("url", url);
    res.status(200).json({ path: urlPath, url });
  } catch (error) {
    res.status(500).json({ message: "Error uploading!", error: error.message });
  }
});

router.delete("/delete/other/:filename", (req, res) => {
  const foldername = "other";
  const filename = req.params.filename;
  console.log("delete other file calling", { filename });
  const filePath = path.join(UPLOAD_BASE_PATH, foldername, filename);
  console.log("filePath", filePath);
  if (fs.existsSync(filePath)) {
    console.log("File exists, deleting...");
    fs.unlinkSync(filePath);
    console.log("File deleted successfully");
    return res.status(200).json({ message: "Deleted successfully" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
