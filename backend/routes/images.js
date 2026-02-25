// backend/routes/images.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: "duaapwky8",
  api_key: "943211793267165",
  api_secret: "ZnkzL08rrQK7dTpNGl3K4qbYegM"
});

const router = express.Router();

router.get("/all-images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "rating-graph/show/toe/imgs/",
      max_results: 100
    });

    const images = result.resources.map(img => ({
      url: img.secure_url,
      publicId: img.public_id
    }));

    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar imagens" });
  }
});

module.exports = router;