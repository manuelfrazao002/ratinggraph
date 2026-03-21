const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { uploadEpisodeImages } = require("../controllers/episodeImageController");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `rating-graph/episodes/${req.params.episodeId}`,
      format: "webp",
      transformation: [{ width: 800, crop: "limit", quality: "auto" }],
    };
  },
});

const upload = multer({ storage });

// 🔥 múltiplas imagens
router.post(
  "/:episodeId",
  upload.array("images", 20),
  uploadEpisodeImages
);

module.exports = router;