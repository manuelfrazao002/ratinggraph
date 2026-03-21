const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { uploadCastImage } = require("../controllers/castController");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `rating-graph/cast/${req.params.entryId}`,
    format: "webp",
    transformation: [{ width: 300, crop: "limit", quality: "auto" }],
  }),
});

const upload = multer({ storage });

// 🔥 criar cast + imagem
router.post("/:entryId", upload.single("image"), uploadCastImage);

module.exports = router;