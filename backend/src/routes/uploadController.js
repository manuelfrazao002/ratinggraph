const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { handleCoverUpload } = require("../controllers/uploadController");

const router = express.Router();

// 🔧 storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "rating-graph/covers",
    format: "webp",
    public_id: `cover_${req.params.movieId}`,
    transformation: [{ width: 800, crop: "limit", quality: "auto" }],
  }),
});

const upload = multer({ storage });

// 🔥 endpoint
router.post("/cover/:movieId", upload.single("image"), handleCoverUpload);

module.exports = router;