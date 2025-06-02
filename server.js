const express = require("express");
const cors = require("cors");
const router = require("./router/upload");

const app = express();
const PORT = process.env.PORT || 4001;

// Enable CORS for specific origins:
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.includes("creavo.in")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if using cookies or Authorization headers
  })
);

// Middleware to parse JSON bodies
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use("/uploads", express.static("uploads", {
  setHeaders: (res, path) => {
      if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.webp')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      }
    }
})); // Serves uploaded files



// Set Cache-Control only for GET requests (from disk cache 200)
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.set('Cache-Control', 'public, max-age=300'); // cache for 5 minutes
//     }
//     next();
// });

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Media Micro Service!" });
});

app.use("/upload", router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
