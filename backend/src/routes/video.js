const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const {
  uploadVideo,
  likeVideo,
  reactToVideo,
  deleteVideo,
} = require("../controllers/videoController");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `rating-graph/videos/${req.params.entryId}`,
    format: "webp",
    transformation: [{ width: 500, crop: "limit", quality: "auto" }],
  }),
});

const upload = multer({ storage });

// 🔥 criar video + thumbnail
router.post("/:entryId", upload.single("thumbnail"), uploadVideo);
router.post("/like/:videoId", likeVideo);
router.post("/react/:videoId", reactToVideo);
router.delete("/videos/:id", deleteVideo);

module.exports = router;
