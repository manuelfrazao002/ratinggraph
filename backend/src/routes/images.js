// backend/routes/images.js
const express = require("express");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/all-images/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `rating-graph/show/${movieId}/imgs`,
      max_results: 500,
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